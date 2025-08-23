# WordPress to FastAPI/React Migration Tool

This toolkit helps you migrate your WordPress website content to a modern FastAPI backend with React frontend structure. It provides scripts to extract content via WordPress REST API, validate the migration, and set up a deployment-ready structure.

## Features

- ✅ **Content Migration**: Extract posts, pages, and media from WordPress REST API
- ✅ **Format Conversion**: Convert HTML content to Markdown with frontmatter
- ✅ **Media Download**: Download and organize WordPress media files
- ✅ **Content Validation**: Validate migrated content for issues
- ✅ **FastAPI Backend**: Generate ready-to-use FastAPI backend with content APIs
- ✅ **Deployment Ready**: Docker, docker-compose, and startup scripts included

## Quick Start

### 1. Installation

```bash
# Install Python dependencies
pip install -r requirements.txt
```

### 2. Run Complete Migration

```bash
# Run the full migration process
python migrate.py
```

This will:

1. Migrate all content from your WordPress site
2. Validate the migrated content
3. Set up the FastAPI backend structure
4. Generate content index and API endpoints

### 3. Test Your Backend

```bash
# Start the FastAPI backend
./start_backend.sh

# Or manually:
cd backend
uvicorn main:app --reload
```

Visit `http://localhost:8000/docs` to see your API documentation.

## Individual Scripts

### `wordpress_migrator.py` - Main Migration Script

Extracts content from WordPress via REST API and converts to Markdown.

```bash
python wordpress_migrator.py
```

**Configuration**: Edit `config.py` to customize:

- WordPress URL
- Output directories
- Content format (Markdown/HTML)
- Image download settings

### `content_validator.py` - Validation Tool

Validates migrated content for common issues.

```bash
# Validate all content
python content_validator.py validate

# Preview specific content
python content_validator.py preview <slug>
```

### `deploy_helper.py` - Deployment Setup

Organizes content into FastAPI backend structure.

```bash
python deploy_helper.py
```

Creates:

- `backend/` - FastAPI application
- `frontend/` - React app structure (empty)
- Docker configuration
- Content index for fast API responses

### `fastapi_content_manager.py` - Content Management API

Advanced content management server with CRUD operations.

```bash
python fastapi_content_manager.py
```

Provides API endpoints for:

- Creating/editing posts
- Media upload
- Content statistics

## Project Structure

After migration, your project will look like:

```
wp-blog-migrator/
├── migrated_content/           # Raw migrated content
│   ├── posts/                 # Blog posts (.md files)
│   ├── pages/                 # Pages (.md files)
│   └── media/                 # Downloaded images
├── backend/                   # FastAPI backend
│   ├── main.py               # Main FastAPI app
│   ├── content/              # Content files
│   │   ├── posts/           # Posts for production
│   │   ├── pages/           # Pages for production
│   │   └── index.json       # Content index
│   ├── static/media/         # Static media files
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile           # Docker configuration
├── frontend/                  # React frontend (structure only)
├── docker-compose.yml        # Development environment
└── start_backend.sh          # Quick start script
```

## Content Format

Each migrated post/page is saved as a Markdown file with YAML frontmatter:

```markdown
---
title: "Your Post Title"
slug: "your-post-slug"
date: "2024-01-15T10:30:00"
status: "publish"
categories: ["Technology", "Web Development"]
tags: ["fastapi", "react", "wordpress"]
featured_image: "/media/featured-image.jpg"
excerpt: "Post excerpt..."
wordpress_id: 123
wordpress_url: "https://yoursite.com/post-url"
---

# Your Post Content

This is the main content of your post converted to Markdown...

![Image description](/media/image.jpg)
```

## API Endpoints

The generated FastAPI backend provides these endpoints:

### Content Endpoints

- `GET /posts` - List all posts (with filtering)
- `GET /posts/{slug}` - Get specific post
- `GET /pages/{slug}` - Get specific page
- `GET /categories` - List all categories
- `GET /tags` - List all tags
- `GET /stats` - Get content statistics

### Example Usage

```javascript
// Fetch all posts
const posts = await fetch("http://localhost:8000/posts").then((r) => r.json());

// Fetch specific post
const post = await fetch("http://localhost:8000/posts/my-post-slug").then((r) =>
  r.json()
);

// Fetch posts by category
const techPosts = await fetch(
  "http://localhost:8000/posts?category=Technology"
).then((r) => r.json());
```

## Configuration

### `config.py` Settings

```python
class Config:
    # WordPress site
    WORDPRESS_URL = "https://cjams.net"

    # Content options
    CONTENT_FORMAT = "markdown"  # or "html"
    DOWNLOAD_IMAGES = True
    PUBLISHED_ONLY = True

    # Output directories
    OUTPUT_DIR = "migrated_content"
    POSTS_DIR = "migrated_content/posts"
    PAGES_DIR = "migrated_content/pages"
    MEDIA_DIR = "migrated_content/media"
```

## React Frontend Integration

To use the migrated content in your React app:

1. **Fetch Posts List**:

```jsx
import { useState, useEffect } from "react";

function BlogList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/posts")
      .then((res) => res.json())
      .then(setPosts);
  }, []);

  return (
    <div>
      {posts.map((post) => (
        <article key={post.slug}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
          <Link to={`/posts/${post.slug}`}>Read more</Link>
        </article>
      ))}
    </div>
  );
}
```

2. **Individual Post Component**:

```jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/posts/${slug}`)
      .then((res) => res.json())
      .then(setPost);
  }, [slug]);

  if (!post) return <div>Loading...</div>;

  return (
    <article>
      <h1>{post.title}</h1>
      <time>{new Date(post.date).toLocaleDateString()}</time>
      <ReactMarkdown>{post.content}</ReactMarkdown>
    </article>
  );
}
```

## Deployment

### Development

```bash
# Start backend
./start_backend.sh

# In another terminal, start your React app
cd frontend
npm start
```

### Production with Docker

```bash
# Build and run with docker-compose
docker-compose up --build
```

### Manual Production Deployment

1. Deploy the `backend/` directory to your server
2. Install dependencies: `pip install -r requirements.txt`
3. Run with: `uvicorn main:app --host 0.0.0.0 --port 8000`
4. Build and deploy your React frontend
5. Configure your React app to use the backend API URL

## Troubleshooting

### Common Issues

1. **WordPress API not accessible**:

   - Ensure your WordPress site has REST API enabled
   - Check if the site requires authentication

2. **Images not downloading**:

   - Check network connectivity
   - Verify image URLs are accessible
   - Set `DOWNLOAD_IMAGES = False` to skip image download

3. **Content validation errors**:

   - Run `python content_validator.py validate` to see issues
   - Check the validation report for specific problems

4. **FastAPI startup errors**:
   - Ensure all dependencies are installed
   - Check that content files exist in `backend/content/`

### Getting Help

1. Check the validation report: `validation_report.txt`
2. Review error logs in the console output
3. Test individual components separately

## Customization

### Adding Custom Fields

Edit the `create_frontmatter()` method in `wordpress_migrator.py` to extract additional WordPress metadata.

### Custom Content Processing

Modify the `convert_to_markdown()` method to handle specific WordPress shortcodes or custom HTML.

### API Customization

Edit `backend/main.py` to add custom endpoints or modify existing ones.

## Next Steps

1. **Create your React frontend** in the `frontend/` directory
2. **Customize the design** - the backend provides flexible content APIs
3. **Add creative coding features** - you have full control over the React components
4. **Deploy to production** - use the provided Docker setup or deploy manually

Your migrated content is now ready for modern web development with full React flexibility!
