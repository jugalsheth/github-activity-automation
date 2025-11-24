# GitHub Activity Automation

Automated daily commits to multiple GitHub repositories to maintain consistent activity on your GitHub profile.

## Quick Start

1. **Configure repositories** in `github-activity-config.json`
2. **Test it**: `node daily-github-activity.js --dry-run`
3. **Run it**: `node daily-github-activity.js`
4. **Schedule it**: See `README-AUTOMATION.md` for cron/launchd setup

## What It Does

Makes safe, meaningful commits daily:
- README updates (dates, formatting)
- Code comments (improvements)
- Package.json cleanup
- Documentation improvements
- Config file formatting

All changes are non-breaking and improve code quality.

## Configuration

Edit `github-activity-config.json` to add your repositories:

```json
{
  "repositories": [
    {
      "name": "My Project",
      "localPath": "/path/to/repo",
      "branch": "main"
    },
    {
      "name": "Remote Repo",
      "url": "https://github.com/username/repo.git",
      "branch": "main"
    }
  ]
}
```

See `README-AUTOMATION.md` for detailed setup instructions.

