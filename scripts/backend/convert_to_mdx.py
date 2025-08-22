#!/usr/bin/env python3

import os
import re
import json
import shutil
import frontmatter
from pathlib import Path
from datetime import datetime
import html

def calculate_reading_time(content):
    """Calculate reading time based on average reading speed"""
    words = len(content.split())
    # Average reading speed is 200-250 words per minute
    minutes = max(1, round(words / 225))
    return minutes

def clean_excerpt(excerpt):
    """Clean HTML excerpt and convert to plain text"""
    if not excerpt:
        return ""
    
    # Remove HTML tags
    clean = re.sub(r'<[^>]+>', '', excerpt)
    # Decode HTML entities
    clean = html.unescape(clean)
    # Clean up extra whitespace
    clean = re.sub(r'\s+', ' ', clean).strip()
    # Remove "Read more" links
    clean = re.sub(r'Read more.*?$', '', clean)
    return clean

def generate_excerpt_from_content(content, max_sentences=2):
    """Generate excerpt from the first few sentences of content"""
    # Remove markdown headers
    content = re.sub(r'^#+\s+.*$', '', content, flags=re.MULTILINE)
    # Split into sentences
    sentences = re.split(r'[.!?]+\s+', content.strip())
    # Take first few sentences
    excerpt = '. '.join(sentences[:max_sentences]).strip()
    if excerpt and not excerpt.endswith('.'):
        excerpt += '.'
    return excerpt

def clean_frontmatter(metadata):
    """Clean and standardize frontmatter"""
    cleaned = {}
    
    # Keep essential fields
    essential_fields = ['title', 'author', 'date', 'slug', 'categories', 'tags', 'status']
    for field in essential_fields:
        if field in metadata:
            cleaned[field] = metadata[field]
    
    # Convert date to ISO format if needed
    if 'date' in cleaned:
        if isinstance(cleaned['date'], str):
            try:
                # Parse various date formats
                dt = datetime.fromisoformat(cleaned['date'].replace('T', ' ').replace('Z', ''))
                cleaned['date'] = dt.isoformat()
            except:
                pass
    
    # Ensure categories and tags are lists and filter out numerical values
    for field in ['categories', 'tags']:
        if field in cleaned:
            if not isinstance(cleaned[field], list):
                cleaned[field] = [cleaned[field]]
            # Filter out numerical values that couldn't be mapped
            cleaned[field] = [item for item in cleaned[field] if isinstance(item, str)]
    
    # Set default status
    if 'status' not in cleaned:
        cleaned['status'] = 'published'
    
    return cleaned

def convert_post_to_mdx(input_file, output_file):
    """Convert a single markdown post to MDX format"""
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            post = frontmatter.load(f)
        
        # Clean frontmatter
        cleaned_metadata = clean_frontmatter(post.metadata)
        
        # Generate or clean excerpt
        if 'excerpt' in post.metadata:
            excerpt = clean_excerpt(post.metadata['excerpt'])
        else:
            excerpt = generate_excerpt_from_content(post.content)
        
        if excerpt:
            cleaned_metadata['excerpt'] = excerpt
        
        # Calculate reading time
        cleaned_metadata['reading_time'] = calculate_reading_time(post.content)
        
        # Create new post object
        new_post = frontmatter.Post(post.content, **cleaned_metadata)
        
        # Write MDX file
        output_file.parent.mkdir(parents=True, exist_ok=True)
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(frontmatter.dumps(new_post))
        
        print(f"Converted: {input_file.name} -> {output_file.name}")
        return True
        
    except Exception as e:
        print(f"Error converting {input_file}: {e}")
        return False

def update_content_index():
    """Update the content index with MDX files"""
    posts_dir = Path('backend/content/posts')
    pages_dir = Path('backend/content/pages')
    
    index_data = {
        'posts': [],
        'pages': [],
        'categories': set(),
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
                    'slug': post.metadata.get('slug', mdx_file.stem),
                    'title': post.metadata.get('title', ''),
                    'date': post.metadata.get('date', ''),
                    'author': post.metadata.get('author', ''),
                    'excerpt': post.metadata.get('excerpt', ''),
                    'reading_time': post.metadata.get('reading_time', 1),
                    'categories': post.metadata.get('categories', []),
                    'tags': post.metadata.get('tags', []),
                    'status': post.metadata.get('status', 'published')
                }
                
                index_data['posts'].append(post_data)
                
                # Collect categories and tags
                for cat in post.metadata.get('categories', []):
                    index_data['categories'].add(cat)
                for tag in post.metadata.get('tags', []):
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
                    'slug': post.metadata.get('slug', mdx_file.stem),
                    'title': post.metadata.get('title', ''),
                    'date': post.metadata.get('date', ''),
                    'author': post.metadata.get('author', ''),
                    'status': post.metadata.get('status', 'published')
                }
                
                index_data['pages'].append(page_data)
                
            except Exception as e:
                print(f"Error indexing {mdx_file}: {e}")
    
    # Convert sets to lists and sort
    index_data['categories'] = sorted(list(index_data['categories']))
    index_data['tags'] = sorted(list(index_data['tags']))
    
    # Sort posts by date (newest first)
    index_data['posts'].sort(key=lambda x: x['date'], reverse=True)
    
    # Write index file
    index_file = Path('backend/content/index.json')
    with open(index_file, 'w', encoding='utf-8') as f:
        json.dump(index_data, f, indent=2, ensure_ascii=False)
    
    print(f"Updated index with {len(index_data['posts'])} posts and {len(index_data['pages'])} pages")

def main():
    print("Converting posts to MDX format...")
    
    # Paths
    source_posts = Path('backend/content/posts')
    source_pages = Path('backend/content/pages')
    
    converted_count = 0
    
    # Convert posts
    if source_posts.exists():
        for md_file in source_posts.glob('*.md'):
            mdx_file = source_posts / f"{md_file.stem}.mdx"
            if convert_post_to_mdx(md_file, mdx_file):
                converted_count += 1
                # Remove original .md file
                md_file.unlink()
    
    # Convert pages
    if source_pages.exists():
        for md_file in source_pages.glob('*.md'):
            mdx_file = source_pages / f"{md_file.stem}.mdx"
            if convert_post_to_mdx(md_file, mdx_file):
                converted_count += 1
                # Remove original .md file
                md_file.unlink()
    
    print(f"Converted {converted_count} files to MDX format")
    
    # Update content index
    update_content_index()
    print("Conversion complete!")

if __name__ == "__main__":
    main()
