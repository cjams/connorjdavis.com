#!/usr/bin/env python3
"""
Complete WordPress Migration Tool
Runs the full migration process from WordPress to FastAPI/React
"""

import sys
import time
from pathlib import Path

# Import our migration modules
from migrator import WordPressMigrator
from content_validator import ContentValidator
from ..deployment.deploy_helper import DeploymentHelper


def print_banner():
    """Print a nice banner"""
    banner = """
╔══════════════════════════════════════════════════════════════╗
║                WordPress to FastAPI Migration Tool          ║
║                                                              ║
║  Migrate your WordPress content to a modern FastAPI +       ║
║  React stack with full flexibility for creative coding      ║
╚══════════════════════════════════════════════════════════════╝
    """
    print(banner)


def print_step(step_num: int, title: str, description: str = ""):
    """Print a formatted step"""
    print(f"\n{'='*60}")
    print(f"STEP {step_num}: {title}")
    if description:
        print(f"{description}")
    print(f"{'='*60}")


def main():
    """Main migration process"""
    print_banner()
    
    print("🚀 Starting complete WordPress migration process...")
    print("This will migrate your content, validate it, and set up a FastAPI backend.")
    print()
    
    # Confirm before starting
    response = input("Do you want to continue? (y/N): ").strip().lower()
    if response not in ['y', 'yes']:
        print("Migration cancelled.")
        return
    
    start_time = time.time()
    
    try:
        # Step 1: WordPress Content Migration
        print_step(1, "MIGRATING WORDPRESS CONTENT", 
                  "Extracting posts, pages, and media from WordPress REST API")
        
        migrator = WordPressMigrator()
        migrator.run_migration()
        
        if migrator.stats['posts_migrated'] == 0 and migrator.stats['pages_migrated'] == 0:
            print("\n❌ No content was migrated. Please check your WordPress URL and try again.")
            return
        
        print(f"\n✅ Migration completed:")
        print(f"   📝 {migrator.stats['posts_migrated']} posts migrated")
        print(f"   📄 {migrator.stats['pages_migrated']} pages migrated")
        print(f"   🖼️  {migrator.stats['images_downloaded']} images downloaded")
        
        # Step 2: Content Validation
        print_step(2, "VALIDATING MIGRATED CONTENT",
                  "Checking for issues and generating validation report")
        
        validator = ContentValidator()
        validation_results = validator.validate_all_content()
        
        # Generate and save validation report
        report = validator.generate_report(validation_results)
        validator.save_report(validation_results)
        
        summary = validation_results['summary']
        print(f"\n✅ Validation completed:")
        print(f"   📊 {summary['total_files']} files checked")
        print(f"   ✅ {summary['valid_files']} files valid")
        if summary['files_with_issues'] > 0:
            print(f"   ⚠️  {summary['files_with_issues']} files with issues")
            print(f"   📋 Check validation_report.txt for details")
        
        # Step 3: Deployment Setup
        print_step(3, "SETTING UP FASTAPI BACKEND",
                  "Creating deployment structure and API endpoints")
        
        deployer = DeploymentHelper()
        deployer.run_deployment()
        
        print(f"\n✅ Backend setup completed:")
        print(f"   🏗️  FastAPI project structure created")
        print(f"   📝 {deployer.stats['posts_deployed']} posts deployed")
        print(f"   📄 {deployer.stats['pages_deployed']} pages deployed")
        print(f"   🖼️  {deployer.stats['media_files_copied']} media files copied")
        print(f"   🐳 Docker configuration created")
        
        # Final summary
        end_time = time.time()
        duration = end_time - start_time
        
        print_step(4, "MIGRATION COMPLETE! 🎉")
        
        print(f"""
📊 MIGRATION SUMMARY
Duration: {duration:.1f} seconds

Content Migrated:
  • {migrator.stats['posts_migrated']} blog posts
  • {migrator.stats['pages_migrated']} pages  
  • {migrator.stats['images_downloaded']} images

Files Created:
  • Markdown content files with frontmatter
  • FastAPI backend with REST API
  • Docker configuration for deployment
  • Content validation report

🚀 NEXT STEPS:

1. Test your backend:
   ./start_backend.sh
   
2. View API documentation:
   http://localhost:8000/docs
   
3. Create your React frontend:
   cd frontend
   npx create-react-app .
   
4. Use the API endpoints to fetch content:
   GET /posts - List all posts
   GET /posts/{{slug}} - Get specific post
   GET /categories - Get all categories
   GET /tags - Get all tags

5. Deploy when ready:
   docker-compose up --build

📁 Your project structure:
   • migrated_content/ - Raw migrated files
   • backend/ - FastAPI application  
   • frontend/ - React app (create this)
   • validation_report.txt - Issues report

🎨 You now have full React flexibility for creative coding!

Happy coding! 🚀
        """)
        
        # Check for any issues that need attention
        if migrator.stats['errors'] or deployer.stats['errors']:
            print("\n⚠️  ATTENTION REQUIRED:")
            if migrator.stats['errors']:
                print(f"   • {len(migrator.stats['errors'])} migration errors")
            if deployer.stats['errors']:
                print(f"   • {len(deployer.stats['errors'])} deployment errors")
            print("   • Check the console output and validation report for details")
        
        if summary['files_with_issues'] > 0:
            print(f"\n📋 CONTENT ISSUES:")
            print(f"   • {summary['files_with_issues']} files have validation issues")
            print(f"   • Review validation_report.txt for specific problems")
            print(f"   • Most issues are non-critical and won't prevent deployment")
    
    except KeyboardInterrupt:
        print("\n\n❌ Migration interrupted by user")
        print("You can run individual scripts to continue:")
        print("  python wordpress_migrator.py    # Resume content migration")
        print("  python content_validator.py     # Validate content")
        print("  python deploy_helper.py         # Setup backend")
        
    except Exception as e:
        print(f"\n\n❌ Migration failed: {str(e)}")
        print("Try running individual components to debug:")
        print("  python wordpress_migrator.py    # Test content migration")
        print("  python content_validator.py     # Test validation")
        print("  python deploy_helper.py         # Test deployment setup")
        
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
