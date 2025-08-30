/**
 * Content processing utilities for blog post HTML content
 */

export interface TypographyConfig {
  className: string;
  maxWidth?: string;
  colorScheme?: "light" | "dark" | "auto";
}

export interface PostContentProps {
  content: string;
  typography?: TypographyConfig;
}

/**
 * Process HTML content for better typography rendering
 * @param content - Raw HTML content from backend
 * @returns Processed HTML content
 */
export function processContentForTypography(content: string): string {
  if (!content) return "";

  let processedContent = content;

  // Extract and preserve code blocks before processing
  const codeBlocks: string[] = [];
  const codeBlockPlaceholder = "___CODE_BLOCK_PLACEHOLDER___";
  
  // Match both <pre><code>...</code></pre> and standalone <code> blocks
  processedContent = processedContent.replace(
    /<pre[^>]*>[\s\S]*?<\/pre>|<code[^>]*>[\s\S]*?<\/code>/g,
    (match) => {
      codeBlocks.push(match);
      return `${codeBlockPlaceholder}${codeBlocks.length - 1}${codeBlockPlaceholder}`;
    }
  );

  // Now safely process typography without affecting code blocks
  // Add proper paragraph spacing - ensure line breaks become proper paragraphs
  processedContent = processedContent
    .replace(/\n\n+/g, "</p><p>") // Convert double line breaks to paragraph breaks
    .replace(/\n/g, " ") // Convert single line breaks to spaces
    .replace(/^/, "<p>") // Add opening paragraph tag at start
    .replace(/$/, "</p>"); // Add closing paragraph tag at end

  // Fix nested paragraph issues
  processedContent = processedContent
    .replace(/<p><p>/g, "<p>")
    .replace(/<\/p><\/p>/g, "</p>")
    .replace(/<p><\/p>/g, ""); // Remove empty paragraphs

  // Restore code blocks
  codeBlocks.forEach((codeBlock, index) => {
    const placeholder = `${codeBlockPlaceholder}${index}${codeBlockPlaceholder}`;
    processedContent = processedContent.replace(placeholder, codeBlock);
  });

  // Enhance headings with anchor links for navigation
  processedContent = processedContent.replace(
    /<(h[1-6])([^>]*)>(.*?)<\/h[1-6]>/g,
    (_match, tag, attrs, content) => {
      const id = content
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .trim();
      return `<${tag}${attrs} id="${id}">${content}</${tag}>`;
    }
  );

  // Enhance links with proper attributes
  processedContent = processedContent.replace(
    /<a\s+([^>]*href=["']([^"']*?)["'][^>]*)>(.*?)<\/a>/g,
    (_match, attrs, href, linkText) => {
      // Check if it's an external link
      const isExternal =
        href.startsWith("http") && !href.includes(window.location.hostname);
      const externalAttrs = isExternal
        ? 'target="_blank" rel="noopener noreferrer"'
        : "";

      // Preserve existing attributes and add external link attributes if needed
      return `<a ${attrs} ${externalAttrs}>${linkText}</a>`;
    }
  );

  // Enhance images with better attributes
  processedContent = processedContent.replace(
    /<img([^>]+)>/g,
    (_match, attrs) => {
      // Add loading="lazy" if not already present
      if (!attrs.includes("loading=")) {
        attrs += ' loading="lazy"';
      }

      // Add decoding="async" for better performance
      if (!attrs.includes("decoding=")) {
        attrs += ' decoding="async"';
      }

      return `<img${attrs}>`;
    }
  );

  // Enhance code blocks
  processedContent = processedContent.replace(
    /<pre><code([^>]*)>(.*?)<\/code><\/pre>/gs,
    (_match, attrs, code) => {
      // Extract language from class attribute if present
      const languageMatch = attrs.match(
        /class=["']([^"']*language-([^"'\s]*)[^"']*)["']/
      );
      const language = languageMatch ? languageMatch[2] : "";
      const languageClass = language ? ` data-language="${language}"` : "";

      return `<pre${languageClass}><code${attrs}>${code}</code></pre>`;
    }
  );

  // Enhance blockquotes
  processedContent = processedContent.replace(
    /<blockquote([^>]*)>(.*?)<\/blockquote>/gs,
    (_match, attrs, content) => {
      return `<blockquote${attrs} role="blockquote">${content}</blockquote>`;
    }
  );

  // Enhance tables with better accessibility
  processedContent = processedContent.replace(
    /<table([^>]*)>/g,
    '<table$1 role="table">'
  );

  return processedContent;
}

/**
 * Process image URLs to use the correct backend static path
 * @param content - HTML content containing image references
 * @param apiBaseUrl - Base URL for the API (default: current origin)
 * @returns Content with processed image URLs
 */
export function processImageUrls(
  content: string,
  apiBaseUrl: string = window.location.origin
): string {
  if (!content) return "";

  // Replace relative image paths with absolute URLs pointing to backend static files
  return content.replace(
    /(<img[^>]+src=["'])(?!https?:\/\/)([^"']+)(["'][^>]*>)/g,
    (_match, prefix, src, suffix) => {
      // Handle paths that start with /static/ or are relative
      let processedSrc = src;

      if (src.startsWith("/")) {
        // Absolute path starting with /, use as-is but ensure it points to backend
        processedSrc = `${apiBaseUrl}${src}`;
      } else if (!src.startsWith("http")) {
        // Relative path, prepend with static media path
        processedSrc = `${apiBaseUrl}/static/media/${src}`;
      }

      return `${prefix}${processedSrc}${suffix}`;
    }
  );
}

