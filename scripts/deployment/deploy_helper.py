"""
Deployment Helper Script
Helps organize migrated content for FastAPI backend deployment
"""

import os
import shutil
import json
from pathlib import Path
from typing import Dict, List, Any
import frontmatter
from datetime import datetime

from config import Config


class DeploymentHelper:
    def __init__(self):
        self.config = Config()
        self.stats = {
            'posts_deployed': 0,
            'pages_deployed': 0,
            'media_files_copied': 0,
            'errors': []
        }
    
    def create_fastapi_structure(self):
        """Create the recommended FastAPI project structure"""
        print("Creating FastAPI project structure...")
        
        directories = [
            "backend",
            "backend/app",
            "backend/app/routers", 
            "backend/app/models",
            "backend/app/utils",
            "backend/content",
            "backend/content/posts",
            "backend/content/pages",
            "backend/static",
            "backend/static/media",
            "frontend",
            "frontend/src",
            "frontend/src/components",
            "frontend/src/pages",
            "frontend/public"
        ]
        
        for directory in directories:
            Path(directory).mkdir(parents=True, exist_ok=True)
            print(f"  Created: {directory}")
    
    def copy_content_to_backend(self):
        """Copy migrated content to backend structure"""
        print("\nCopying content to backend...")
        
        # Copy posts
        source_posts = Path(self.config.POSTS_DIR)
        target_posts = Path("backend/content/posts")
        
        if source_posts.exists():
            target_posts.mkdir(parents=True, exist_ok=True)
            for post_file in source_posts.glob("*.md"):
                shutil.copy2(post_file, target_posts)
                self.stats['posts_deployed'] += 1
            print(f"  Copied {self.stats['posts_deployed']} posts")
        
        # Copy pages
        source_pages = Path(self.config.PAGES_DIR)
        target_pages = Path("backend/content/pages")
        
        if source_pages.exists():
            target_pages.mkdir(parents=True, exist_ok=True)
            for page_file in source_pages.glob("*.md"):
                shutil.copy2(page_file, target_pages)
                self.stats['pages_deployed'] += 1
            print(f"  Copied {self.stats['pages_deployed']} pages")
        
        # Copy media
        source_media = Path(self.config.MEDIA_DIR)
        target_media = Path("backend/static/media")
        
        if source_media.exists():
            target_media.mkdir(parents=True, exist_ok=True)
            for media_file in source_media.iterdir():
                if media_file.is_file():
                    shutil.copy2(media_file, target_media)
                    self.stats['media_files_copied'] += 1
            print(f"  Copied {self.stats['media_files_copied']} media files")
    
    def generate_content_index(self) -> Dict[str, Any]:
        """Generate an index of all content for fast API responses"""
        print("\nGenerating content index...")
        
        index = {
            'posts': [],
            'pages': [],
            'categories': set(),
            'tags': set(),
            'generated_at': datetime.now().isoformat()
        }
        
        # Index posts
        posts_dir = Path("backend/content/posts")
        if posts_dir.exists():
            for post_file in posts_dir.glob("*.md"):
                try:
                    with open(post_file, 'r', encoding='utf-8') as f:
                        post_obj = frontmatter.load(f)
                    
                    metadata = post_obj.metadata
                    post_index = {
                        'filename': post_file.name,
                        'slug': metadata.get('slug', ''),
                        'title': metadata.get('title', ''),
                        'date': metadata.get('date', ''),
                        'status': metadata.get('status', 'publish'),
                        'excerpt': metadata.get('excerpt', ''),
                        'categories': metadata.get('categories', []),
                        'tags': metadata.get('tags', []),
                        'featured_image': metadata.get('featured_image', ''),
                        'word_count': len(post_obj.content.split()),
                        'reading_time': max(1, len(post_obj.content.split()) // 200)  # Assume 200 WPM
                    }
                    
                    index['posts'].append(post_index)
                    
                    # Collect categories and tags
                    index['categories'].update(metadata.get('categories', []))
                    index['tags'].update(metadata.get('tags', []))
                    
                except Exception as e:
                    self.stats['errors'].append(f"Error indexing {post_file}: {str(e)}")
        
        # Index pages
        pages_dir = Path("backend/content/pages")
        if pages_dir.exists():
            for page_file in pages_dir.glob("*.md"):
                try:
                    with open(page_file, 'r', encoding='utf-8') as f:
                        post_obj = frontmatter.load(f)
                    
                    metadata = post_obj.metadata
                    page_index = {
                        'filename': page_file.name,
                        'slug': metadata.get('slug', ''),
                        'title': metadata.get('title', ''),
                        'date': metadata.get('date', ''),
                        'status': metadata.get('status', 'publish'),
                        'excerpt': metadata.get('excerpt', ''),
                        'word_count': len(post_obj.content.split()),
                    }
                    
                    index['pages'].append(page_index)
                    
                except Exception as e:
                    self.stats['errors'].append(f"Error indexing {page_file}: {str(e)}")
        
        # Convert sets to sorted lists
        index['categories'] = sorted(list(index['categories']))
        index['tags'] = sorted(list(index['tags']))
        
        # Sort posts by date (newest first)
        index['posts'].sort(key=lambda x: x.get('date', ''), reverse=True)
        index['pages'].sort(key=lambda x: x.get('title', ''))
        
        # Save index
        index_file = Path("backend/content/index.json")
        with open(index_file, 'w', encoding='utf-8') as f:
            json.dump(index, f, indent=2, ensure_ascii=False)
        
        print(f"  Generated index with {len(index['posts'])} posts and {len(index['pages'])} pages")
        print(f"  Found {len(index['categories'])} categories and {len(index['tags'])} tags")
        
        return index
    
    def create_fastapi_main(self):
        """Create a basic FastAPI main.py file"""
        main_py_content = '''"""
FastAPI Blog Backend
Generated by WordPress Migration Tool
"""

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import json
import frontmatter
from typing import List, Optional

app = FastAPI(title="Blog API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Load content index
def load_content_index():
    index_file = Path("content/index.json")
    if index_file.exists():
        with open(index_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"posts": [], "pages": [], "categories": [], "tags": []}

def load_post_content(filename: str, content_type: str = "posts"):
    """Load the full content of a post or page"""
    content_dir = Path(f"content/{content_type}")
    file_path = content_dir / filename
    
    if not file_path.exists():
        return None
    
    with open(file_path, 'r', encoding='utf-8') as f:
        post_obj = frontmatter.load(f)
    
    return {
        'metadata': post_obj.metadata,
        'content': post_obj.content
    }

@app.get("/")
async def root():
    return {"message": "Blog API is running"}

@app.get("/posts")
async def get_posts(limit: Optional[int] = None, category: Optional[str] = None, tag: Optional[str] = None):
    """Get all posts with optional filtering"""
    index = load_content_index()
    posts = index['posts']
    
    # Filter by category
    if category:
        posts = [p for p in posts if category in p.get('categories', [])]
    
    # Filter by tag
    if tag:
        posts = [p for p in posts if tag in p.get('tags', [])]
    
    # Apply limit
    if limit:
        posts = posts[:limit]
    
    return posts

@app.get("/posts/{slug}")
async def get_post(slug: str):
    """Get a specific post by slug"""
    index = load_content_index()
    
    # Find post in index
    post_meta = None
    for post in index['posts']:
        if post.get('slug') == slug:
            post_meta = post
            break
    
    if not post_meta:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Load full content
    post_content = load_post_content(post_meta['filename'])
    if not post_content:
        raise HTTPException(status_code=404, detail="Post content not found")
    
    return {
        **post_meta,
        'content': post_content['content'],
        'full_metadata': post_content['metadata']
    }

@app.get("/pages/{slug}")
async def get_page(slug: str):
    """Get a specific page by slug"""
    index = load_content_index()
    
    # Find page in index
    page_meta = None
    for page in index['pages']:
        if page.get('slug') == slug:
            page_meta = page
            break
    
    if not page_meta:
        raise HTTPException(status_code=404, detail="Page not found")
    
    # Load full content
    page_content = load_post_content(page_meta['filename'], 'pages')
    if not page_content:
        raise HTTPException(status_code=404, detail="Page content not found")
    
    return {
        **page_meta,
        'content': page_content['content'],
        'full_metadata': page_content['metadata']
    }

@app.get("/categories")
async def get_categories():
    """Get all categories"""
    index = load_content_index()
    return index['categories']

@app.get("/tags")
async def get_tags():
    """Get all tags"""
    index = load_content_index()
    return index['tags']

@app.get("/stats")
async def get_stats():
    """Get blog statistics"""
    index = load_content_index()
    return {
        'total_posts': len(index['posts']),
        'total_pages': len(index['pages']),
        'total_categories': len(index['categories']),
        'total_tags': len(index['tags']),
        'last_updated': index.get('generated_at')
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
'''
        
        backend_main = Path("backend/main.py")
        with open(backend_main, 'w', encoding='utf-8') as f:
            f.write(main_py_content)
        
        print("  Created backend/main.py")
    
    def create_requirements_txt(self):
        """Create requirements.txt for the backend"""
        requirements_content = '''fastapi>=0.104.0
uvicorn[standard]>=0.24.0
python-multipart>=0.0.6
python-frontmatter>=1.0.0
'''
        
        backend_requirements = Path("backend/requirements.txt")
        with open(backend_requirements, 'w', encoding='utf-8') as f:
            f.write(requirements_content)
        
        print("  Created backend/requirements.txt")
    
    def create_dockerfile(self):
        """Create a Dockerfile for easy deployment"""
        dockerfile_content = '''FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
'''
        
        dockerfile = Path("backend/Dockerfile")
        with open(dockerfile, 'w', encoding='utf-8') as f:
            f.write(dockerfile_content)
        
        print("  Created backend/Dockerfile")
    
    def create_deployment_scripts(self):
        """Create helper scripts for deployment"""
        # Create a simple startup script
        start_script = '''#!/bin/bash
# Start the FastAPI backend

echo "Starting FastAPI backend..."
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
'''
        
        start_sh = Path("start_backend.sh")
        with open(start_sh, 'w', encoding='utf-8') as f:
            f.write(start_script)
        
        # Make executable
        start_sh.chmod(0o755)
        print("  Created start_backend.sh")
        
        # Create development docker-compose
        docker_compose = '''version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    environment:
      - PYTHONPATH=/app
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
  
  # Add your React frontend service here
  # frontend:
  #   build: ./frontend
  #   ports:
  #     - "3000:3000"
  #   volumes:
  #     - ./frontend:/app
  #   depends_on:
  #     - backend
'''
        
        compose_file = Path("docker-compose.yml")
        with open(compose_file, 'w', encoding='utf-8') as f:
            f.write(docker_compose)
        
        print("  Created docker-compose.yml")
    
    def run_deployment(self):
        """Run the complete deployment setup"""
        print("Setting up deployment structure...")
        print("=" * 50)
        
        try:
            self.create_fastapi_structure()
            self.copy_content_to_backend()
            self.generate_content_index()
            self.create_fastapi_main()
            self.create_requirements_txt()
            self.create_dockerfile()
            self.create_deployment_scripts()
            
            print("\n" + "=" * 50)
            print("DEPLOYMENT SETUP COMPLETE")
            print("=" * 50)
            print(f"Posts deployed: {self.stats['posts_deployed']}")
            print(f"Pages deployed: {self.stats['pages_deployed']}")
            print(f"Media files copied: {self.stats['media_files_copied']}")
            
            if self.stats['errors']:
                print(f"Errors: {len(self.stats['errors'])}")
                for error in self.stats['errors']:
                    print(f"  - {error}")
            
            print("\nNext steps:")
            print("1. Test the backend: ./start_backend.sh")
            print("2. Visit http://localhost:8000/docs for API documentation")
            print("3. Create your React frontend in the frontend/ directory")
            print("4. Use the API endpoints to fetch content for your React app")
            
        except Exception as e:
            print(f"Deployment setup failed: {str(e)}")
            self.stats['errors'].append(str(e))


def main():
    """Main entry point"""
    deployer = DeploymentHelper()
    deployer.run_deployment()


if __name__ == "__main__":
    main()
