#!/bin/bash

# Blog Backend Service Installation Script
# Usage: ./install-service.sh /path/to/backend/directory

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    print_error "This script should not be run as root. Run as a regular user with sudo privileges."
    exit 1
fi

# Check for required argument
if [[ $# -ne 1 ]]; then
    print_error "Usage: $0 /path/to/backend/directory"
    print_error "Example: $0 /home/ubuntu/connorjdavis.com/backend"
    exit 1
fi

BACKEND_PATH="$1"
SERVICE_NAME="blog-backend"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
TEMPLATE_FILE="$(dirname "$0")/blog-backend.service.template"

print_status "Starting Blog Backend Service Installation..."

# Validate backend path
print_status "Validating backend directory: $BACKEND_PATH"

if [[ ! -d "$BACKEND_PATH" ]]; then
    print_error "Directory does not exist: $BACKEND_PATH"
    exit 1
fi

# Convert to absolute path
BACKEND_PATH=$(realpath "$BACKEND_PATH")
print_status "Using absolute path: $BACKEND_PATH"

# Check for required files
REQUIRED_FILES=("main.py" "pyproject.toml")
for file in "${REQUIRED_FILES[@]}"; do
    if [[ ! -f "$BACKEND_PATH/$file" ]]; then
        print_error "Required file not found: $BACKEND_PATH/$file"
        print_error "Make sure you're pointing to a valid FastAPI backend directory."
        exit 1
    fi
done

print_success "Backend directory validation passed"

# Check if template file exists
if [[ ! -f "$TEMPLATE_FILE" ]]; then
    print_error "Template file not found: $TEMPLATE_FILE"
    print_error "Make sure this script is run from the scripts/deployment directory or the template is present."
    exit 1
fi

# Check if ubuntu user exists
if ! id "ubuntu" &>/dev/null; then
    print_warning "User 'ubuntu' does not exist on this system."
    read -p "Do you want to create the ubuntu user? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo useradd -m -s /bin/bash ubuntu
        sudo usermod -aG sudo ubuntu
        print_success "Created user 'ubuntu'"
    else
        print_error "The service is configured to run as user 'ubuntu'. Please create this user or modify the service template."
        exit 1
    fi
fi

# Check if uv is installed for ubuntu user
print_status "Checking if uv is installed for ubuntu user..."
if ! sudo -u ubuntu bash -c 'command -v uv' &>/dev/null; then
    print_warning "uv is not installed for the ubuntu user."
    print_status "Installing uv for ubuntu user..."
    sudo -u ubuntu bash -c 'curl -LsSf https://astral.sh/uv/install.sh | sh'
    print_success "uv installed for ubuntu user"
else
    print_success "uv is already installed for ubuntu user"
fi

# Stop existing service if running
if systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null; then
    print_status "Stopping existing service..."
    sudo systemctl stop "$SERVICE_NAME"
fi

# Create service file from template
print_status "Creating systemd service file..."
sed "s|BACKEND_PATH_PLACEHOLDER|$BACKEND_PATH|g" "$TEMPLATE_FILE" | sudo tee "$SERVICE_FILE" > /dev/null

# Set proper permissions
sudo chmod 644 "$SERVICE_FILE"

print_success "Service file created: $SERVICE_FILE"

# Change ownership of backend directory to ubuntu user
print_status "Setting ownership of backend directory to ubuntu:ubuntu..."
sudo chown -R ubuntu:ubuntu "$BACKEND_PATH"

# Install dependencies using uv
print_status "Installing Python dependencies..."
cd "$BACKEND_PATH"
sudo -u ubuntu bash -c 'source ~/.bashrc && uv sync' || sudo -u ubuntu /home/ubuntu/.local/bin/uv sync
print_success "Dependencies installed"

# Reload systemd and enable service
print_status "Reloading systemd daemon..."
sudo systemctl daemon-reload

print_status "Enabling service to start on boot..."
sudo systemctl enable "$SERVICE_NAME"

# Start the service
print_status "Starting the service..."
sudo systemctl start "$SERVICE_NAME"

# Wait a moment for service to start
sleep 2

# Check service status
print_status "Checking service status..."
if systemctl is-active --quiet "$SERVICE_NAME"; then
    print_success "Service is running successfully!"
else
    print_error "Service failed to start. Check the logs with:"
    print_error "  sudo journalctl -u $SERVICE_NAME -f"
    exit 1
fi

# Show service status
print_status "Service Status:"
sudo systemctl status "$SERVICE_NAME" --no-pager -l

print_success "Installation completed successfully!"
print_status ""
print_status "Service Management Commands:"
print_status "  Start:   sudo systemctl start $SERVICE_NAME"
print_status "  Stop:    sudo systemctl stop $SERVICE_NAME"
print_status "  Restart: sudo systemctl restart $SERVICE_NAME"
print_status "  Status:  sudo systemctl status $SERVICE_NAME"
print_status "  Logs:    sudo journalctl -u $SERVICE_NAME -f"
print_status ""
print_status "The service should now be accessible at http://localhost:8000"
