"""
Content Index Generator
Generates index.json from MDX files dynamically
"""

import json
import frontmatter
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional


class IndexGenerator:
    def __init__(self, content_dir: Path):
        self.content_dir = content_dir
    
    def generate_index(self) -> Dict[str, Any]:
        """Generate a fresh index from all MDX files"""
        posts_dir = self.content_dir / 'posts'
        pages_dir = self.content_dir / 'pages'
        
        index_data = {
            'posts': [],
            'pages': [],
            'tags': set(),
            'generated_at': datetime.now().isoformat()
        }
        
        # Process posts
        if posts_dir.exists():
            for mdx_file in posts_dir.glob('*.mdx'):
                try:
                    with open(mdx_file, 'r', encoding='utf-8') as f:
                        post = frontmatter.load(f)
                    
                    post_data = {
                        'filename': mdx_file.name,
                        'slug': post.metadata.get('slug', self._extract_slug_from_filename(mdx_file.name)),
                        'title': post.metadata.get('title', ''),
                        'date': post.metadata.get('date', ''),
                        'author': post.metadata.get('author', ''),
                        'excerpt': post.metadata.get('excerpt', ''),
                        'reading_time': post.metadata.get('reading_time', 1),
                        'tags': post.metadata.get('tags', []),
                        'status': post.metadata.get('status', 'publish')
                    }
                    
                    index_data['posts'].append(post_data)
                    
                    # Collect tags
                    for tag in post.metadata.get('tags', []):
                        if isinstance(tag, str):
                            index_data['tags'].add(tag)
                            
                except Exception as e:
                    print(f"Error indexing {mdx_file}: {e}")
        
        # Process pages
        if pages_dir.exists():
            for mdx_file in pages_dir.glob('*.mdx'):
                try:
                    with open(mdx_file, 'r', encoding='utf-8') as f:
                        post = frontmatter.load(f)
                    
                    page_data = {
                        'filename': mdx_file.name,
                        'slug': post.metadata.get('slug', self._extract_slug_from_filename(mdx_file.name)),
                        'title': post.metadata.get('title', ''),
                        'date': post.metadata.get('date', ''),
                        'author': post.metadata.get('author', ''),
                        'status': post.metadata.get('status', 'publish')
                    }
                    
                    index_data['pages'].append(page_data)
                    
                except Exception as e:
                    print(f"Error indexing {mdx_file}: {e}")
        
        # Convert tags set to sorted list
        index_data['tags'] = sorted(list(index_data['tags']))
        
        # Sort posts by date (newest first)
        index_data['posts'].sort(key=lambda x: x.get('date', ''), reverse=True)
        
        return index_data
    
    def _extract_slug_from_filename(self, filename: str) -> str:
        """Extract slug from filename (remove date and extension)"""
        # Remove extension
        name = filename.rsplit('.', 1)[0]
        # Remove date prefix (YYYY-MM-DD-)
        if len(name) > 10 and name[4] == '-' and name[7] == '-':
            return name[11:]  # Skip "YYYY-MM-DD-"
        return name
    
    def save_index(self, index_data: Dict[str, Any]) -> None:
        """Save index data to index.json file"""
        index_file = self.content_dir / 'index.json'
        with open(index_file, 'w', encoding='utf-8') as f:
            json.dump(index_data, f, indent=2, ensure_ascii=False)
    
    def generate_and_save(self) -> Dict[str, Any]:
        """Generate index and save it to file"""
        index_data = self.generate_index()
        self.save_index(index_data)
        print(f"Generated index with {len(index_data['posts'])} posts and {len(index_data['pages'])} pages")
        return index_data
