#!/usr/bin/env python3
"""
API Testing Tool
Tests the FastAPI backend endpoints to ensure migration was successful
"""

import requests
import json
from typing import Dict, Any
import time
import sys


class APITester:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.timeout = 10
        
        self.tests_passed = 0
        self.tests_failed = 0
        self.errors = []
    
    def test_endpoint(self, endpoint: str, description: str) -> bool:
        """Test a single endpoint"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            print(f"Testing: {description} ({endpoint})")
            response = self.session.get(url)
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"  ✅ Success - Status: {response.status_code}")
                    
                    # Print some sample data
                    if isinstance(data, list) and len(data) > 0:
                        print(f"  📊 Found {len(data)} items")
                        if len(data) > 0:
                            first_item = data[0]
                            if isinstance(first_item, dict) and 'title' in first_item:
                                print(f"  📝 Sample: '{first_item.get('title', 'N/A')}'")
                    elif isinstance(data, dict):
                        if 'message' in data:
                            print(f"  💬 Message: {data['message']}")
                        elif 'total_posts' in data:
                            print(f"  📊 Stats: {data.get('total_posts', 0)} posts, {data.get('total_pages', 0)} pages")
                        else:
                            print(f"  📄 Data keys: {list(data.keys())[:5]}")
                    
                    self.tests_passed += 1
                    return True
                    
                except json.JSONDecodeError:
                    print(f"  ❌ Invalid JSON response")
                    self.tests_failed += 1
                    return False
                    
            else:
                print(f"  ❌ Failed - Status: {response.status_code}")
                if response.text:
                    print(f"  📝 Error: {response.text[:100]}...")
                self.tests_failed += 1
                return False
                
        except requests.exceptions.ConnectionError:
            print(f"  ❌ Connection failed - Is the server running?")
            self.tests_failed += 1
            return False
            
        except requests.exceptions.Timeout:
            print(f"  ❌ Request timeout")
            self.tests_failed += 1
            return False
            
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")
            self.tests_failed += 1
            return False
    
    def test_post_content(self, slug: str) -> bool:
        """Test fetching a specific post"""
        endpoint = f"/posts/{slug}"
        url = f"{self.base_url}{endpoint}"
        
        try:
            print(f"Testing: Individual post content ({endpoint})")
            response = self.session.get(url)
            
            if response.status_code == 200:
                data = response.json()
                print(f"  ✅ Success - Post loaded")
                print(f"  📝 Title: {data.get('title', 'N/A')}")
                print(f"  📅 Date: {data.get('date', 'N/A')}")
                print(f"  📖 Content length: {len(data.get('content', ''))} chars")
                
                if data.get('categories'):
                    print(f"  🏷️  Categories: {', '.join(data['categories'])}")
                
                self.tests_passed += 1
                return True
                
            elif response.status_code == 404:
                print(f"  ⚠️  Post not found (404) - This is normal if no posts exist")
                return True
                
            else:
                print(f"  ❌ Failed - Status: {response.status_code}")
                self.tests_failed += 1
                return False
                
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")
            self.tests_failed += 1
            return False
    
    def run_basic_tests(self):
        """Run basic API endpoint tests"""
        print("🧪 Testing FastAPI Backend")
        print("=" * 50)
        
        # Test basic endpoints
        tests = [
            ("/", "Root endpoint"),
            ("/posts", "Posts list"),
            ("/categories", "Categories list"),
            ("/tags", "Tags list"),
            ("/stats", "Statistics"),
        ]
        
        for endpoint, description in tests:
            self.test_endpoint(endpoint, description)
            print()  # Add spacing
        
        # Test a specific post if posts exist
        try:
            posts_response = self.session.get(f"{self.base_url}/posts")
            if posts_response.status_code == 200:
                posts_data = posts_response.json()
                if isinstance(posts_data, list) and len(posts_data) > 0:
                    first_post = posts_data[0]
                    if 'slug' in first_post:
                        self.test_post_content(first_post['slug'])
                        print()
        except:
            pass  # Skip if posts endpoint fails
    
    def run_comprehensive_tests(self):
        """Run comprehensive tests including edge cases"""
        print("🔬 Running Comprehensive Tests")
        print("=" * 50)
        
        self.run_basic_tests()
        
        # Test filtering
        print("Testing: Post filtering")
        self.test_endpoint("/posts?limit=5", "Posts with limit")
        print()
        
        # Test 404 endpoints
        print("Testing: Error handling")
        self.test_endpoint("/posts/non-existent-slug", "Non-existent post (should be 404)")
        print()
        
        # Test API documentation
        print("Testing: API documentation")
        try:
            docs_response = self.session.get(f"{self.base_url}/docs")
            if docs_response.status_code == 200:
                print("  ✅ API documentation accessible at /docs")
            else:
                print(f"  ⚠️  API docs returned status {docs_response.status_code}")
        except:
            print("  ❌ Could not access API documentation")
        
        print()
    
    def print_summary(self):
        """Print test summary"""
        total_tests = self.tests_passed + self.tests_failed
        
        print("=" * 50)
        print("🧪 TEST SUMMARY")
        print("=" * 50)
        print(f"Total tests run: {total_tests}")
        print(f"✅ Passed: {self.tests_passed}")
        print(f"❌ Failed: {self.tests_failed}")
        
        if self.tests_failed == 0:
            print("\n🎉 All tests passed! Your API is working correctly.")
            print("\n🚀 You can now:")
            print("   • Visit http://localhost:8000/docs for API documentation")
            print("   • Start building your React frontend")
            print("   • Use the API endpoints in your React app")
        else:
            print(f"\n⚠️  {self.tests_failed} tests failed.")
            print("   • Check that the FastAPI server is running")
            print("   • Verify that content was migrated successfully")
            print("   • Review the error messages above")
    
    def check_server_status(self) -> bool:
        """Check if the server is running"""
        try:
            response = self.session.get(f"{self.base_url}/", timeout=5)
            return response.status_code == 200
        except:
            return False


def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Test the FastAPI backend")
    parser.add_argument("--url", default="http://localhost:8000", 
                      help="Base URL of the API (default: http://localhost:8000)")
    parser.add_argument("--comprehensive", "-c", action="store_true",
                      help="Run comprehensive tests including edge cases")
    
    args = parser.parse_args()
    
    tester = APITester(args.url)
    
    print(f"🔍 Testing API at: {args.url}")
    
    # Check if server is running
    if not tester.check_server_status():
        print(f"❌ Server not responding at {args.url}")
        print("\n💡 Make sure the FastAPI server is running:")
        print("   ./start_backend.sh")
        print("   or")
        print("   cd backend && uvicorn main:app --reload")
        return 1
    
    print("✅ Server is responding\n")
    
    # Run tests
    if args.comprehensive:
        tester.run_comprehensive_tests()
    else:
        tester.run_basic_tests()
    
    tester.print_summary()
    
    return 0 if tester.tests_failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
