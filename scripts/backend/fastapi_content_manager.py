"""
FastAPI Content Management System
Provides API endpoints for managing migrated WordPress content
"""

from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
import json
from pathlib import Path
import frontmatter
from slugify import slugify
import shutil

from config import Config


# Pydantic models for API
class PostBase(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = ""
    categories: Optional[List[str]] = []
    tags: Optional[List[str]] = []
    featured_image: Optional[str] = None
    status: str = "publish"


class PostCreate(PostBase):
    pass


class PostUpdate(PostBase):
    pass


class Post(PostBase):
    slug: str
    date: datetime
    modified: datetime
    wordpress_id: Optional[int] = None
    wordpress_url: Optional[str] = None

    class Config:
        from_attributes = True


class ContentManager:
    def __init__(self):
        self.config = Config()
        self.config.create_directories()
    
    def get_all_posts(self) -> List[Dict[str, Any]]:
        """Get all posts with metadata"""
        posts = []
        posts_dir = Path(self.config.POSTS_DIR)
        
        if not posts_dir.exists():
            return posts
        
        for post_file in posts_dir.glob("*.md"):
            try:
                with open(post_file, 'r', encoding='utf-8') as f:
                    post_obj = frontmatter.load(f)
                
                post_data = {
                    'filename': post_file.name,
                    'slug': post_obj.metadata.get('slug', ''),
                    'title': post_obj.metadata.get('title', ''),
                    'date': post_obj.metadata.get('date', ''),
                    'status': post_obj.metadata.get('status', 'publish'),
                    'excerpt': post_obj.metadata.get('excerpt', ''),
                    'categories': post_obj.metadata.get('categories', []),
                    'tags': post_obj.metadata.get('tags', []),
                    'featured_image': post_obj.metadata.get('featured_image', ''),
                    'content': post_obj.content,
                    'metadata': post_obj.metadata
                }
                posts.append(post_data)
                
            except Exception as e:
                print(f"Error reading post {post_file}: {e}")
                continue
        
        # Sort by date (newest first)
        posts.sort(key=lambda x: x.get('date', ''), reverse=True)
        return posts
    
    def get_post_by_slug(self, slug: str) -> Optional[Dict[str, Any]]:
        """Get a specific post by slug"""
        posts = self.get_all_posts()
        for post in posts:
            if post.get('slug') == slug:
                return post
        return None
    
    def create_post(self, post_data: PostCreate) -> Dict[str, Any]:
        """Create a new post"""
        # Generate slug
        slug = slugify(post_data.title)
        
        # Check if slug already exists
        existing_post = self.get_post_by_slug(slug)
        if existing_post:
            # Add timestamp to make unique
            timestamp = datetime.now().strftime("%H%M%S")
            slug = f"{slug}-{timestamp}"
        
        # Create frontmatter
        now = datetime.now()
        frontmatter_data = {
            'title': post_data.title,
            'slug': slug,
            'date': now.isoformat(),
            'modified': now.isoformat(),
            'status': post_data.status,
            'excerpt': post_data.excerpt,
            'categories': post_data.categories,
            'tags': post_data.tags,
            'featured_image': post_data.featured_image,
        }
        
        # Create post object
        post_obj = frontmatter.Post(post_data.content, **frontmatter_data)
        
        # Generate filename
        date_str = now.strftime("%Y-%m-%d")
        filename = f"{date_str}-{slug}.md"
        
        # Save file
        file_path = Path(self.config.POSTS_DIR) / filename
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(frontmatter.dumps(post_obj))
        
        return {
            'filename': filename,
            'slug': slug,
            'title': post_data.title,
            'date': now.isoformat(),
            'status': post_data.status,
            'message': 'Post created successfully'
        }
    
    def update_post(self, slug: str, post_data: PostUpdate) -> Dict[str, Any]:
        """Update an existing post"""
        # Find the post file
        posts_dir = Path(self.config.POSTS_DIR)
        post_file = None
        
        for file_path in posts_dir.glob("*.md"):
            with open(file_path, 'r', encoding='utf-8') as f:
                post_obj = frontmatter.load(f)
            
            if post_obj.metadata.get('slug') == slug:
                post_file = file_path
                break
        
        if not post_file:
            raise HTTPException(status_code=404, detail="Post not found")
        
        # Load existing post
        with open(post_file, 'r', encoding='utf-8') as f:
            post_obj = frontmatter.load(f)
        
        # Update metadata
        post_obj.metadata.update({
            'title': post_data.title,
            'modified': datetime.now().isoformat(),
            'status': post_data.status,
            'excerpt': post_data.excerpt,
            'categories': post_data.categories,
            'tags': post_data.tags,
            'featured_image': post_data.featured_image,
        })
        
        # Update content
        post_obj.content = post_data.content
        
        # Save file
        with open(post_file, 'w', encoding='utf-8') as f:
            f.write(frontmatter.dumps(post_obj))
        
        return {
            'slug': slug,
            'message': 'Post updated successfully'
        }
    
    def delete_post(self, slug: str) -> Dict[str, Any]:
        """Delete a post"""
        # Find the post file
        posts_dir = Path(self.config.POSTS_DIR)
        
        for file_path in posts_dir.glob("*.md"):
            with open(file_path, 'r', encoding='utf-8') as f:
                post_obj = frontmatter.load(f)
            
            if post_obj.metadata.get('slug') == slug:
                os.remove(file_path)
                return {'message': 'Post deleted successfully'}
        
        raise HTTPException(status_code=404, detail="Post not found")
    
    def upload_media(self, file: UploadFile) -> Dict[str, Any]:
        """Upload a media file"""
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="File type not allowed")
        
        # Generate safe filename
        filename = slugify(file.filename.split('.')[0]) + '.' + file.filename.split('.')[-1]
        file_path = Path(self.config.MEDIA_DIR) / filename
        
        # Save file
        with open(file_path, 'wb') as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {
            'filename': filename,
            'url': f'/media/{filename}',
            'message': 'File uploaded successfully'
        }


