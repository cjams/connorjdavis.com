"""
WordPress to FastAPI/React Migration Tool
Main script for migrating WordPress content via REST API
"""

import os
import re
import json
import requests
from datetime import datetime
from typing import Dict, List, Optional, Any
from urllib.parse import urljoin, urlparse
from pathlib import Path
import time

from bs4 import BeautifulSoup
from markdownify import markdownify as md
from slugify import slugify
import frontmatter

from config import Config


class WordPressMigrator:
    def __init__(self):
        self.config = Config()
        self.session = requests.Session()
        self.session.timeout = self.config.API_TIMEOUT
        
        # Create output directories
        self.config.create_directories()
        
        # Statistics
        self.stats = {
            'posts_migrated': 0,
            'pages_migrated': 0,
            'images_downloaded': 0,
            'errors': []
        }
    
    def fetch_posts(self, per_page: int = 100) -> List[Dict]:
        """Fetch all posts from WordPress API"""
        posts = []
        page = 1
        
        print("Fetching WordPress posts...")
        
        while True:
            params = {
                'per_page': per_page,
                'page': page,
                'status': 'publish' if self.config.PUBLISHED_ONLY else 'any',
                '_embed': True  # Include embedded data like featured images
            }
            
            try:
                response = self.session.get(
                    f"{self.config.WORDPRESS_API_URL}/posts",
                    params=params
                )
                response.raise_for_status()
                
                batch_posts = response.json()
                
                if not batch_posts:
                    break
                
                posts.extend(batch_posts)
                print(f"  Retrieved {len(batch_posts)} posts from page {page}")
                
                # Check if there are more pages
                total_pages = int(response.headers.get('X-WP-TotalPages', page))
                if page >= total_pages:
                    break
                    
                page += 1
                time.sleep(0.5)  # Be nice to the server
                
            except requests.exceptions.RequestException as e:
                error_msg = f"Error fetching posts (page {page}): {str(e)}"
                print(error_msg)
                self.stats['errors'].append(error_msg)
                break
        
        print(f"Total posts fetched: {len(posts)}")
        return posts
    
    def fetch_pages(self, per_page: int = 100) -> List[Dict]:
        """Fetch all pages from WordPress API"""
        pages = []
        page = 1
        
        print("Fetching WordPress pages...")
        
        while True:
            params = {
                'per_page': per_page,
                'page': page,
                'status': 'publish' if self.config.PUBLISHED_ONLY else 'any',
                '_embed': True
            }
            
            try:
                response = self.session.get(
                    f"{self.config.WORDPRESS_API_URL}/pages",
                    params=params
                )
                response.raise_for_status()
                
                batch_pages = response.json()
                
                if not batch_pages:
                    break
                
                pages.extend(batch_pages)
                print(f"  Retrieved {len(batch_pages)} pages from page {page}")
                
                # Check if there are more pages
                total_pages = int(response.headers.get('X-WP-TotalPages', page))
                if page >= total_pages:
                    break
                    
                page += 1
                time.sleep(0.5)
                
            except requests.exceptions.RequestException as e:
                error_msg = f"Error fetching pages (page {page}): {str(e)}"
                print(error_msg)
                self.stats['errors'].append(error_msg)
                break
        
        print(f"Total pages fetched: {len(pages)}")
        return pages
    
    def parse_shortcode_attributes(self, shortcode_content: str) -> Dict[str, str]:
        """Parse shortcode attributes into a dictionary"""
        attributes = {}
        
        # Match attribute="value" or attribute='value' or attribute=value
        attr_pattern = r'(\w+)=(["\']?)([^"\'\s]*)\2'
        matches = re.findall(attr_pattern, shortcode_content)
        
        for attr_name, quote, attr_value in matches:
            attributes[attr_name] = attr_value
        
        return attributes
    
    def convert_shortcodes(self, content: str) -> str:
        """Convert WordPress shortcodes to appropriate HTML/Markdown"""
        if not content:
            return ""
        
        # Gallery shortcode conversion
        def convert_gallery(match):
            shortcode_content = match.group(1)
            attrs = self.parse_shortcode_attributes(shortcode_content)
            
            # Extract gallery attributes
            ids = attrs.get('ids', '').split(',') if attrs.get('ids') else []
            columns = attrs.get('columns', '3')
            size = attrs.get('size', 'medium')
            
            if ids:
                # Create a simple gallery HTML structure
                gallery_html = f'<div class="wp-gallery wp-gallery-columns-{columns}">\n'
                for img_id in ids:
                    if img_id.strip():
                        # Note: You could enhance this to fetch actual image URLs from WordPress API
                        gallery_html += f'  <figure class="wp-gallery-item">\n'
                        gallery_html += f'    <img src="/media/gallery-{img_id.strip()}-{size}.jpg" alt="Gallery Image {img_id.strip()}" />\n'
                        gallery_html += f'  </figure>\n'
                gallery_html += '</div>'
                return gallery_html
            else:
                return f'<!-- WordPress Gallery: {shortcode_content} -->'
        
        # Video shortcode conversion
        def convert_video(match):
            shortcode_content = match.group(1)
            attrs = self.parse_shortcode_attributes(shortcode_content)
            
            video_url = attrs.get('src', '') or attrs.get('mp4', '') or attrs.get('webm', '')
            width = attrs.get('width', '640')
            height = attrs.get('height', '360')
            
            if video_url:
                return f'<video width="{width}" height="{height}" controls>\n  <source src="{video_url}" type="video/mp4">\n  Your browser does not support the video tag.\n</video>'
            else:
                return f'<!-- WordPress Video: {shortcode_content} -->'
        
        # Audio shortcode conversion  
        def convert_audio(match):
            shortcode_content = match.group(1)
            attrs = self.parse_shortcode_attributes(shortcode_content)
            
            audio_url = attrs.get('src', '') or attrs.get('mp3', '')
            
            if audio_url:
                return f'<audio controls>\n  <source src="{audio_url}" type="audio/mpeg">\n  Your browser does not support the audio element.\n</audio>'
            else:
                return f'<!-- WordPress Audio: {shortcode_content} -->'
        
        # Embed shortcode conversion
        def convert_embed(match):
            shortcode_content = match.group(1)
            attrs = self.parse_shortcode_attributes(shortcode_content)
            
            url = attrs.get('src', '') or attrs.get('url', '')
            width = attrs.get('width', '560')
            height = attrs.get('height', '315')
            
            if url:
                # Check for common video platforms
                if 'youtube.com' in url or 'youtu.be' in url:
                    # Extract YouTube video ID
                    youtube_id = None
                    if 'youtu.be/' in url:
                        youtube_id = url.split('youtu.be/')[-1].split('?')[0]
                    elif 'watch?v=' in url:
                        youtube_id = url.split('watch?v=')[-1].split('&')[0]
                    
                    if youtube_id:
                        return f'<iframe width="{width}" height="{height}" src="https://www.youtube.com/embed/{youtube_id}" frameborder="0" allowfullscreen></iframe>'
                
                elif 'vimeo.com' in url:
                    # Extract Vimeo video ID
                    vimeo_id = url.split('vimeo.com/')[-1].split('?')[0]
                    return f'<iframe src="https://player.vimeo.com/video/{vimeo_id}" width="{width}" height="{height}" frameborder="0" allowfullscreen></iframe>'
                
                else:
                    # Generic embed
                    return f'<iframe src="{url}" width="{width}" height="{height}" frameborder="0"></iframe>'
            
            return f'<!-- WordPress Embed: {shortcode_content} -->'
        
        # YouTube shortcode conversion
        def convert_youtube(match):
            shortcode_content = match.group(1)
            attrs = self.parse_shortcode_attributes(shortcode_content)
            
            video_id = attrs.get('id', '') or attrs.get('v', '')
            width = attrs.get('width', '560')
            height = attrs.get('height', '315')
            
            if video_id:
                return f'<iframe width="{width}" height="{height}" src="https://www.youtube.com/embed/{video_id}" frameborder="0" allowfullscreen></iframe>'
            else:
                return f'<!-- YouTube Video: {shortcode_content} -->'
        
        # Caption shortcode conversion (keep existing)
        def convert_caption(match):
            shortcode_content = match.group(1)
            caption_content = match.group(2) if len(match.groups()) > 1 else ''
            
            attrs = self.parse_shortcode_attributes(shortcode_content)
            width = attrs.get('width', '')
            caption_text = attrs.get('caption', '')
            
            if width:
                return f'<figure style="width: {width}px">{caption_content}<figcaption>{caption_text}</figcaption></figure>'
            else:
                return f'<figure>{caption_content}<figcaption>{caption_text}</figcaption></figure>'
        
        # Apply shortcode conversions
        content = re.sub(r'\[gallery([^\]]*)\]', convert_gallery, content)
        content = re.sub(r'\[video([^\]]*)\]', convert_video, content)
        content = re.sub(r'\[audio([^\]]*)\]', convert_audio, content)
        content = re.sub(r'\[embed([^\]]*)\]', convert_embed, content)
        content = re.sub(r'\[youtube([^\]]*)\]', convert_youtube, content)
        content = re.sub(r'\[caption([^\]]*)\](.*?)\[\/caption\]', convert_caption, content, flags=re.DOTALL)
        
        # Handle self-closing shortcodes with URLs (generic handler for unknown shortcodes)
        def preserve_shortcode_with_url(match):
            shortcode_name = match.group(1)
            shortcode_content = match.group(2)
            attrs = self.parse_shortcode_attributes(shortcode_content)
            
            # Look for URL-like attributes
            url_attrs = ['url', 'src', 'href', 'link']
            found_urls = []
            
            for attr in url_attrs:
                if attr in attrs and attrs[attr]:
                    found_urls.append(f'{attr}="{attrs[attr]}"')
            
            if found_urls:
                return f'<!-- WordPress Shortcode [{shortcode_name}]: {" ".join(found_urls)} | Original: [{shortcode_name} {shortcode_content}] -->'
            else:
                return f'<!-- WordPress Shortcode [{shortcode_name} {shortcode_content}] -->'
        
        # Preserve unknown shortcodes with comments
        content = re.sub(r'\[(\w+)([^\]]*)\]', preserve_shortcode_with_url, content)
        
        return content
    
    def clean_html_content(self, content: str) -> str:
        """Clean and prepare HTML content for conversion"""
        if not content:
            return ""
        
        # First convert shortcodes to HTML
        content = self.convert_shortcodes(content)
        
        # Parse HTML
        soup = BeautifulSoup(content, 'html.parser')
        
        # Remove scripts and styles but keep converted shortcode content
        for element in soup.find_all(['script', 'style']):
            element.decompose()
        
        return str(soup)
    
    def download_image(self, image_url: str, filename: str) -> Optional[str]:
        """Download an image and return the local path"""
        try:
            response = self.session.get(image_url, timeout=30)
            response.raise_for_status()
            
            # Create media directory if it doesn't exist
            media_path = Path(self.config.MEDIA_DIR)
            media_path.mkdir(parents=True, exist_ok=True)
            
            # Save image
            local_path = media_path / filename
            with open(local_path, 'wb') as f:
                f.write(response.content)
            
            self.stats['images_downloaded'] += 1
            return str(local_path)
            
        except Exception as e:
            error_msg = f"Error downloading image {image_url}: {str(e)}"
            print(error_msg)
            self.stats['errors'].append(error_msg)
            return None
    
    def process_images_in_content(self, content: str) -> str:
        """Process images in content, downloading them if configured"""
        if not self.config.DOWNLOAD_IMAGES:
            return content
        
        # Find all image URLs in the content
        img_pattern = r'<img[^>]+src=["\']([^"\']+)["\'][^>]*>'
        
        def replace_image(match):
            img_tag = match.group(0)
            img_url = match.group(1)
            
            # Skip if already a local path
            if not img_url.startswith('http'):
                return img_tag
            
            # Generate filename
            parsed_url = urlparse(img_url)
            filename = os.path.basename(parsed_url.path)
            
            # Download image
            local_path = self.download_image(img_url, filename)
            
            if local_path:
                # Replace the src attribute
                return img_tag.replace(img_url, f"/media/{filename}")
            
            return img_tag
        
        return re.sub(img_pattern, replace_image, content)
    
    def convert_to_markdown(self, content: str) -> str:
        """Convert HTML content to Markdown"""
        if self.config.CONTENT_FORMAT == "html":
            return content
        
        # Clean content first
        content = self.clean_html_content(content)
        
        # Process images
        content = self.process_images_in_content(content)
        
        # Convert to markdown
        markdown_content = md(content, heading_style="ATX")
        
        # Clean up markdown
        markdown_content = re.sub(r'\n\s*\n\s*\n', '\n\n', markdown_content)
        markdown_content = markdown_content.strip()
        
        return markdown_content
    
    def create_frontmatter(self, post: Dict) -> Dict[str, Any]:
        """Create frontmatter data from WordPress post"""
        frontmatter_data = {
            'title': post.get('title', {}).get('rendered', ''),
            'slug': post.get('slug', ''),
            'date': post.get('date', ''),
            'modified': post.get('modified', ''),
            'status': post.get('status', 'publish'),
            'excerpt': post.get('excerpt', {}).get('rendered', ''),
            'author': post.get('author', 1),
            'wordpress_id': post.get('id'),
            'wordpress_url': post.get('link', ''),
        }
        
        # Add categories if they exist
        if post.get('categories'):
            frontmatter_data['categories'] = post['categories']
        
        # Add tags if they exist
        if post.get('tags'):
            frontmatter_data['tags'] = post['tags']
        
        # Add featured image if it exists
        if post.get('_embedded', {}).get('wp:featuredmedia'):
            featured_media = post['_embedded']['wp:featuredmedia'][0]
            frontmatter_data['featured_image'] = featured_media.get('source_url', '')
        
        return frontmatter_data
    
    def save_post(self, post: Dict, content_type: str = "post") -> bool:
        """Save a single post or page"""
        try:
            # Get content
            content = post.get('content', {}).get('rendered', '')
            
            # Convert to markdown
            markdown_content = self.convert_to_markdown(content)
            
            # Create frontmatter
            frontmatter_data = self.create_frontmatter(post)
            
            # Create post object
            post_obj = frontmatter.Post(markdown_content, **frontmatter_data)
            
            # Generate filename
            slug = post.get('slug', '')
            if not slug:
                slug = slugify(post.get('title', {}).get('rendered', ''))
            
            date_str = post.get('date', '')[:10]  # YYYY-MM-DD
            filename = f"{date_str}-{slug}.md"
            
            # Determine output directory
            output_dir = self.config.POSTS_DIR if content_type == "post" else self.config.PAGES_DIR
            
            # Save file
            file_path = Path(output_dir) / filename
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(frontmatter.dumps(post_obj))
            
            print(f"  Saved: {filename}")
            return True
            
        except Exception as e:
            error_msg = f"Error saving {content_type} {post.get('id', 'unknown')}: {str(e)}"
            print(error_msg)
            self.stats['errors'].append(error_msg)
            return False
    
    def migrate_posts(self):
        """Migrate all WordPress posts"""
        print("\n=== MIGRATING POSTS ===")
        posts = self.fetch_posts()
        
        for post in posts:
            if self.save_post(post, "post"):
                self.stats['posts_migrated'] += 1
        
        print(f"Posts migration complete: {self.stats['posts_migrated']} posts migrated")
    
    def migrate_pages(self):
        """Migrate all WordPress pages"""
        print("\n=== MIGRATING PAGES ===")
        pages = self.fetch_pages()
        
        for page in pages:
            if self.save_post(page, "page"):
                self.stats['pages_migrated'] += 1
        
        print(f"Pages migration complete: {self.stats['pages_migrated']} pages migrated")
    
    def print_summary(self):
        """Print migration summary"""
        print("\n=== MIGRATION SUMMARY ===")
        print(f"Posts migrated: {self.stats['posts_migrated']}")
        print(f"Pages migrated: {self.stats['pages_migrated']}")
        print(f"Images downloaded: {self.stats['images_downloaded']}")
        print(f"Errors: {len(self.stats['errors'])}")
        
        if self.stats['errors']:
            print("\nErrors encountered:")
            for error in self.stats['errors']:
                print(f"  - {error}")
    
    def run_migration(self):
        """Run the complete migration process"""
        print("Starting WordPress migration...")
        print(f"Source: {self.config.WORDPRESS_URL}")
        print(f"Output directory: {self.config.OUTPUT_DIR}")
        
        start_time = time.time()
        
        try:
            self.migrate_posts()
            self.migrate_pages()
            
            end_time = time.time()
            duration = end_time - start_time
            
            print(f"\nMigration completed in {duration:.2f} seconds")
            self.print_summary()
            
        except KeyboardInterrupt:
            print("\nMigration interrupted by user")
            self.print_summary()
        except Exception as e:
            print(f"\nMigration failed: {str(e)}")
            self.stats['errors'].append(str(e))
            self.print_summary()


def main():
    """Main entry point"""
    migrator = WordPressMigrator()
    migrator.run_migration()


if __name__ == "__main__":
    main()
