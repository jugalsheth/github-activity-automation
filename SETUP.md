# Quick Setup Guide

## Step 1: Add Your Repositories

Edit `github-activity-config.json` and add your repositories:

```json
{
  "repositories": [
    {
      "name": "GitHub Activity Automation",
      "localPath": ".",
      "branch": "main"
    },
    {
      "name": "VideoAsk AI",
      "localPath": "../my-app",
      "branch": "main"
    },
    {
      "name": "Another Project",
      "url": "https://github.com/yourusername/your-repo.git",
      "branch": "main"
    }
  ]
}
```

**Options:**
- `localPath`: Use `"."` for this repo, or relative/absolute paths like `"../my-app"`
- `url`: GitHub URL (will be cloned automatically)
- `branch`: Usually `"main"` or `"master"`

## Step 2: Test It

```bash
# Dry run (see what would happen)
node daily-github-activity.js --dry-run

# Actually run it
node daily-github-activity.js
```

## Step 3: Push to GitHub

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit: GitHub activity automation"

# Add remote (replace with your GitHub repo URL)
git remote add origin https://github.com/yourusername/github-activity-automation.git

# Push
git push -u origin main
```

## Step 4: Activate Daily Automation (macOS)

1. **Update the plist file path** in `com.github.activity.plist` (line 10) if needed

2. **Copy to LaunchAgents:**
   ```bash
   cp com.github.activity.plist ~/Library/LaunchAgents/
   ```

3. **Load the service:**
   ```bash
   launchctl load ~/Library/LaunchAgents/com.github.activity.plist
   ```

4. **Verify it's loaded:**
   ```bash
   launchctl list | grep github.activity
   ```

5. **Test it manually:**
   ```bash
   launchctl start com.github.activity
   ```

6. **Check logs:**
   ```bash
   tail -f launchd.log
   ```

## Step 5: Add More Repositories

Just add entries to the `repositories` array in `github-activity-config.json`. The script will handle them automatically!

## Troubleshooting

- **"Skipping - has uncommitted changes"**: Commit or stash your changes first
- **"Failed to clone"**: Check your internet and Git credentials
- **Not running daily**: Check logs with `tail -f launchd.log`

## Uninstall

```bash
launchctl unload ~/Library/LaunchAgents/com.github.activity.plist
rm ~/Library/LaunchAgents/com.github.activity.plist
```

