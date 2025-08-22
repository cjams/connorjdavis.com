"""
Configuration settings for WordPress migration
"""

import os
from typing import Optional

class Config:
    # WordPress site configuration
    WORDPRESS_URL = "https://cjams.net"
    WORDPRESS_API_URL = f"{WORDPRESS_URL}/wp-json/wp/v2"
    
    # Output directories
    OUTPUT_DIR = "migrated_content"
    POSTS_DIR = os.path.join(OUTPUT_DIR, "posts")
    PAGES_DIR = os.path.join(OUTPUT_DIR, "pages") 
    MEDIA_DIR = os.path.join(OUTPUT_DIR, "media")
    
    # Content format options
    CONTENT_FORMAT = "markdown"  # or "html"
    INCLUDE_FRONTMATTER = True
    DOWNLOAD_IMAGES = True
    
    # API configuration
    API_TIMEOUT = 30
    MAX_RETRIES = 3
    
    # WordPress credentials (if needed for private content)
    WP_USERNAME: Optional[str] = os.getenv("WP_USERNAME")
    WP_PASSWORD: Optional[str] = os.getenv("WP_PASSWORD")
    
    # Content filtering
    PUBLISHED_ONLY = True
    SKIP_DRAFTS = True
    
    # Image processing
    IMAGE_QUALITY = 85
    RESIZE_IMAGES = True
    MAX_IMAGE_WIDTH = 1200
    
    # FastAPI content structure
    FASTAPI_POSTS_DIR = "backend/content/posts"
    FASTAPI_PAGES_DIR = "backend/content/pages"
    FASTAPI_MEDIA_DIR = "backend/static/media"
    
    @classmethod
    def create_directories(cls):
        """Create all necessary output directories"""
        directories = [
            cls.OUTPUT_DIR,
            cls.POSTS_DIR,
            cls.PAGES_DIR,
            cls.MEDIA_DIR,
            cls.FASTAPI_POSTS_DIR,
            cls.FASTAPI_PAGES_DIR,
            cls.FASTAPI_MEDIA_DIR
        ]
        
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
