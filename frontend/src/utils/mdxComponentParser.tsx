import FunctionVisualizer from '../components/3d/FunctionVisualizer';
import type { FunctionVisualizerProps } from '../types/3d';

/**
 * Parse and replace custom 3D component tags in HTML content with rendered React components
 */

interface ComponentMatch {
  fullMatch: string;
  props: Record<string, any>;
  startIndex: number;
  endIndex: number;
}

/**
 * Extract props from a custom HTML tag
 */
function extractPropsFromTag(tagContent: string): Record<string, any> {
  const props: Record<string, any> = {};
  
  // Match attribute="value" or attribute='value' or attribute={value} or attribute={{value}}
  const attrRegex = /(\w+)=(?:"([^"]*)"|'([^']*)'|\{(\{[^}]*\}|[^}]*)\})/g;
  let match;
  
  while ((match = attrRegex.exec(tagContent)) !== null) {
    const [, key, doubleQuoteValue, singleQuoteValue, braceValue] = match;
    let value: any;
    
    if (doubleQuoteValue !== undefined) {
      value = doubleQuoteValue;
    } else if (singleQuoteValue !== undefined) {
      value = singleQuoteValue;
    } else if (braceValue !== undefined) {
      // Handle double braces {{}} by removing outer braces
      let processedBraceValue = braceValue;
      if (braceValue.startsWith('{') && braceValue.endsWith('}')) {
        processedBraceValue = braceValue.slice(1, -1);
      }
      
      // Try to parse as JSON for objects/arrays, or as primitives
      try {
        if (processedBraceValue === 'true') value = true;
        else if (processedBraceValue === 'false') value = false;
        else if (/^-?\d+(\.\d+)?$/.test(processedBraceValue)) value = parseFloat(processedBraceValue);
        else if (processedBraceValue.startsWith('[') || processedBraceValue.startsWith('{')) {
          value = JSON.parse(processedBraceValue);
        } else {
          value = processedBraceValue;
        }
      } catch {
        value = braceValue;
      }
    }
    
    props[key] = value;
  }
  
  return props;
}

/**
 * Find all FunctionVisualizer components in HTML content
 */
function findFunctionVisualizerTags(content: string): ComponentMatch[] {
  const matches: ComponentMatch[] = [];
  
  // Match both self-closing and regular tags
  const regex = /<FunctionVisualizer([^>]*?)(?:\s*\/?>|>(.*?)<\/FunctionVisualizer>)/gs;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const [fullMatch, attributesString] = match;
    const startIndex = match.index;
    const endIndex = startIndex + fullMatch.length;
    
    const props = extractPropsFromTag(attributesString);
    
    matches.push({
      fullMatch,
      props,
      startIndex,
      endIndex
    });
  }
  
  return matches.reverse(); // Reverse to replace from end to beginning (avoid index shifting)
}

/**
 * Render a FunctionVisualizer component to HTML string
 */
