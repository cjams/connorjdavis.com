"""
MDX Content Processor
Handles parsing MDX files and extracting component information
"""

import re
import json
import frontmatter
import markdown
import os
from datetime import datetime

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
                    'style': 'lightbulb',
                },
                'pymdownx.highlight': {
                    'use_pygments': True,
                    'css_class': 'highlight',
                    'pygments_style': 'lightbulb',
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
        
        # Manually parse props to handle nested braces correctly
        i = 0
        while i < len(props_string):
            # Skip whitespace
            while i < len(props_string) and props_string[i].isspace():
                i += 1
            
            if i >= len(props_string):
                break
                
            # Extract prop name
            prop_name_start = i
            while i < len(props_string) and props_string[i] not in '=\t\n\r ':
                i += 1
            
            if i >= len(props_string) or props_string[i] != '=':
                break
                
            prop_name = props_string[prop_name_start:i]
            i += 1  # Skip '='
            
            # Skip whitespace after =
            while i < len(props_string) and props_string[i].isspace():
                i += 1
            
            if i >= len(props_string):
                break
            
            # Parse prop value
            if props_string[i] == '"':
                # Handle quoted string
                i += 1  # Skip opening quote
                value_start = i
                while i < len(props_string) and props_string[i] != '"':
                    i += 1
                prop_value = props_string[value_start:i]
                if i < len(props_string):
                    i += 1  # Skip closing quote
            elif props_string[i] == '{':
                # Handle JSX expression with nested braces
                brace_count = 0
                value_start = i
                while i < len(props_string):
                    if props_string[i] == '{':
                        brace_count += 1
                    elif props_string[i] == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            i += 1  # Include the closing brace
                            break
                    i += 1
                
                prop_value = props_string[value_start:i]
                # Remove outer braces for parsing
                inner_value = prop_value[1:-1]
                
                # Try to parse as JSON
                try:
                    prop_value = json.loads(inner_value)
                except json.JSONDecodeError:
                    # If JSON parsing fails, try some basic conversions
                    inner_value = inner_value.strip()
                    if inner_value.lower() in ('true', 'false'):
                        prop_value = inner_value.lower() == 'true'
                    elif inner_value.isdigit():
                        prop_value = int(inner_value)
                    else:
                        prop_value = inner_value
            else:
                # Handle unquoted value
                value_start = i
                while i < len(props_string) and not props_string[i].isspace():
                    i += 1
                prop_value = props_string[value_start:i]
                
                # Try basic conversions
                if prop_value.lower() in ('true', 'false'):
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
        
        # Debug logging removed - lightbulb theme implementation complete
        
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
    
    def calculate_reading_time(self, content: str) -> int:
        """Calculate reading time in minutes based on content"""
        # Remove MDX components and markup for more accurate word count
        clean_content = content
        
        # Remove frontmatter if present
        if content.startswith('---'):
            parts = content.split('---', 2)
            if len(parts) >= 3:
                clean_content = parts[2]
        
        # Remove MDX components
        clean_content = re.sub(r'<[^>]+>', '', clean_content)
        
        # Remove code blocks
        clean_content = re.sub(r'```[\s\S]*?```', '', clean_content)
        clean_content = re.sub(r'`[^`]+`', '', clean_content)
        
        # Remove links markdown
        clean_content = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', clean_content)
        
        # Remove image markdown
        clean_content = re.sub(r'!\[[^\]]*\]\([^)]+\)', '', clean_content)
        
        # Remove markdown headings, bold, italic
        clean_content = re.sub(r'#+\s*', '', clean_content)
        clean_content = re.sub(r'\*\*([^*]+)\*\*', r'\1', clean_content)
        clean_content = re.sub(r'\*([^*]+)\*', r'\1', clean_content)
        clean_content = re.sub(r'_([^_]+)_', r'\1', clean_content)
        
        # Count words
        words = len(clean_content.split())
        reading_time = max(1, round(words / 225))
        
        return reading_time
    
    def generate_excerpt(self, content: str, max_length: int = 150) -> str:
        """Generate an excerpt from the beginning of the content"""
        # Remove frontmatter if present
        clean_content = content
        if content.startswith('---'):
            parts = content.split('---', 2)
            if len(parts) >= 3:
                clean_content = parts[2].strip()
        
        # Remove MDX components
        clean_content = re.sub(r'<[^>]+>', '', clean_content)
        
        # Remove markdown syntax for cleaner excerpt
        clean_content = re.sub(r'#+\s*', '', clean_content)  # Headers
        clean_content = re.sub(r'\*\*([^*]+)\*\*', r'\1', clean_content)  # Bold
        clean_content = re.sub(r'\*([^*]+)\*', r'\1', clean_content)  # Italic
        clean_content = re.sub(r'_([^_]+)_', r'\1', clean_content)  # Italic
        clean_content = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', clean_content)  # Links
        clean_content = re.sub(r'!\[[^\]]*\]\([^)]+\)', '', clean_content)  # Images
        clean_content = re.sub(r'```[\s\S]*?```', '', clean_content)  # Code blocks
        clean_content = re.sub(r'`[^`]+`', '', clean_content)  # Inline code
        
        # Clean up whitespace
        clean_content = ' '.join(clean_content.split())
        
        # Truncate to max length, breaking at word boundaries
        if len(clean_content) <= max_length:
            return clean_content
        
        # Find the last space before max_length
        truncated = clean_content[:max_length]
        last_space = truncated.rfind(' ')
        
        if last_space > 0:
            truncated = truncated[:last_space]
        
        return truncated + '...'
    
    def update_post_metadata(self, filepath: Path) -> bool:
        """Update post metadata with auto-generated values if missing"""
        try:
            # Read the file
            with open(filepath, 'r', encoding='utf-8') as f:
                post = frontmatter.load(f)
            
            metadata_changed = False
            
            # Get file modification time
            mod_time = os.path.getmtime(filepath)
            mod_datetime = datetime.fromtimestamp(mod_time)
            
            # Auto-populate date if not set
            if not post.metadata.get('date'):
                post.metadata['date'] = mod_datetime.strftime('%Y-%m-%d')
                metadata_changed = True
                print(f"📅 Auto-populated date for {filepath.name}: {post.metadata['date']}")
            
            # Recalculate reading time
            new_reading_time = self.calculate_reading_time(post.content)
            if post.metadata.get('reading_time') != new_reading_time:
                post.metadata['reading_time'] = new_reading_time
                metadata_changed = True
                print(f"⏱️  Updated reading time for {filepath.name}: {new_reading_time} min")
            
            # Always regenerate excerpt to ensure it stays current with content changes
            new_excerpt = self.generate_excerpt(post.content)
            if new_excerpt:
                current_excerpt = post.metadata.get('excerpt', '')
                if current_excerpt != new_excerpt:
                    post.metadata['excerpt'] = new_excerpt
                    metadata_changed = True
                    if current_excerpt:
                        print(f"📝 Updated excerpt for {filepath.name}")
                    else:
                        print(f"📝 Auto-generated excerpt for {filepath.name}")
            
            # Write back if changes were made
            if metadata_changed:
                # Convert frontmatter back to string format
                content_with_frontmatter = frontmatter.dumps(post)
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content_with_frontmatter)
                print(f"✅ Updated metadata for {filepath.name}")
                return True
            
            return False
            
        except Exception as e:
            print(f"❌ Error updating metadata for {filepath}: {e}")
            return False
    
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
