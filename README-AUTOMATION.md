# Daily GitHub Activity Automation

A lightweight Node.js script that automatically makes safe, meaningful commits to multiple GitHub repositories daily to maintain consistent activity on your GitHub profile.

## Features

- ✅ Makes safe, non-breaking changes (README updates, code comments, formatting improvements)
- ✅ Works with multiple repositories (local paths or GitHub URLs)
- ✅ Meaningful commit messages
- ✅ Skips repos with uncommitted changes
- ✅ Dry-run mode for testing
- ✅ Comprehensive logging

## Setup

### 1. Install Dependencies

This script uses only Node.js built-in modules, so no additional packages are required. Just ensure you have Node.js installed:

```bash
node --version  # Should be v12 or higher
```

### 2. Configure Repositories

Edit `github-activity-config.json` to add your repositories:

```json
{
  "repositories": [
    {
      "name": "My Project",
      "localPath": "/path/to/local/repo",
      "branch": "main"
    },
    {
      "name": "Another Project",
      "url": "https://github.com/username/repo.git",
      "branch": "main"
    },
    {
      "name": "Remote Repo",
      "url": "git@github.com:username/repo.git",
      "branch": "main"
    }
  ]
}
```

**Options:**
- `localPath`: Absolute or relative path to a local repository
- `url`: GitHub repository URL (will be cloned to `repos/` subdirectory)
- `branch`: Branch to commit to (defaults to "main")
- `name`: Display name for the repository (optional)

### 3. Test the Script

Run in dry-run mode first to see what changes would be made:

```bash
node daily-github-activity.js --dry-run
```

### 4. Run Manually

```bash
node daily-github-activity.js
```

Or use the shell wrapper:

```bash
chmod +x run-daily-activity.sh
./run-daily-activity.sh
```

## Scheduling (Daily Automation)

### macOS (using launchd)

1. Create a plist file at `~/Library/LaunchAgents/com.github.activity.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.github.activity</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/path/to/github-activity-automation/run-daily-activity.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>9</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/path/to/github-activity-automation/launchd.log</string>
    <key>StandardErrorPath</key>
    <string>/path/to/github-activity-automation/launchd.error.log</string>
</dict>
</plist>
```

2. Load the service:

```bash
launchctl load ~/Library/LaunchAgents/com.github.activity.plist
```

3. To unload:

```bash
launchctl unload ~/Library/LaunchAgents/com.github.activity.plist
```

### Linux (using cron)

Add to your crontab (`crontab -e`):

```bash
# Run daily at 9:00 AM
0 9 * * * /path/to/github-activity-automation/run-daily-activity.sh >> /path/to/github-activity-automation/cron.log 2>&1
```

### Windows (using Task Scheduler)

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger to "Daily" at your preferred time
4. Set action to "Start a program"
5. Program: `node.exe`
6. Arguments: `C:\path\to\github-activity-automation\daily-github-activity.js`
7. Start in: `C:\path\to\github-activity-automation`

## Safe Change Types

The script randomly selects from these safe change types:

1. **README Updates**: Adds/updates "Last updated" dates, fixes formatting
2. **Code Comments**: Adds helpful comments to existing code
3. **Package.json**: Cleans up formatting and metadata
4. **Documentation**: Improves formatting in .md and .txt files
5. **Config Files**: Cleans up .gitignore, tsconfig.json, etc.

All changes are designed to be non-breaking and improve code quality.

## GitHub Authentication

The script uses your system's Git credentials. Make sure you have:

1. **SSH keys set up** (for SSH URLs like `git@github.com:...`)
   - Or use HTTPS URLs with credential helper

2. **Personal Access Token** (for HTTPS URLs)
   - Configure: `git config --global credential.helper store`
   - Or use: `git config --global url."https://TOKEN@github.com/".insteadOf "https://github.com/"`

## Troubleshooting

### "Config file not found"
- Ensure `github-activity-config.json` exists in the same directory as the script

### "Failed to clone"
- Check your internet connection
- Verify repository URL is correct
- Ensure you have access to the repository
- Check Git credentials are configured

### "Skipping - has uncommitted changes"
- The script skips repos with uncommitted changes to avoid conflicts
- Commit or stash your changes first

### "Could not generate change"
- Repository might be too small or have no suitable files
- Try adding more file types to the change generators

## Logs

- Activity log: `activity.log` - Records each script execution
- Cron/launchd logs: Check the log files specified in your scheduler configuration

## Security Notes

- The script only makes safe, non-breaking changes
- It skips repos with uncommitted changes
- Always test with `--dry-run` first
- Review commits before they're pushed (though they're designed to be safe)

## Customization

You can modify `daily-github-activity.js` to:
- Add custom change types
- Change commit message formats
- Add repository-specific logic
- Modify the change generation algorithms

## License

Use freely for personal projects. Make sure you have permission to commit to the repositories you're automating.

