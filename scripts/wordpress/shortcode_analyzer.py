#!/usr/bin/env python3
"""
WordPress Shortcode Analyzer
Analyzes preserved shortcodes in migrated content and extracts URLs
"""

import re
import json
from pathlib import Path
from typing import Dict, List, Any, Set
import frontmatter
from collections import defaultdict

from config import Config


class ShortcodeAnalyzer:
    def __init__(self):
        self.config = Config()
        self.shortcodes_found = defaultdict(list)
        self.urls_extracted = []
        self.conversion_stats = {
            'converted_to_html': 0,
            'preserved_with_urls': 0,
            'preserved_without_urls': 0,
            'total_shortcodes': 0
        }
    
    def extract_shortcodes_from_content(self, content: str, filename: str) -> Dict[str, Any]:
        """Extract all shortcode information from content"""
        results = {
            'converted_embeds': [],
            'preserved_shortcodes': [],
            'html_conversions': []
        }
        
        # Find converted YouTube/Vimeo embeds
        iframe_pattern = r'<iframe[^>]*src=["\']([^"\']*(?:youtube|vimeo)[^"\']*)["\'][^>]*></iframe>'
        iframes = re.findall(iframe_pattern, content)
        for iframe_url in iframes:
            results['converted_embeds'].append({
                'type': 'video_embed',
                'url': iframe_url,
                'file': filename
            })
            self.conversion_stats['converted_to_html'] += 1
        
        # Find preserved shortcodes in comments
        preserved_pattern = r'<!-- WordPress Shortcode \[([^\]]+)\]: ([^|]+) \| Original: \[([^\]]+)\] -->'
        preserved_matches = re.findall(preserved_pattern, content)
        
        for shortcode_name, url_info, original in preserved_matches:
            # Parse URL info
            urls = {}
            for url_attr in ['url', 'src', 'href', 'link']:
                url_match = re.search(f'{url_attr}="([^"]*)"', url_info)
                if url_match:
                    urls[url_attr] = url_match.group(1)
            
            shortcode_data = {
                'name': shortcode_name,
                'urls': urls,
                'original': original,
                'file': filename
            }
            
            results['preserved_shortcodes'].append(shortcode_data)
            
            if urls:
                self.conversion_stats['preserved_with_urls'] += 1
                for url_type, url in urls.items():
                    self.urls_extracted.append({
                        'url': url,
                        'type': url_type,
                        'shortcode': shortcode_name,
                        'file': filename
                    })
            else:
                self.conversion_stats['preserved_without_urls'] += 1
        
        # Find HTML conversions (videos, audio, galleries)
        video_pattern = r'<video[^>]*>'
        audio_pattern = r'<audio[^>]*>'
        gallery_pattern = r'<div class="wp-gallery[^>]*>'
        
        videos = len(re.findall(video_pattern, content))
        audios = len(re.findall(audio_pattern, content))
        galleries = len(re.findall(gallery_pattern, content))
        
        if videos > 0:
            results['html_conversions'].append({'type': 'video', 'count': videos})
            self.conversion_stats['converted_to_html'] += videos
        
        if audios > 0:
            results['html_conversions'].append({'type': 'audio', 'count': audios})
            self.conversion_stats['converted_to_html'] += audios
            
        if galleries > 0:
            results['html_conversions'].append({'type': 'gallery', 'count': galleries})
            self.conversion_stats['converted_to_html'] += galleries
        
        return results
    
    def analyze_all_content(self) -> Dict[str, Any]:
        """Analyze all migrated content for shortcodes"""
        print("Analyzing WordPress shortcodes in migrated content...")
        
        analysis = {
            'files_analyzed': 0,
            'shortcodes_by_type': defaultdict(int),
            'urls_by_domain': defaultdict(list),
            'conversion_summary': {},
            'detailed_results': []
        }
        
        # Analyze posts
        posts_dir = Path(self.config.POSTS_DIR)
        if posts_dir.exists():
            print(f"Analyzing posts in {posts_dir}...")
            for post_file in posts_dir.glob("*.md"):
                self._analyze_file(post_file, analysis)
        
        # Analyze pages
        pages_dir = Path(self.config.PAGES_DIR)
        if pages_dir.exists():
            print(f"Analyzing pages in {pages_dir}...")
            for page_file in pages_dir.glob("*.md"):
                self._analyze_file(page_file, analysis)
        
        # Process extracted URLs by domain
        for url_data in self.urls_extracted:
            url = url_data['url']
            try:
                from urllib.parse import urlparse
                domain = urlparse(url).netloc
                if domain:
                    analysis['urls_by_domain'][domain].append(url_data)
            except:
                analysis['urls_by_domain']['invalid'].append(url_data)
        
        analysis['conversion_summary'] = self.conversion_stats
        analysis['total_urls_extracted'] = len(self.urls_extracted)
        
        return analysis
    
    def _analyze_file(self, file_path: Path, analysis: Dict[str, Any]):
        """Analyze a single file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                post_obj = frontmatter.load(f)
            
            file_results = self.extract_shortcodes_from_content(post_obj.content, file_path.name)
            
            # Count shortcodes by type
            for shortcode in file_results['preserved_shortcodes']:
                analysis['shortcodes_by_type'][shortcode['name']] += 1
                self.conversion_stats['total_shortcodes'] += 1
            
            if file_results['preserved_shortcodes'] or file_results['converted_embeds'] or file_results['html_conversions']:
                analysis['detailed_results'].append({
                    'file': file_path.name,
                    'title': post_obj.metadata.get('title', 'N/A'),
                    'results': file_results
                })
            
            analysis['files_analyzed'] += 1
            
        except Exception as e:
            print(f"Error analyzing {file_path}: {e}")
    
    def generate_report(self, analysis: Dict[str, Any]) -> str:
        """Generate a detailed shortcode analysis report"""
        report = []
        report.append("=" * 70)
        report.append("WORDPRESS SHORTCODE ANALYSIS REPORT")
        report.append("=" * 70)
        report.append("")
        
        # Summary
        report.append("CONVERSION SUMMARY")
        report.append("-" * 30)
        stats = analysis['conversion_summary']
        report.append(f"Files analyzed: {analysis['files_analyzed']}")
        report.append(f"Total shortcodes processed: {stats['total_shortcodes']}")
        report.append(f"Converted to HTML: {stats['converted_to_html']}")
        report.append(f"Preserved with URLs: {stats['preserved_with_urls']}")
        report.append(f"Preserved without URLs: {stats['preserved_without_urls']}")
        report.append(f"Total URLs extracted: {analysis['total_urls_extracted']}")
        report.append("")
        
        # Shortcodes by type
        if analysis['shortcodes_by_type']:
            report.append("SHORTCODES BY TYPE")
            report.append("-" * 30)
            for shortcode_type, count in sorted(analysis['shortcodes_by_type'].items()):
                report.append(f"{shortcode_type}: {count}")
            report.append("")
        
        # URLs by domain
        if analysis['urls_by_domain']:
            report.append("EXTRACTED URLS BY DOMAIN")
            report.append("-" * 30)
            for domain, url_list in analysis['urls_by_domain'].items():
                report.append(f"\n{domain} ({len(url_list)} URLs):")
                for url_data in url_list[:5]:  # Show first 5 URLs per domain
                    report.append(f"  • {url_data['url']} (from {url_data['shortcode']} in {url_data['file']})")
                if len(url_list) > 5:
                    report.append(f"  ... and {len(url_list) - 5} more")
            report.append("")
        
        # Detailed results
        if analysis['detailed_results']:
            report.append("DETAILED FILE ANALYSIS")
            report.append("-" * 30)
            
            for file_result in analysis['detailed_results']:
                report.append(f"\n📄 {file_result['file']} - {file_result['title']}")
                results = file_result['results']
                
                if results['converted_embeds']:
                    report.append("  ✅ Converted Embeds:")
                    for embed in results['converted_embeds']:
                        report.append(f"    • {embed['type']}: {embed['url']}")
                
                if results['html_conversions']:
                    report.append("  ✅ HTML Conversions:")
                    for conversion in results['html_conversions']:
                        report.append(f"    • {conversion['count']} {conversion['type']} element(s)")
                
                if results['preserved_shortcodes']:
                    report.append("  📋 Preserved Shortcodes:")
                    for shortcode in results['preserved_shortcodes']:
                        report.append(f"    • [{shortcode['name']}]")
                        for url_type, url in shortcode['urls'].items():
                            report.append(f"      - {url_type}: {url}")
        
        return "\n".join(report)
    
    def export_urls_json(self, filename: str = "extracted_urls.json"):
        """Export all extracted URLs to JSON for further processing"""
        url_data = {
            'extraction_date': str(Path().resolve()),
            'total_urls': len(self.urls_extracted),
            'urls': self.urls_extracted,
            'stats': self.conversion_stats
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(url_data, f, indent=2, ensure_ascii=False)
        
        print(f"URLs exported to: {filename}")


def main():
    """Main function for CLI usage"""
    import sys
    
    analyzer = ShortcodeAnalyzer()
    
    if len(sys.argv) > 1 and sys.argv[1] == "--export-json":
        # Just export URLs to JSON
        analysis = analyzer.analyze_all_content()
        analyzer.export_urls_json()
        print(f"Extracted {len(analyzer.urls_extracted)} URLs from shortcodes")
    else:
        # Full analysis and report
        analysis = analyzer.analyze_all_content()
        
        # Generate and display report
        report = analyzer.generate_report(analysis)
        print(report)
        
        # Save report to file
        with open("shortcode_analysis_report.txt", 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"\n📋 Report saved to: shortcode_analysis_report.txt")
        
        # Also export URLs to JSON
        analyzer.export_urls_json()
        
        print("\n🔗 Key Findings:")
        if analysis['total_urls_extracted'] > 0:
            print(f"  • {analysis['total_urls_extracted']} URLs preserved from shortcodes")
            print(f"  • URLs from {len(analysis['urls_by_domain'])} different domains")
            
            # Show top domains
            top_domains = sorted(analysis['urls_by_domain'].items(), 
                               key=lambda x: len(x[1]), reverse=True)[:3]
            for domain, urls in top_domains:
                print(f"  • {domain}: {len(urls)} URLs")
        else:
            print("  • No URLs found in shortcodes (this might be normal)")
        
        print("\n✨ Next steps:")
        print("  • Review shortcode_analysis_report.txt for details")
        print("  • Check extracted_urls.json for all preserved URLs")
        print("  • Update React components to handle converted HTML elements")
        print("  • Consider creating custom React components for preserved shortcodes")


if __name__ == "__main__":
    main()