function renderFunctionVisualizerToHTML(props: Record<string, any>): string {
  // Validate and set default props - handle domain parsing first
  let parsedDomain: { x: [number, number]; y: [number, number] } = { x: [-5, 5], y: [-5, 5] }; // Default fallback
  
  console.log('=== DOMAIN DEBUG in mdxComponentParser ===');
  console.log('Raw props.domain:', props.domain);
  console.log('typeof props.domain:', typeof props.domain);
  console.log('All props:', props);
  
  if (props.domain) {
    if (typeof props.domain === 'string') {
      console.log('Parsing domain as string:', props.domain);
      try {
        const parsed = JSON.parse(props.domain);
        console.log('Parsed domain object:', parsed);
        if (parsed && parsed.x && parsed.y && Array.isArray(parsed.x) && Array.isArray(parsed.y)) {
          parsedDomain = {
            x: [parsed.x[0] || -5, parsed.x[1] || 5] as [number, number],
            y: [parsed.y[0] || -5, parsed.y[1] || 5] as [number, number]
          };
          console.log('Successfully parsed domain from string:', parsedDomain);
        } else {
          console.log('Parsed domain is invalid structure:', parsed);
        }
      } catch (error) {
        console.warn('Failed to parse domain string:', props.domain, error);
      }
    } else if (typeof props.domain === 'object' && props.domain.x && props.domain.y) {
      console.log('Domain is already an object:', props.domain);
      parsedDomain = {
        x: Array.isArray(props.domain.x) ? [props.domain.x[0] ?? -5, props.domain.x[1] ?? 5] as [number, number] : [-5, 5],
        y: Array.isArray(props.domain.y) ? [props.domain.y[0] ?? -5, props.domain.y[1] ?? 5] as [number, number] : [-5, 5]
      };
      console.log('Used object domain:', parsedDomain);
    } else {
      console.log('Domain object is invalid structure:', props.domain);
    }
  } else {
    console.log('No domain prop found, using default');
  }
  
  console.log('Final parsedDomain:', parsedDomain);
  
  const validatedProps: FunctionVisualizerProps = {
    function: props.function || props.func || 'x^2 + y^2',
    domain: parsedDomain,
    resolution: props.resolution ? parseInt(props.resolution) : 50,
    showWireframe: props.showWireframe === true || props.showWireframe === 'true',
    colorScheme: props.colorScheme || 'viridis',
    height: props.height || '400px',
    cameraPosition: props.cameraPosition || [5, 5, 5],
    enableControls: props.enableControls !== false && props.enableControls !== 'false',
    zRange: props.zRange || undefined
  };

  // Parse cameraPosition if it's a string
  if (typeof validatedProps.cameraPosition === 'string') {
    try {
      validatedProps.cameraPosition = JSON.parse(validatedProps.cameraPosition) as [number, number, number];
    } catch {
      validatedProps.cameraPosition = [5, 5, 5];
    }
  }

  // Parse zRange if it's a string
  if (typeof validatedProps.zRange === 'string') {
    try {
      validatedProps.zRange = JSON.parse(validatedProps.zRange) as [number, number];
    } catch {
      validatedProps.zRange = undefined;
    }
  }

  try {
    // Create a wrapper div with a unique ID for client-side hydration
    const componentId = `function-viz-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store the props for client-side hydration
    const propsScript = `
      <script type="application/json" class="function-viz-props" data-component-id="${componentId}">
        ${JSON.stringify(validatedProps)}
      </script>
    `;
    
    // Create a placeholder div that will be replaced on the client side
    return `
      <div class="function-visualizer-container" data-component-id="${componentId}">
        <div class="function-visualizer-placeholder bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center" style="height: ${validatedProps.height}">
          <div class="flex items-center justify-center h-full">
            <div>
              <div class="text-gray-600 dark:text-gray-400 mb-2">
                Loading 3D visualization...
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-500">
                Function: <code class="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">${validatedProps.function}</code>
              </div>
            </div>
          </div>
        </div>
        ${propsScript}
      </div>
    `;
  } catch (error) {
    console.error('Error rendering FunctionVisualizer:', error);
    return `
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div class="text-red-600 dark:text-red-400 font-medium">
          Error: Failed to render 3D function visualization
        </div>
        <div class="text-sm text-red-500 dark:text-red-300 mt-2">
          ${error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    `;
  }
}

/**
 * Process HTML content to replace custom component tags with rendered components
 * This version works with the new backend architecture where components are extracted
 * and replaced with generic mdx-component markers
 */
export function processMDXComponents(content: string, components: any[] = []): string {
  if (!content) return '';
  
  let processedContent = content;
  
  // Debug: Log the content and components being processed
  console.log('processMDXComponents called with content length:', content.length);
  console.log('Components provided:', components.length);
  components.forEach((comp, index) => {
    console.log(`Component ${index}:`, comp.name, comp.props);
  });
  
  // Find FunctionVisualizer components in the components array
  const functionVisualizerComponents = components.filter(comp => comp.name === 'FunctionVisualizer');
  console.log('Found FunctionVisualizer components:', functionVisualizerComponents.length);
  
  // Replace mdx-component markers with rendered components
  functionVisualizerComponents.forEach((component, index) => {
    // Find the corresponding mdx-component div in the HTML
    const componentId = `component_${index}`;
    const markerRegex = new RegExp(`<div class="mdx-component" data-component-id="${componentId}"></div>`, 'g');
    
    const renderedHTML = renderFunctionVisualizerToHTML(component.props);
    processedContent = processedContent.replace(markerRegex, renderedHTML);
  });
  
  return processedContent;
}

/**
 * Client-side hydration function to replace placeholders with actual React components
 * This should be called after the HTML is rendered to the DOM
 */
export function hydrateMDXComponents(): void {
  console.log('hydrateMDXComponents called');
  
  // Import React and ReactDOM at the top level
  import('react').then(React => {
    import('react-dom/client').then(ReactDOM => {
      const containers = document.querySelectorAll('.function-visualizer-container');
      console.log('Found containers for hydration:', containers.length);
      
      containers.forEach(container => {
        const componentId = container.getAttribute('data-component-id');
        if (!componentId) return;
        
        const propsScript = container.querySelector(`script[data-component-id="${componentId}"]`);
        if (!propsScript) return;
        
        try {
          const props = JSON.parse(propsScript.textContent || '{}');
          
          // Remove the placeholder first
          const placeholder = container.querySelector('.function-visualizer-placeholder');
          if (placeholder) {
            placeholder.remove();
          }
          
          // Create the React component directly in the container
          const root = ReactDOM.createRoot(container);
          root.render(React.createElement(FunctionVisualizer, props));
          
          // Remove the props script
          propsScript.remove();
          
        } catch (error) {
          console.error('Error hydrating FunctionVisualizer component:', error);
          // Show error in the container
          container.innerHTML = `
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div class="text-red-600 dark:text-red-400 font-medium">
                Error: Failed to render 3D visualization
              </div>
              <div class="text-sm text-red-500 dark:text-red-300 mt-2">
                ${error instanceof Error ? error.message : 'Unknown error during hydration'}
              </div>
            </div>
          `;
        }
      });
    }).catch(error => {
      console.error('Error importing ReactDOM:', error);
    });
  }).catch(error => {
    console.error('Error importing React:', error);
  });
}
