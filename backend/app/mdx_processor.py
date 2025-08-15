"""
MDX Content Processor
Handles parsing MDX files and extracting component information
"""

import re
import json
import frontmatter
import markdown

from pathlib import Path
from typing import Dict, List, Any, Optional

class MDXProcessor:
    def __init__(self, content_dir: Path):
        self.content_dir = content_dir
        self.component_pattern = re.compile(
            r'<(\w+)(?:\s+([^>]+))?(?:\s*/>|>(.*?)</\1>)',
            re.DOTALL
        )
        self.markdown_processor = markdown.Markdown(
            extensions=[
                'toc',
                'codehilite',
                'tables',
                'pymdownx.superfences',
                'pymdownx.highlight',
                'pymdownx.inlinehilite',
                'pymdownx.snippets',
                'pymdownx.tabbed',
            ]
        )
    
    def parse_component_props(self, props_string: str) -> Dict[str, Any]:
        """Parse component props from JSX-style attribute string"""
        if not props_string:
            return {}
        
        props = {}
        # Handle quoted props like prop="value"
        quoted_pattern = re.compile(r'(\w+)=(?:"([^"]*)"|\{([^}]*)\}|([^\s]+))')
        matches = quoted_pattern.findall(props_string)
        
        for match in matches:
            prop_name = match[0]
            # Check which group matched (quoted string, JS expression, or unquoted)
            prop_value = match[1] or match[2] or match[3]
            
            # Try to parse as JSON if it looks like a JS expression
            if prop_value.startswith('{') and prop_value.endswith('}'):
                try:
                    prop_value = json.loads(prop_value)
                except json.JSONDecodeError:
                    pass
            elif prop_value.startswith('[') and prop_value.endswith(']'):
                try:
                    prop_value = json.loads(prop_value)
                except json.JSONDecodeError:
                    pass
            elif prop_value.lower() in ('true', 'false'):
                prop_value = prop_value.lower() == 'true'
            elif prop_value.isdigit():
                prop_value = int(prop_value)
            
            props[prop_name] = prop_value
        
        return props
    
    def extract_components(self, content: str) -> List[Dict[str, Any]]:
        """Extract React components and their props from MDX content"""
        components = []
        matches = self.component_pattern.finditer(content)
        
        for i, match in enumerate(matches):
            component_name = match.group(1)
            props_string = match.group(2) or ''
            children = match.group(3) or ''
            
            # Skip HTML tags (lowercase), only process React components (PascalCase)
            if not component_name[0].isupper():
                continue
                
            props = self.parse_component_props(props_string)
            
            component_info = {
                'id': f'component_{i}',
                'name': component_name,
                'props': props,
                'children': children.strip() if children else None,
                'position': match.span(),
            }
            components.append(component_info)
        
        return components
    
    def process_mdx_content(self, content: str) -> Dict[str, Any]:
        """Process MDX content and return structured data"""
        # Extract components first
        components = self.extract_components(content)
        
        # Replace components with placeholders for markdown processing
        processed_content = content
        for i, component in enumerate(components):
            start, end = component['position']
            placeholder = f'<!--COMPONENT_{i}-->'
            processed_content = (
                processed_content[:start] + 
                placeholder + 
                processed_content[end:]
            )
            # Adjust positions for subsequent components
            adjustment = len(placeholder) - (end - start)
            for j in range(i + 1, len(components)):
                old_start, old_end = components[j]['position']
                components[j]['position'] = (old_start + adjustment, old_end + adjustment)
        
        # Process markdown
        html_content = self.markdown_processor.convert(processed_content)
        
        # Replace placeholders with component markers
        for i, component in enumerate(components):
            component_marker = f'<div class="mdx-component" data-component-id="{component["id"]}"></div>'
            html_content = html_content.replace(f'<!--COMPONENT_{i}-->', component_marker)
        
        return {
            'html': html_content,
            'components': components,
            'toc': getattr(self.markdown_processor, 'toc', ''),
        }
    
    def load_mdx_file(self, filepath: Path) -> Optional[Dict[str, Any]]:
        """Load and process an MDX file"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                post = frontmatter.load(f)
            
            processed = self.process_mdx_content(post.content)
            
            return {
                'metadata': post.metadata,
                'content': processed['html'],
                'components': processed['components'],
                'toc': processed['toc'],
                'raw_content': post.content,
            }
        except Exception as e:
            print(f"Error processing {filepath}: {e}")
            return None
    
    def get_available_components(self) -> Dict[str, List[str]]:
        """Get list of available components by category"""
        components_dir = self.content_dir / 'components'
        available = {
            'visualizations': [],
            'charts': [],
            'common': []
        }
        
        for category in available.keys():
            category_dir = components_dir / category
            if category_dir.exists():
                for file_path in category_dir.glob('*.jsx'):
                    component_name = file_path.stem
                    available[category].append(component_name)
        
        return available
    
    def load_data_file(self, filename: str) -> Optional[Dict[str, Any]]:
        """Load a JSON data file for visualizations"""
        data_path = self.content_dir / 'data' / filename
        try:
            with open(data_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading data file {filename}: {e}")
            return None
