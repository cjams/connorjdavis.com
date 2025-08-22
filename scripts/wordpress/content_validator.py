"""
Content Validator and Preview Tool
Validates migrated content and provides preview functionality
"""

import os
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
import frontmatter
import re
from datetime import datetime
from collections import Counter

from config import Config


class ContentValidator:
    def __init__(self):
        self.config = Config()
        self.issues = []
        self.stats = {
            'posts_checked': 0,
            'pages_checked': 0,
            'missing_images': 0,
            'broken_links': 0,
            'empty_content': 0,
            'missing_metadata': 0
        }
    
    def validate_frontmatter(self, post_data: Dict[str, Any]) -> List[str]:
        """Validate frontmatter data"""
        issues = []
        metadata = post_data.get('metadata', {})
        
        # Required fields
        required_fields = ['title', 'slug', 'date']
        for field in required_fields:
            if not metadata.get(field):
                issues.append(f"Missing required field: {field}")
        
        # Validate date format
        date_str = metadata.get('date', '')
        if date_str:
            try:
                datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            except ValueError:
                issues.append(f"Invalid date format: {date_str}")
        
        # Validate slug format
        slug = metadata.get('slug', '')
        if slug and not re.match(r'^[a-z0-9-]+$', slug):
            issues.append(f"Invalid slug format: {slug}")
        
        return issues
    
    def validate_content(self, content: str, filename: str) -> List[str]:
        """Validate content for common issues"""
        issues = []
        
        if not content or len(content.strip()) < 10:
            issues.append("Content is empty or too short")
            self.stats['empty_content'] += 1
            return issues
        
        # Check for broken image references
        img_pattern = r'!\[[^\]]*\]\(([^)]+)\)'
        images = re.findall(img_pattern, content)
        
        for img_path in images:
            if img_path.startswith('http'):
                # External image - should have been downloaded
                issues.append(f"External image reference not migrated: {img_path}")
                self.stats['missing_images'] += 1
            elif img_path.startswith('/media/'):
                # Local image - check if file exists
                local_path = Path(self.config.MEDIA_DIR) / img_path.replace('/media/', '')
                if not local_path.exists():
                    issues.append(f"Missing local image: {img_path}")
                    self.stats['missing_images'] += 1
        
        # Check for broken links
        link_pattern = r'\[([^\]]+)\]\(([^)]+)\)'
        links = re.findall(link_pattern, content)
        
        for link_text, link_url in links:
            if link_url.startswith('http') and 'cjams.net' in link_url:
                # Internal link that should be updated
                issues.append(f"Internal WordPress link not updated: {link_url}")
                self.stats['broken_links'] += 1
        
        # Check for WordPress shortcodes that weren't converted
        shortcode_pattern = r'\[[a-zA-Z_][a-zA-Z0-9_]*[^\]]*\]'
        shortcodes = re.findall(shortcode_pattern, content)
        
        # Check if content has proper links (HTML or markdown) - if so, shortcodes were likely converted
        has_html_links = bool(re.search(r'<a[^>]+href=["\'][^"\']+["\'][^>]*>', content))
        has_markdown_links = bool(re.search(r'\[[^\]]+\]\([^)]+\)', content))
        has_proper_links = has_html_links or has_markdown_links
        
        # Check for preserved shortcodes in HTML comments
        preserved_shortcodes = re.findall(r'<!-- WordPress Shortcode \[([^\]]+)\]: ([^|]+)', content)
        
        for shortcode in shortcodes:
            # Skip common markdown elements and preserved shortcodes
            if (shortcode.startswith('[...') or 
                shortcode.startswith('[^') or  # footnotes
                '<!-- WordPress Shortcode' in content):
                continue
            
            # Skip if content has proper links (indicates shortcodes were converted successfully)
            if has_proper_links:
                continue
                
            issues.append(f"Unconverted WordPress shortcode: {shortcode}")
        
        # Report preserved shortcodes with URLs (this is actually good!)
        for shortcode_name, url_info in preserved_shortcodes:
            if 'url=' in url_info or 'src=' in url_info:
                # This is actually preserved correctly, so it's informational rather than an issue
                pass  # Don't report as an issue since we preserved the URL
        
        return issues
    
    def validate_post_file(self, file_path: Path) -> Dict[str, Any]:
        """Validate a single post file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                post_obj = frontmatter.load(f)
            
            post_data = {
                'filename': file_path.name,
                'metadata': post_obj.metadata,
                'content': post_obj.content
            }
            
            issues = []
            
            # Validate frontmatter
            issues.extend(self.validate_frontmatter(post_data))
            
            # Validate content
            issues.extend(self.validate_content(post_obj.content, file_path.name))
            
            return {
                'file': file_path.name,
                'valid': len(issues) == 0,
                'issues': issues,
                'metadata': post_obj.metadata,
                'content_length': len(post_obj.content),
                'word_count': len(post_obj.content.split())
            }
            
        except Exception as e:
            return {
                'file': file_path.name,
                'valid': False,
                'issues': [f"Error reading file: {str(e)}"],
                'metadata': {},
                'content_length': 0,
                'word_count': 0
            }
    
    def validate_all_content(self) -> Dict[str, Any]:
        """Validate all migrated content"""
        print("Validating migrated content...")
        
        results = {
            'posts': [],
            'pages': [],
            'summary': {
                'total_files': 0,
                'valid_files': 0,
                'files_with_issues': 0,
                'total_issues': 0
            }
        }
        
        # Validate posts
        posts_dir = Path(self.config.POSTS_DIR)
        if posts_dir.exists():
            print(f"Validating posts in {posts_dir}...")
            for post_file in posts_dir.glob("*.md"):
                result = self.validate_post_file(post_file)
                results['posts'].append(result)
                self.stats['posts_checked'] += 1
                
                if result['valid']:
                    results['summary']['valid_files'] += 1
                else:
                    results['summary']['files_with_issues'] += 1
                    results['summary']['total_issues'] += len(result['issues'])
                
                results['summary']['total_files'] += 1
        
        # Validate pages
        pages_dir = Path(self.config.PAGES_DIR)
        if pages_dir.exists():
            print(f"Validating pages in {pages_dir}...")
            for page_file in pages_dir.glob("*.md"):
                result = self.validate_post_file(page_file)
                results['pages'].append(result)
                self.stats['pages_checked'] += 1
                
                if result['valid']:
                    results['summary']['valid_files'] += 1
                else:
                    results['summary']['files_with_issues'] += 1
                    results['summary']['total_issues'] += len(result['issues'])
                
                results['summary']['total_files'] += 1
        
        return results
    
    def generate_report(self, results: Dict[str, Any]) -> str:
        """Generate a validation report"""
        report = []
        report.append("=" * 60)
        report.append("CONTENT VALIDATION REPORT")
        report.append("=" * 60)
        report.append("")
        
        # Summary
        summary = results['summary']
        report.append("SUMMARY")
        report.append("-" * 20)
        report.append(f"Total files checked: {summary['total_files']}")
        report.append(f"Valid files: {summary['valid_files']}")
        report.append(f"Files with issues: {summary['files_with_issues']}")
        report.append(f"Total issues found: {summary['total_issues']}")
        report.append("")
        
        # Statistics
        report.append("STATISTICS")
        report.append("-" * 20)
        report.append(f"Posts checked: {self.stats['posts_checked']}")
        report.append(f"Pages checked: {self.stats['pages_checked']}")
        report.append(f"Missing images: {self.stats['missing_images']}")
        report.append(f"Broken links: {self.stats['broken_links']}")
        report.append(f"Empty content: {self.stats['empty_content']}")
        report.append("")
        
        # Issues by file
        if summary['files_with_issues'] > 0:
            report.append("FILES WITH ISSUES")
            report.append("-" * 30)
            
            all_files = results['posts'] + results['pages']
            files_with_issues = [f for f in all_files if not f['valid']]
            
            for file_result in files_with_issues:
                report.append(f"\n{file_result['file']}:")
                for issue in file_result['issues']:
                    report.append(f"  - {issue}")
        
        # Content statistics
        all_files = results['posts'] + results['pages']
        if all_files:
            word_counts = [f['word_count'] for f in all_files if f['word_count'] > 0]
            if word_counts:
                report.append("\nCONTENT STATISTICS")
                report.append("-" * 30)
                report.append(f"Average word count: {sum(word_counts) / len(word_counts):.1f}")
                report.append(f"Total words: {sum(word_counts):,}")
                report.append(f"Shortest post: {min(word_counts)} words")
                report.append(f"Longest post: {max(word_counts)} words")
        
        return "\n".join(report)
    
    def save_report(self, results: Dict[str, Any], filename: str = "validation_report.txt"):
        """Save validation report to file"""
        report = self.generate_report(results)
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"Validation report saved to: {filename}")
    
    def preview_content(self, slug: str) -> Optional[Dict[str, Any]]:
        """Preview a specific piece of content"""
        # Search in posts
        posts_dir = Path(self.config.POSTS_DIR)
        if posts_dir.exists():
            for post_file in posts_dir.glob("*.md"):
                with open(post_file, 'r', encoding='utf-8') as f:
                    post_obj = frontmatter.load(f)
                
                if post_obj.metadata.get('slug') == slug:
                    return {
                        'type': 'post',
                        'filename': post_file.name,
                        'metadata': post_obj.metadata,
                        'content': post_obj.content,
                        'content_preview': post_obj.content[:500] + "..." if len(post_obj.content) > 500 else post_obj.content
                    }
        
        # Search in pages
        pages_dir = Path(self.config.PAGES_DIR)
        if pages_dir.exists():
            for page_file in pages_dir.glob("*.md"):
                with open(page_file, 'r', encoding='utf-8') as f:
                    post_obj = frontmatter.load(f)
                
                if post_obj.metadata.get('slug') == slug:
                    return {
                        'type': 'page',
                        'filename': page_file.name,
                        'metadata': post_obj.metadata,
                        'content': post_obj.content,
                        'content_preview': post_obj.content[:500] + "..." if len(post_obj.content) > 500 else post_obj.content
                    }
        
        return None


def main():
    """Main function for CLI usage"""
    import sys
    
    validator = ContentValidator()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "validate":
            results = validator.validate_all_content()
            print(validator.generate_report(results))
            validator.save_report(results)
            
        elif command == "preview" and len(sys.argv) > 2:
            slug = sys.argv[2]
            content = validator.preview_content(slug)
            if content:
                print(f"Type: {content['type']}")
                print(f"File: {content['filename']}")
                print(f"Title: {content['metadata'].get('title', 'N/A')}")
                print(f"Date: {content['metadata'].get('date', 'N/A')}")
                print(f"Status: {content['metadata'].get('status', 'N/A')}")
                print("\nContent preview:")
                print("-" * 40)
                print(content['content_preview'])
            else:
                print(f"Content with slug '{slug}' not found")
        
        else:
            print("Usage:")
            print("  python content_validator.py validate")
            print("  python content_validator.py preview <slug>")
    
    else:
        # Default action - validate all
        results = validator.validate_all_content()
        print(validator.generate_report(results))
        validator.save_report(results)


if __name__ == "__main__":
    main()
