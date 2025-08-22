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
                'nl2br',  # Convert line breaks to <br> tags
                'attr_list',  # Allow attributes on elements
                'def_list',  # Support definition lists
                'footnotes',  # Support footnotes
                'abbr',  # Support abbreviations
            ],
            extension_configs={
                'toc': {
                    'permalink': True,
                    'permalink_class': 'heading-permalink',
                    'permalink_title': 'Permanent link to this heading',
                    'baselevel': 1,
                    'separator': '-',
                },
                'codehilite': {
                    'use_pygments': True,
                    'css_class': 'highlight',
                    'guess_lang': False,
                },
                'pymdownx.highlight': {
                    'use_pygments': True,
                    'css_class': 'highlight',
                },
                'footnotes': {
                    'BACKLINK_TEXT': '↑',  # Use an up arrow instead of the default ↩
                    'UNIQUE_IDS': False,   # Use consistent IDs that reset each time
                },
            }
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
    
    def post_process_html(self, html_content: str) -> str:
        """Post-process HTML for better typography and formatting"""
        if not html_content:
            return html_content
        
        # Let the markdown processor handle footnotes natively
        
        # Process figure captions
        html_content = self._process_figure_captions(html_content)
        
        # Clean TOC and heading permalinks
        html_content = self._clean_heading_permalinks(html_content)
        
        # Ensure proper paragraph spacing
        # Remove empty paragraphs that might have been created
        html_content = re.sub(r'<p>\s*</p>', '', html_content)
        
        # Fix paragraph breaks around block elements
        html_content = re.sub(r'</p>\s*<(blockquote|pre|div|ul|ol|table)', r'</p>\n<\1', html_content)
        html_content = re.sub(r'</(blockquote|pre|div|ul|ol|table)>\s*<p>', r'</\1>\n<p>', html_content)
        
        # Ensure headings have proper spacing
        html_content = re.sub(r'</p>\s*<(h[1-6])', r'</p>\n\n<\1', html_content)
        html_content = re.sub(r'</(h[1-6])>\s*<p>', r'</\1>\n\n<p>', html_content)
        
        # Clean up excessive line breaks
        html_content = re.sub(r'\n{3,}', '\n\n', html_content)
        
        # Ensure images have proper alt text and loading attributes
        html_content = re.sub(
            r'<img([^>]*?)>',
            lambda m: self._enhance_img_tag(m.group(1)),
            html_content
        )
        
        # Add semantic structure to blockquotes
        html_content = re.sub(
            r'<blockquote>',
            '<blockquote role="blockquote">',
            html_content
        )
        
        # Enhance code blocks with language detection
        html_content = re.sub(
            r'<pre><code class="language-(\w+)"([^>]*?)>',
            r'<pre data-language="\1"><code class="language-\1"\2>',
            html_content
        )
        
        return html_content.strip()
    
    def _enhance_img_tag(self, img_attrs: str) -> str:
        """Enhance image tag with better attributes"""
        # Check if alt attribute exists
        if 'alt=' not in img_attrs:
            img_attrs += ' alt=""'
        
        # Add loading lazy if not present
        if 'loading=' not in img_attrs:
            img_attrs += ' loading="lazy"'
        
        # Add decoding async if not present
        if 'decoding=' not in img_attrs:
            img_attrs += ' decoding="async"'
        
        return f'<img{img_attrs}>'
    
    def _extract_footnotes_from_html(self, html_content: str) -> Dict[str, Any]:
        """Extract footnote information from HTML generated by markdown processor"""
        footnotes = {}
        
        # Pattern to match footnote references generated by markdown processor
        # Matches: <sup id="fnref:1"><a class="footnote-ref" href="#fn:1">1</a></sup>
        footnote_ref_pattern = re.compile(r'<sup id="fnref:(\d+)"><a[^>]*href="#fn:\1"[^>]*>(\d+)</a></sup>')
        
        matches = footnote_ref_pattern.findall(html_content)
        for footnote_id, footnote_number in matches:
            footnotes[footnote_id] = {
                'number': int(footnote_number),
                'original_number': footnote_number
            }
        
        return footnotes
    
    def _process_figure_captions(self, html_content: str) -> str:
        """Process figure captions by detecting paragraphs after images containing 'Figure' or 'Source'"""
        # Pattern to match image followed by paragraph containing "Figure" or "Source"
        figure_pattern = re.compile(
            r'(<img[^>]*>)\s*</p>\s*<p>([^<]*(?:Figure|Source)[^<]*)</p>',
            re.IGNORECASE | re.DOTALL
        )
        
        def replace_figure_caption(match):
            img_tag = match.group(1)
            caption_text = match.group(2).strip()
            
            return f'''<figure class="blog-figure">
    {img_tag}
    <figcaption class="blog-figure-caption">{caption_text}</figcaption>
</figure>
</p>'''
        
        html_content = figure_pattern.sub(replace_figure_caption, html_content)
        
        # Also handle standalone figure captions (paragraphs that start with Figure/Source)
        standalone_caption_pattern = re.compile(
            r'<p>([^<]*(?:Figure|Source)[^<]*)</p>(?=\s*<(?!p|figure))',
            re.IGNORECASE
        )
        
        def replace_standalone_caption(match):
            caption_text = match.group(1).strip()
            return f'<p class="blog-standalone-caption">{caption_text}</p>'
        
        html_content = standalone_caption_pattern.sub(replace_standalone_caption, html_content)
        
        return html_content
    
    def _clean_heading_permalinks(self, html_content: str) -> str:
        """Remove paragraph symbols from headings and clean TOC"""
        # Remove ¶ symbols from heading permalinks
        html_content = re.sub(
            r'<a class="heading-permalink"[^>]*>¶</a>',
            '',
            html_content
        )
        
        # Clean up any remaining &para; entities
        html_content = html_content.replace('&para;', '')
        html_content = html_content.replace('¶', '')
        
        # Clean TOC if it exists
        if hasattr(self.markdown_processor, 'toc'):
            toc_content = getattr(self.markdown_processor, 'toc', '')
            if toc_content:
                # Remove paragraph symbols from TOC
                toc_content = toc_content.replace('&para;', '')
                toc_content = toc_content.replace('¶', '')
                # Update the TOC
                self.markdown_processor.toc = toc_content
        
        return html_content
    
    def process_mdx_content(self, content: str) -> Dict[str, Any]:
        """Process MDX content and return structured data"""
        # Reset the markdown processor to clear any accumulated state
        self.markdown_processor.reset()
        
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
        
        # Post-process HTML for better typography
        html_content = self.post_process_html(html_content)
        
        # Replace placeholders with component markers
        for i, component in enumerate(components):
            component_marker = f'<div class="mdx-component" data-component-id="{component["id"]}"></div>'
            html_content = html_content.replace(f'<!--COMPONENT_{i}-->', component_marker)
        
        # Extract footnotes data from the generated HTML
        footnotes = self._extract_footnotes_from_html(html_content)
        
        return {
            'html': html_content,
            'components': components,
            'toc': getattr(self.markdown_processor, 'toc', ''),
            'footnotes': footnotes,
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
                'footnotes': processed['footnotes'],
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
