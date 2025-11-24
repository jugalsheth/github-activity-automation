#!/bin/bash

# Daily GitHub Activity Automation Runner
# This script should be called by cron or scheduled task

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    exit 1
fi

# Run the script
node daily-github-activity.js "$@"

# Log the execution
LOG_FILE="$SCRIPT_DIR/activity.log"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Daily activity script executed" >> "$LOG_FILE"