# Initialize FastAPI app
app = FastAPI(title="WordPress Migration Content Manager", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
config = Config()
if os.path.exists(config.MEDIA_DIR):
    app.mount("/media", StaticFiles(directory=config.MEDIA_DIR), name="media")

# Initialize content manager
content_manager = ContentManager()


# API Routes
@app.get("/")
async def root():
    return {"message": "WordPress Migration Content Manager API"}


@app.get("/posts", response_model=List[Dict[str, Any]])
async def get_posts():
    """Get all posts"""
    return content_manager.get_all_posts()


@app.get("/posts/{slug}")
async def get_post(slug: str):
    """Get a specific post by slug"""
    post = content_manager.get_post_by_slug(slug)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@app.post("/posts")
async def create_post(post: PostCreate):
    """Create a new post"""
    return content_manager.create_post(post)


@app.put("/posts/{slug}")
async def update_post(slug: str, post: PostUpdate):
    """Update an existing post"""
    return content_manager.update_post(slug, post)


@app.delete("/posts/{slug}")
async def delete_post(slug: str):
    """Delete a post"""
    return content_manager.delete_post(slug)


@app.post("/media/upload")
async def upload_media(file: UploadFile = File(...)):
    """Upload a media file"""
    return content_manager.upload_media(file)


@app.get("/stats")
async def get_stats():
    """Get content statistics"""
    posts = content_manager.get_all_posts()
    
    stats = {
        'total_posts': len(posts),
        'published_posts': len([p for p in posts if p.get('status') == 'publish']),
        'draft_posts': len([p for p in posts if p.get('status') == 'draft']),
        'categories': list(set([cat for post in posts for cat in post.get('categories', [])])),
        'tags': list(set([tag for post in posts for tag in post.get('tags', [])])),
    }
    
    return stats


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