/**
 * Get default typography configuration
 * @param size - Typography size variant
 * @returns Default typography configuration
 */
export function getDefaultTypographyConfig(
  size: "sm" | "base" | "lg" | "xl" = "base"
): TypographyConfig {
  const sizeClasses = {
    sm: "prose-sm",
    base: "prose",
    lg: "prose-lg",
    xl: "prose-xl",
  };

  return {
    className: `${sizeClasses[size]} max-w-none`,
    maxWidth: "none",
    colorScheme: "auto",
  };
}

/**
 * Apply typography configuration to content wrapper
 * @param config - Typography configuration
 * @returns CSS class string for typography
 */
export function getTypographyClasses(config?: TypographyConfig): string {
  const defaultConfig = getDefaultTypographyConfig("lg");
  const finalConfig = { ...defaultConfig, ...config };

  let classes = finalConfig.className;

  // Add responsive classes
  classes += " prose-sm:text-sm md:prose-lg lg:prose-xl";

  // Add color scheme classes if specified
  if (finalConfig.colorScheme === "dark") {
    classes += " prose-invert";
  }

  return classes;
}

/**
 * Extract reading time estimate from content
 * @param content - HTML content
 * @param wordsPerMinute - Average reading speed (default: 200 wpm)
 * @returns Reading time in minutes
 */
export function calculateReadingTime(
  content: string,
  wordsPerMinute: number = 200
): number {
  if (!content) return 0;

  // Strip HTML tags and get plain text
  const plainText = content.replace(/<[^>]*>/g, "");

  // Count words (split by whitespace and filter empty strings)
  const wordCount = plainText
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  // Calculate reading time in minutes, minimum 1 minute
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Extract headings from content for table of contents generation
 * @param content - HTML content
 * @returns Array of heading objects with text, level, and id
 */
export function extractHeadings(
  content: string
): Array<{ text: string; level: number; id: string }> {
  if (!content) return [];

  const headingRegex =
    /<h([1-6])([^>]*?)id=["']([^"']*?)["'][^>]*?>(.*?)<\/h[1-6]>/g;
  const headings: Array<{ text: string; level: number; id: string }> = [];

  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = parseInt(match[1]);
    const id = match[3];
    const text = match[4].replace(/<[^>]*>/g, ""); // Strip any HTML tags from heading text

    headings.push({ text, level, id });
  }

  return headings;
}

/**
 * Process footnote references in content for better accessibility
 * @param content - HTML content containing footnote references
 * @returns Content with enhanced footnote references
 */
export function processFootnoteReferences(content: string): string {
  if (!content) return "";

  // Enhance footnote reference links with better aria labels
  return content.replace(
    /<sup class="footnote-ref"><a href="#footnote-(\d+)" id="footnote-ref-(\d+)">(\d+)<\/a><\/sup>/g,
    (_match, footnoteNum, refNum, displayNum) => {
      return `<sup class="footnote-ref"><a href="#footnote-${footnoteNum}" id="footnote-ref-${refNum}" aria-describedby="footnote-${footnoteNum}" title="Go to footnote ${displayNum}">${displayNum}</a></sup>`;
    }
  );
}

/**
 * Count footnotes in content
 * @param content - HTML content that may contain footnotes
 * @returns Number of footnotes found
 */
export function countFootnotes(content: string): number {
  if (!content) return 0;

  const footnoteRefs = content.match(/<sup class="footnote-ref">/g);
  return footnoteRefs ? footnoteRefs.length : 0;
}

/**
 * Smooth scroll to footnote or footnote reference
 * @param elementId - ID of the element to scroll to
 * @param offset - Additional offset from the top (default: 100px for header)
 */
export function scrollToFootnote(
  elementId: string,
  offset: number = 100
): void {
  const element = document.getElementById(elementId);
  if (element) {
    const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({
      top: elementTop - offset,
      behavior: "smooth",
    });

    // Focus the element for accessibility
    element.focus({ preventScroll: true });
  }
}

/**
 * Complete content processing pipeline
 * @param rawContent - Raw HTML content from backend
 * @param apiBaseUrl - Base URL for API
 * @returns Fully processed content ready for rendering
 */
export function processPostContent(
  rawContent: string,
  apiBaseUrl?: string
): string {
  if (!rawContent) return "";

  let processed = rawContent;

  // Apply all processing steps in order
  processed = processImageUrls(processed, apiBaseUrl);
  processed = processContentForTypography(processed);
  processed = processFootnoteReferences(processed);
  
  // Process MDX components (3D visualizations, etc.)
  // Import is handled at the top of the file to avoid ES module issues
  processed = processMDXComponentsInternal(processed);

  return processed;
}

/**
 * Internal function to process MDX components
 * This is separated to handle the dynamic import properly
 */
function processMDXComponentsInternal(content: string): string {
  // For now, we'll import this dynamically when needed
  // The actual component processing will be handled in the Post component
  return content;
}
