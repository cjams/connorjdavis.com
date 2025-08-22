#!/usr/bin/env python3

import requests
import json
import os
import re
from pathlib import Path
import yaml

def fetch_wordpress_data(base_url):
    """Fetch categories, tags, and users from WordPress REST API"""
    
    # Fetch categories
    categories_url = f"{base_url}/wp-json/wp/v2/categories"
    try:
        categories_response = requests.get(categories_url)
        categories_response.raise_for_status()
        categories_data = categories_response.json()
    except requests.RequestException as e:
        print(f"Error fetching categories: {e}")
        return None, None, None
    
    # Fetch tags
    tags_url = f"{base_url}/wp-json/wp/v2/tags"
    try:
        tags_response = requests.get(tags_url)
        tags_response.raise_for_status()
        tags_data = tags_response.json()
    except requests.RequestException as e:
        print(f"Error fetching tags: {e}")
        return None, None, None
    
    # Fetch users
    users_url = f"{base_url}/wp-json/wp/v2/users"
    try:
        users_response = requests.get(users_url)
        users_response.raise_for_status()
        users_data = users_response.json()
    except requests.RequestException as e:
        print(f"Error fetching users: {e}")
        return None, None, None
    
    return categories_data, tags_data, users_data

def create_mappings(categories_data, tags_data, users_data):
    """Create ID to name mappings from WordPress data"""
    
    # Categories mapping
    categories_mapping = {}
    if categories_data:
        for category in categories_data:
            categories_mapping[category['id']] = category['name']
    
    # Tags mapping
    tags_mapping = {}
    if tags_data:
        for tag in tags_data:
            tags_mapping[tag['id']] = tag['name']
    
    # Users mapping
    users_mapping = {}
    if users_data:
        for user in users_data:
            users_mapping[user['id']] = user['name']
    
    return categories_mapping, tags_mapping, users_mapping

def update_markdown_file(file_path, categories_mapping, tags_mapping, users_mapping):
    """Update a markdown file to replace numerical IDs with text values"""
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Split content into frontmatter and body
        if content.startswith('---'):
            parts = content.split('---', 2)
            if len(parts) >= 3:
                frontmatter_str = parts[1]
                body = '---'.join(['', '', parts[2]])
                
                # Parse YAML frontmatter
                try:
                    frontmatter = yaml.safe_load(frontmatter_str)
                except yaml.YAMLError as e:
                    print(f"Error parsing YAML in {file_path}: {e}")
                    return False
                
                # Update author
                if 'author' in frontmatter and isinstance(frontmatter['author'], int):
                    if frontmatter['author'] in users_mapping:
                        frontmatter['author'] = users_mapping[frontmatter['author']]
                        print(f"Updated author {frontmatter['author']} in {file_path}")
                
                # Update categories
                if 'categories' in frontmatter and isinstance(frontmatter['categories'], list):
                    updated_categories = []
                    for cat in frontmatter['categories']:
                        if isinstance(cat, int) and cat in categories_mapping:
                            updated_categories.append(categories_mapping[cat])
                            print(f"Updated category {cat} -> {categories_mapping[cat]} in {file_path}")
                        else:
                            updated_categories.append(cat)
                    frontmatter['categories'] = updated_categories
                
                # Update tags
                if 'tags' in frontmatter and isinstance(frontmatter['tags'], list):
                    updated_tags = []
                    for tag in frontmatter['tags']:
                        if isinstance(tag, int) and tag in tags_mapping:
                            updated_tags.append(tags_mapping[tag])
                            print(f"Updated tag {tag} -> {tags_mapping[tag]} in {file_path}")
                        else:
                            updated_tags.append(tag)
                    frontmatter['tags'] = updated_tags
                
                # Write back the file
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write('---\n')
                    yaml.dump(frontmatter, f, default_flow_style=False, allow_unicode=True)
                    f.write(body)
                
                return True
            else:
                print(f"Invalid frontmatter structure in {file_path}")
                return False
        else:
            print(f"No frontmatter found in {file_path}")
            return False
            
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    # WordPress site URL
    wordpress_url = "https://cjams.net"
    
    print("Fetching WordPress taxonomy data...")
    categories_data, tags_data, users_data = fetch_wordpress_data(wordpress_url)
    
    if not all([categories_data, tags_data, users_data]):
        print("Failed to fetch WordPress data")
        return
    
    print("Creating mappings...")
    categories_mapping, tags_mapping, users_mapping = create_mappings(categories_data, tags_data, users_data)
    
    print(f"Found {len(categories_mapping)} categories")
    print(f"Found {len(tags_mapping)} tags")
    print(f"Found {len(users_mapping)} users")
    
    # Save mappings to a file for reference
    mappings = {
        'categories': categories_mapping,
        'tags': tags_mapping,
        'users': users_mapping
    }
    
    with open('wordpress_mappings.json', 'w', encoding='utf-8') as f:
        json.dump(mappings, f, indent=2, ensure_ascii=False)
    
    print("Saved mappings to wordpress_mappings.json")
    
    # Update migrated content files
    migrated_content_dir = Path('migrated_content')
    
    if not migrated_content_dir.exists():
        print("migrated_content directory not found")
        return
    
    # Find all markdown files
    markdown_files = []
    for posts_dir in ['posts', 'pages']:
        posts_path = migrated_content_dir / posts_dir
        if posts_path.exists():
            markdown_files.extend(posts_path.glob('*.md'))
    
    print(f"\nProcessing {len(markdown_files)} markdown files...")
    
    updated_count = 0
    for md_file in markdown_files:
        print(f"\nProcessing {md_file}")
        if update_markdown_file(md_file, categories_mapping, tags_mapping, users_mapping):
            updated_count += 1
    
    print(f"\nCompleted! Updated {updated_count} files.")
    
    # Display the mappings for reference
    print("\n=== MAPPINGS REFERENCE ===")
    print("\nCategories:")
    for cat_id, cat_name in categories_mapping.items():
        print(f"  {cat_id}: {cat_name}")
    
    print("\nTags:")
    for tag_id, tag_name in tags_mapping.items():
        print(f"  {tag_id}: {tag_name}")
    
    print("\nUsers:")
    for user_id, user_name in users_mapping.items():
        print(f"  {user_id}: {user_name}")

if __name__ == "__main__":
    main()
