#!/bin/bash

# Deploy Frontend Script
# Deploys the production Vite build to /var/www/connorjdavis.com

set -e  # Exit on any error

# Configuration
FRONTEND_DIR="./frontend"
BUILD_DIR="$FRONTEND_DIR/dist"
DEPLOY_DIR="/var/www/connorjdavis.com"
BACKUP_DIR="/var/backups/connorjdavis.com"
PRODUCTION_API_URL="https://api.connorjdavis.com"

echo "Starting frontend deployment..."

# Check if frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "Error: Frontend directory not found at $FRONTEND_DIR"
    exit 1
fi

# Navigate to frontend directory
cd "$FRONTEND_DIR"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found in frontend directory"
    exit 1
fi

npm install

echo "Building production bundle with API URL: $PRODUCTION_API_URL"
# Set production environment variables and build
VITE_API_URL="$PRODUCTION_API_URL" npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "Error: Build failed - dist directory not found"
    exit 1
fi

# Create backup of existing deployment if it exists
if [ -d "$DEPLOY_DIR" ]; then
    echo "Creating backup of existing deployment..."
    sudo mkdir -p "$BACKUP_DIR"
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    sudo cp -r "$DEPLOY_DIR" "$BACKUP_DIR/backup_$TIMESTAMP"
    echo "Backup created at $BACKUP_DIR/backup_$TIMESTAMP"
fi

# Create deployment directory if it doesn't exist
echo "Preparing deployment directory..."
sudo mkdir -p "$DEPLOY_DIR"

# Clear existing deployment
sudo rm -rf "$DEPLOY_DIR"/*

# Copy build files to deployment directory
echo "Deploying build files to $DEPLOY_DIR..."
sudo cp -r dist/* "$DEPLOY_DIR/"

# Set appropriate permissions
echo "Setting file permissions..."
sudo chown -R www-data:www-data "$DEPLOY_DIR"
sudo find "$DEPLOY_DIR" -type d -exec chmod 755 {} \;
sudo find "$DEPLOY_DIR" -type f -exec chmod 644 {} \;

# Verify deployment
echo "Verifying deployment..."
if [ -f "$DEPLOY_DIR/index.html" ]; then
    echo "Success: index.html found in deployment directory"
else
    echo "Warning: index.html not found in deployment directory"
fi

# Display deployment info
TOTAL_FILES=$(find "$DEPLOY_DIR" -type f | wc -l)
DEPLOY_SIZE=$(du -sh "$DEPLOY_DIR" | cut -f1)

echo ""
echo "Deployment completed successfully!"
echo "Location: $DEPLOY_DIR"
echo "Files deployed: $TOTAL_FILES"
echo "Total size: $DEPLOY_SIZE"
echo "API URL configured: $PRODUCTION_API_URL"
echo ""
echo "The frontend is now live and configured to use the production backend."
