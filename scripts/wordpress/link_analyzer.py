#!/usr/bin/env python3
"""
WordPress Link Analyzer
Analyzes HTML and markdown links in migrated content and extracts URLs
"""

import re
import json
from pathlib import Path
from typing import Dict, List, Any, Set
import frontmatter
from collections import defaultdict
from urllib.parse import urlparse

from config import Config


class LinkAnalyzer:
    def __init__(self):
        self.config = Config()
        self.links_extracted = []
        self.conversion_stats = {
            'html_links_found': 0,
            'markdown_links_found': 0,
            'images_found': 0,
            'internal_wordpress_links': 0,
            'external_links': 0,
            'total_links': 0
        }
    
    def extract_html_links(self, content: str, filename: str) -> List[Dict[str, Any]]:
        """Extract HTML links from content"""
        links = []
        
        # Find HTML links: <a href="url">text</a>
        html_link_pattern = r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>([^<]*)</a>'
        html_matches = re.findall(html_link_pattern, content, re.IGNORECASE)
        
        for url, text in html_matches:
            links.append({
                'type': 'html_link',
                'url': url,
                'text': text.strip(),
                'file': filename
            })
            self.conversion_stats['html_links_found'] += 1
        
        # Find HTML images: <img src="url">
        html_img_pattern = r'<img[^>]+src=["\']([^"\']+)["\'][^>]*(?:alt=["\']([^"\']*)["\'])?[^>]*>'
        img_matches = re.findall(html_img_pattern, content, re.IGNORECASE)
        
        for url, alt_text in img_matches:
            links.append({
                'type': 'html_image',
                'url': url,
                'text': alt_text.strip() if alt_text else '',
                'file': filename
            })
            self.conversion_stats['images_found'] += 1
        
        return links
    
    def extract_markdown_links(self, content: str, filename: str) -> List[Dict[str, Any]]:
        """Extract markdown links from content"""
        links = []
        
        # Find markdown links: [text](url)
        md_link_pattern = r'\[([^\]]*)\]\(([^)]+)\)'
        md_matches = re.findall(md_link_pattern, content)
        
        for text, url in md_matches:
            links.append({
                'type': 'markdown_link',
                'url': url,
                'text': text.strip(),
                'file': filename
            })
            self.conversion_stats['markdown_links_found'] += 1
        
        # Find markdown images: ![alt](url)
        md_img_pattern = r'!\[([^\]]*)\]\(([^)]+)\)'
        img_matches = re.findall(md_img_pattern, content)
        
        for alt_text, url in img_matches:
            links.append({
                'type': 'markdown_image',
                'url': url,
                'text': alt_text.strip(),
                'file': filename
            })
            self.conversion_stats['images_found'] += 1
        
        return links
    
    def categorize_link(self, link: Dict[str, Any]) -> Dict[str, Any]:
        """Categorize a link by domain and type"""
        url = link['url']
        
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            
            # Categorize by domain type
            if 'cjams.net' in domain:
                category = 'internal_wordpress'
                self.conversion_stats['internal_wordpress_links'] += 1
            elif any(d in domain for d in ['youtube.com', 'youtu.be']):
                category = 'youtube'
                self.conversion_stats['external_links'] += 1
            elif 'amazon.com' in domain:
                category = 'amazon'
                self.conversion_stats['external_links'] += 1
            elif any(d in domain for d in ['wikipedia.org', 'wiki']):
                category = 'wikipedia'
                self.conversion_stats['external_links'] += 1
            elif any(d in domain for d in ['doi.org', 'pubmed', 'ncbi.nlm.nih.gov', 'researchgate.net']):
                category = 'research'
                self.conversion_stats['external_links'] += 1
            elif any(d in domain for d in ['twitter.com', 'x.com', 'linkedin.com', 'facebook.com']):
                category = 'social_media'
                self.conversion_stats['external_links'] += 1
            elif domain:
                category = 'external'
                self.conversion_stats['external_links'] += 1
            else:
                category = 'local_or_relative'
        
        except Exception:
            category = 'malformed'
            domain = 'invalid'
        
        self.conversion_stats['total_links'] += 1
        
        return {
            **link,
            'domain': domain,
            'category': category,
            'scheme': parsed.scheme if parsed.scheme else 'none'
        }
    
    def analyze_file_links(self, file_path: Path) -> Dict[str, Any]:
        """Analyze links in a single file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                post_obj = frontmatter.load(f)
            
            content = post_obj.content
            filename = file_path.name
            
            # Extract both HTML and markdown links
            html_links = self.extract_html_links(content, filename)
            markdown_links = self.extract_markdown_links(content, filename)
            
            all_links = html_links + markdown_links
            
            # Categorize all links
            categorized_links = [self.categorize_link(link) for link in all_links]
            
            # Add to global collection
            self.links_extracted.extend(categorized_links)
            
            return {
                'file': filename,
                'title': post_obj.metadata.get('title', 'N/A'),
                'html_links': len(html_links),
                'markdown_links': len(markdown_links),
                'total_links': len(all_links),
                'links': categorized_links
            }
            
        except Exception as e:
            print(f"Error analyzing {file_path}: {e}")
            return {
                'file': file_path.name,
                'title': 'Error',
                'html_links': 0,
                'markdown_links': 0,
                'total_links': 0,
                'links': [],
                'error': str(e)
            }
    
    def analyze_all_content(self) -> Dict[str, Any]:
        """Analyze all migrated content for links"""
        print("Analyzing links in migrated content...")
        
        analysis = {
            'files_analyzed': 0,
            'links_by_category': defaultdict(int),
            'links_by_domain': defaultdict(list),
            'conversion_summary': {},
            'detailed_results': []
        }
        
        # Analyze posts
        posts_dir = Path(self.config.POSTS_DIR)
        if posts_dir.exists():
            print(f"Analyzing posts in {posts_dir}...")
            for post_file in posts_dir.glob("*.md"):
                result = self.analyze_file_links(post_file)
                analysis['detailed_results'].append(result)
                analysis['files_analyzed'] += 1
        
        # Analyze pages
        pages_dir = Path(self.config.PAGES_DIR)
        if pages_dir.exists():
            print(f"Analyzing pages in {pages_dir}...")
            for page_file in pages_dir.glob("*.md"):
                result = self.analyze_file_links(page_file)
                analysis['detailed_results'].append(result)
                analysis['files_analyzed'] += 1
        
        # Group links by category and domain
        for link in self.links_extracted:
            analysis['links_by_category'][link['category']] += 1
            analysis['links_by_domain'][link['domain']].append(link)
        
        analysis['conversion_summary'] = self.conversion_stats
        analysis['total_links_extracted'] = len(self.links_extracted)
        
        return analysis
    
    def generate_report(self, analysis: Dict[str, Any]) -> str:
        """Generate a detailed link analysis report"""
        report = []
        report.append("=" * 70)
        report.append("WORDPRESS LINK ANALYSIS REPORT")
        report.append("=" * 70)
        report.append("")
        
        # Summary
        report.append("LINK CONVERSION SUMMARY")
        report.append("-" * 30)
        stats = analysis['conversion_summary']
        report.append(f"Files analyzed: {analysis['files_analyzed']}")
        report.append(f"Total links found: {stats['total_links']}")
        report.append(f"HTML links: {stats['html_links_found']}")
        report.append(f"Markdown links: {stats['markdown_links_found']}")
        report.append(f"Images: {stats['images_found']}")
        report.append(f"Internal WordPress links: {stats['internal_wordpress_links']}")
        report.append(f"External links: {stats['external_links']}")
        report.append("")
        
        # Links by category
        if analysis['links_by_category']:
            report.append("LINKS BY CATEGORY")
            report.append("-" * 30)
            for category, count in sorted(analysis['links_by_category'].items(), key=lambda x: x[1], reverse=True):
                report.append(f"{category}: {count}")
            report.append("")
        
        # Top domains
        if analysis['links_by_domain']:
            report.append("TOP DOMAINS")
            report.append("-" * 30)
            domain_counts = [(domain, len(links)) for domain, links in analysis['links_by_domain'].items()]
            domain_counts.sort(key=lambda x: x[1], reverse=True)
            
            for domain, count in domain_counts[:10]:  # Top 10 domains
                if domain and domain != 'invalid':
                    report.append(f"{domain}: {count} links")
            report.append("")
        
        # Internal WordPress links that may need updating
        internal_links = [link for link in self.links_extracted if link['category'] == 'internal_wordpress']
        if internal_links:
            report.append("INTERNAL WORDPRESS LINKS (May need updating)")
            report.append("-" * 50)
            for link in internal_links[:10]:  # First 10
                report.append(f"  • {link['text']} → {link['url']}")
                report.append(f"    File: {link['file']}")
            if len(internal_links) > 10:
                report.append(f"  ... and {len(internal_links) - 10} more")
            report.append("")
        
        # Sample external links by category
        categories_to_show = ['youtube', 'amazon', 'research', 'wikipedia']
        for category in categories_to_show:
            cat_links = [link for link in self.links_extracted if link['category'] == category]
            if cat_links:
                report.append(f"{category.upper()} LINKS")
                report.append("-" * (len(category) + 6))
                for link in cat_links[:5]:  # First 5 of each category
                    report.append(f"  • {link['text']} → {link['url']}")
                    report.append(f"    File: {link['file']}")
                if len(cat_links) > 5:
                    report.append(f"  ... and {len(cat_links) - 5} more")
                report.append("")
        
        # Files with most links
        files_with_links = [f for f in analysis['detailed_results'] if f['total_links'] > 0]
        if files_with_links:
            files_with_links.sort(key=lambda x: x['total_links'], reverse=True)
            report.append("FILES WITH MOST LINKS")
            report.append("-" * 30)
            for file_result in files_with_links[:5]:
                report.append(f"{file_result['file']}: {file_result['total_links']} links")
                report.append(f"  Title: {file_result['title']}")
            report.append("")
        
        return "\n".join(report)
    
    def export_links_json(self, filename: str = "extracted_links.json"):
        """Export all extracted links to JSON for further processing"""
        link_data = {
            'extraction_date': str(Path().resolve()),
            'total_links': len(self.links_extracted),
            'links': self.links_extracted,
            'stats': self.conversion_stats
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(link_data, f, indent=2, ensure_ascii=False)
        
        print(f"Links exported to: {filename}")


def main():
    """Main function for CLI usage"""
    import sys
    
    analyzer = LinkAnalyzer()
    
    if len(sys.argv) > 1 and sys.argv[1] == "--export-json":
        # Just export links to JSON
        analysis = analyzer.analyze_all_content()
        analyzer.export_links_json()
        print(f"Extracted {len(analyzer.links_extracted)} links from content")
    else:
        # Full analysis and report
        analysis = analyzer.analyze_all_content()
        
        # Generate and display report
        report = analyzer.generate_report(analysis)
        print(report)
        
        # Save report to file
        with open("link_analysis_report.txt", 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"\n📋 Report saved to: link_analysis_report.txt")
        
        # Also export links to JSON
        analyzer.export_links_json()
        
        print("\n🔗 Key Findings:")
        if analysis['total_links_extracted'] > 0:
            print(f"  • {analysis['total_links_extracted']} links found and preserved")
            print(f"  • Links from {len(analysis['links_by_domain'])} different domains")
            
            # Show top categories
            top_categories = sorted(analysis['links_by_category'].items(), 
                                  key=lambda x: x[1], reverse=True)[:3]
            for category, count in top_categories:
                print(f"  • {category}: {count} links")
        else:
            print("  • No links found (this might indicate an issue)")
        
        print("\n✨ Next steps:")
        print("  • Review link_analysis_report.txt for details")
        print("  • Check extracted_links.json for all link data")
        print("  • Update internal WordPress links in your React components")
        print("  • All external links are preserved and ready to use")


if __name__ == "__main__":
    main()
