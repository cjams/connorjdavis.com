#!/bin/bash

# Rsync Deployment Script for connorjdavis.com
# Usage: ./deploy-rsync.sh [OPTIONS] REMOTE_HOST REMOTE_PATH
# Example: ./deploy-rsync.sh -d user@example.com /home/user/connorjdavis.com

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default options
DRY_RUN=false
DELETE_MODE=false
VERBOSE=false
COMPRESS=true
EXCLUDE_FILE=".rsyncexclude"
SSH_PORT=22
PROGRESS=true

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

# Function to show usage
show_usage() {
    cat << EOF
Rsync Deployment Script for connorjdavis.com

Usage: $0 [OPTIONS] REMOTE_HOST REMOTE_PATH

Arguments:
  REMOTE_HOST    Remote server (user@hostname or hostname)
  REMOTE_PATH    Remote directory path

Options:
  -d, --dry-run       Perform a trial run with no changes made
  -D, --delete        Delete extraneous files from destination dirs
  -v, --verbose       Increase verbosity
  -q, --quiet         Suppress non-error messages
  -p, --port PORT     SSH port (default: 22)
  -e, --exclude FILE  Use custom exclude file (default: .rsyncexclude)
  --no-compress       Disable compression
  --no-progress       Disable progress indicator
  -h, --help          Show this help message

Examples:
  # Dry run to see what would be synced
  $0 --dry-run user@myserver.com /var/www/connorjdavis.com

  # Deploy with file deletion (removes files not present locally)
  $0 --delete user@myserver.com /var/www/connorjdavis.com

  # Deploy using custom SSH port
  $0 --port 2222 user@myserver.com /var/www/connorjdavis.com

  # Verbose deployment
  $0 --verbose user@myserver.com /var/www/connorjdavis.com

Safety Features:
  - Dry run capability to preview changes
  - Comprehensive exclude patterns
  - Progress monitoring
  - Error handling and validation
EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -D|--delete)
            DELETE_MODE=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -q|--quiet)
            PROGRESS=false
            VERBOSE=false
            shift
            ;;
        -p|--port)
            SSH_PORT="$2"
            shift 2
            ;;
        -e|--exclude)
            EXCLUDE_FILE="$2"
            shift 2
            ;;
        --no-compress)
            COMPRESS=false
            shift
            ;;
        --no-progress)
            PROGRESS=false
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        -*)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
        *)
            if [ -z "$REMOTE_HOST" ]; then
                REMOTE_HOST="$1"
            elif [ -z "$REMOTE_PATH" ]; then
                REMOTE_PATH="$1"
            else
                print_error "Too many arguments"
                show_usage
                exit 1
            fi
            shift
            ;;
    esac
done

# Validate required arguments
if [ -z "$REMOTE_HOST" ] || [ -z "$REMOTE_PATH" ]; then
    print_error "Missing required arguments: REMOTE_HOST and REMOTE_PATH"
    show_usage
    exit 1
fi

# Get the project root directory (two levels up from this script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

print_status "Project root: $PROJECT_ROOT"
print_status "Remote host: $REMOTE_HOST"
print_status "Remote path: $REMOTE_PATH"

# Change to project root
cd "$PROJECT_ROOT"

# Validate exclude file exists
if [ ! -f "$EXCLUDE_FILE" ]; then
    print_error "Exclude file not found: $EXCLUDE_FILE"
    exit 1
fi

# Build rsync options
RSYNC_OPTS=()

# Basic options
RSYNC_OPTS+=("-a")  # Archive mode (preserves permissions, times, etc.)
RSYNC_OPTS+=("-H")  # Preserve hard links
RSYNC_OPTS+=("-x")  # Don't cross filesystem boundaries

# SSH options
RSYNC_OPTS+=("-e" "ssh -p $SSH_PORT")

# Exclude file
RSYNC_OPTS+=("--exclude-from=$EXCLUDE_FILE")

# Conditional options
if [ "$DRY_RUN" = true ]; then
    RSYNC_OPTS+=("--dry-run")
    print_warning "DRY RUN MODE - No files will be transferred"
fi

if [ "$DELETE_MODE" = true ]; then
    RSYNC_OPTS+=("--delete")
    print_warning "DELETE MODE - Files not present locally will be removed from remote"
fi

if [ "$VERBOSE" = true ]; then
    RSYNC_OPTS+=("-v")
fi

if [ "$COMPRESS" = true ]; then
    RSYNC_OPTS+=("-z")
fi

if [ "$PROGRESS" = true ]; then
    RSYNC_OPTS+=("--progress")
fi

# Show what will be excluded
print_status "Using exclude patterns from: $EXCLUDE_FILE"
if [ "$VERBOSE" = true ]; then
    print_status "Exclude patterns:"
    grep -v '^#' "$EXCLUDE_FILE" | grep -v '^$' | sed 's/^/  - /'
fi

# Test SSH connection
print_status "Testing SSH connection to $REMOTE_HOST..."
if ! ssh -p "$SSH_PORT" -o ConnectTimeout=10 -o BatchMode=yes "$REMOTE_HOST" 'exit' 2>/dev/null; then
    print_error "Cannot connect to $REMOTE_HOST via SSH"
    print_error "Please ensure:"
    print_error "  1. SSH key authentication is set up"
    print_error "  2. The remote host is accessible"
    print_error "  3. The SSH port ($SSH_PORT) is correct"
    exit 1
fi

print_success "SSH connection successful"

# Create remote directory if it doesn't exist
print_status "Ensuring remote directory exists: $REMOTE_PATH"
ssh -p "$SSH_PORT" "$REMOTE_HOST" "mkdir -p '$REMOTE_PATH'"

# Show rsync command that will be executed
print_status "Rsync command:"
echo "rsync ${RSYNC_OPTS[*]} ./ $REMOTE_HOST:$REMOTE_PATH/"

# Confirmation for non-dry-run mode
if [ "$DRY_RUN" = false ]; then
    if [ "$DELETE_MODE" = true ]; then
        print_warning "This will sync files AND delete remote files not present locally!"
    else
        print_status "This will sync files to the remote server."
    fi
    
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled."
        exit 0
    fi
fi

# Execute rsync
print_status "Starting rsync deployment..."
START_TIME=$(date +%s)

if rsync "${RSYNC_OPTS[@]}" ./ "$REMOTE_HOST:$REMOTE_PATH/"; then
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    print_success "Deployment completed successfully in ${DURATION}s"
    
    if [ "$DRY_RUN" = true ]; then
        print_status "This was a dry run. Run without --dry-run to actually deploy."
    else
        print_status "Files have been synchronized to $REMOTE_HOST:$REMOTE_PATH"
        
        # Optionally restart services after deployment
        print_status "Consider restarting services if needed:"
        print_status "  ssh $REMOTE_HOST 'sudo systemctl restart blog-backend'"
    fi
else
    print_error "Deployment failed!"
    exit 1
fi
