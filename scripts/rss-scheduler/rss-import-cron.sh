#!/bin/bash

# RSS Import Cron Script
# This script is designed to be run by cron for periodic RSS imports

# Set working directory to project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/../.."
cd "$PROJECT_ROOT"

# Load environment variables if .env file exists
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Set Node.js path if needed (adjust based on your system)
export PATH="/usr/local/bin:$PATH"

# Log file
LOG_FILE="logs/rss-import-$(date +%Y%m%d).log"
mkdir -p logs

# Function to log messages
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Start import
log "Starting RSS import..."

# Run the import command
npm run cli -- rss:import --all 2>&1 | tee -a "$LOG_FILE"

# Check exit status
if [ ${PIPESTATUS[0]} -eq 0 ]; then
  log "RSS import completed successfully"
else
  log "RSS import failed with exit code ${PIPESTATUS[0]}"
  
  # Optionally send notification on failure
  # You can add email, Slack, or other notification methods here
fi

log "RSS import script finished"
echo "" >> "$LOG_FILE"