# RSS Auto-Import Setup Guide

This guide covers how to set up automatic RSS feed importing for your blog MT importer.

## Overview

The RSS import system provides:
- Automatic feed parsing and content extraction
- Duplicate detection to prevent re-importing
- Flexible field mapping for different RSS formats
- Multiple scheduling options (cron, PM2, Docker, systemd, GitHub Actions)
- Built-in error handling and logging
- AI-powered summary generation integration

## Quick Start

1. **Add an RSS feed:**
   ```bash
   npm run cli -- rss:add --name "Tech Blog" --url "https://example.com/feed.xml" --category "Technology"
   ```

2. **List all feeds:**
   ```bash
   npm run cli -- rss:list
   ```

3. **Import manually:**
   ```bash
   npm run cli -- rss:import --all
   ```

## CLI Commands

### Feed Management
- `rss:add` - Add a new RSS feed
- `rss:list` - List all configured feeds
- `rss:update <id>` - Update feed settings
- `rss:delete <id>` - Remove a feed
- `rss:import [feedId]` - Import from specific feed or all feeds

### Examples
```bash
# Add a feed with custom mapping
npm run cli -- rss:add --name "News Site" --url "https://news.example.com/rss" --category "News"

# Update feed settings
npm run cli -- rss:update 1 --name "Updated Name" --enable

# Import from specific feed
npm run cli -- rss:import 1

# Import from all enabled feeds
npm run cli -- rss:import --all
```

## Scheduling Options

### 1. Traditional Cron (Linux/macOS)

**Pros:** Simple, reliable, built into most Unix systems
**Cons:** Basic logging, no process monitoring

Setup:
```bash
# Make script executable
chmod +x scripts/rss-scheduler/rss-import-cron.sh

# Add to crontab
crontab -e
# Add line:
0 * * * * /path/to/blog-mt-importer/scripts/rss-scheduler/rss-import-cron.sh
```

### 2. PM2 Process Manager (Recommended)

**Pros:** Process monitoring, restart on failure, detailed logging, web dashboard
**Cons:** Requires PM2 installation

Setup:
```bash
# Install PM2 globally
npm install -g pm2

# Start with ecosystem file
pm2 start ecosystem.config.js

# Monitor processes
pm2 monit

# Save configuration
pm2 save
pm2 startup
```

### 3. Docker Compose

**Pros:** Isolated environment, easy deployment, includes database
**Cons:** Resource overhead, container complexity

Setup:
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f rss-scheduler

# Scale services
docker-compose up -d --scale rss-scheduler=2
```

### 4. Systemd Timer (Linux)

**Pros:** Native Linux integration, reliable, system-level logging
**Cons:** Linux-only, requires root access

Setup:
```bash
# Copy service files
sudo cp scripts/rss-scheduler/systemd/*.service /etc/systemd/system/
sudo cp scripts/rss-scheduler/systemd/*.timer /etc/systemd/system/

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable blog-rss-import.timer
sudo systemctl start blog-rss-import.timer
```

### 5. GitHub Actions (Cloud)

**Pros:** No server maintenance, free for public repos, integrated CI/CD
**Cons:** Limited to cloud hosting, requires GitHub

Setup:
1. Add secrets to your GitHub repository:
   - `GEMINI_API_KEY` (for AI summaries)
   - `SLACK_WEBHOOK` (optional notifications)
2. Push the workflow file (already included)
3. The workflow runs automatically every hour

## Advanced Configuration

### Custom Field Mapping

For RSS feeds with non-standard fields:

```bash
npm run cli -- rss:add \
  --name "Custom Feed" \
  --url "https://example.com/custom-feed.xml" \
  --category "Custom"

# Then update with custom mapping via database:
# UPDATE rss_feeds SET mapping = '{"title": "custom:title", "body": "custom:content"}' WHERE id = 1;
```

### RSS Feed Configuration File

Create `config/rss-feeds.json` based on the example to bulk-configure feeds:

```json
{
  "feeds": [
    {
      "name": "Tech Blog",
      "url": "https://example.com/feed.xml",
      "category": "Technology",
      "enabled": true
    }
  ]
}
```

### Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=blog_mt_importer

# AI Integration
GEMINI_API_KEY=your_api_key_here

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

## Monitoring and Troubleshooting

### Check Logs
```bash
# Application logs
tail -f logs/*.log

# System logs (systemd)
journalctl -u blog-rss-import.service -f

# PM2 logs
pm2 logs rss-import-scheduler
```

### Common Issues

1. **Database Connection Errors**
   - Verify database is running
   - Check connection credentials
   - Ensure migrations are applied

2. **RSS Parsing Errors**
   - Verify feed URL is accessible
   - Check for malformed XML
   - Review custom field mappings

3. **Scheduling Not Working**
   - Verify cron syntax
   - Check system timezone
   - Ensure scripts are executable

### Performance Optimization

1. **Batch Processing**
   - Adjust batch sizes in configuration
   - Use delays between API calls
   - Monitor database performance

2. **Memory Usage**
   - Limit concurrent feed processing
   - Clear old import logs periodically
   - Use streaming for large feeds

## Integration with AI Summaries

The RSS import automatically integrates with the AI summary system:

```bash
# Import with immediate AI processing
npm run cli -- rss:import --all
npm run cli -- generate-summaries --only-unprocessed --delay 5000
```

## Backup and Recovery

### Database Backup
```bash
pg_dump blog_mt_importer > backup.sql
```

### Export Configuration
```bash
npm run cli -- rss:list > feeds-backup.txt
```

## Security Considerations

1. **Network Security**
   - Use HTTPS feeds when possible
   - Validate feed URLs
   - Monitor for malicious content

2. **Database Security**
   - Use strong passwords
   - Limit database access
   - Regular security updates

3. **API Keys**
   - Store in environment variables
   - Use secrets management
   - Rotate keys regularly

## Performance Monitoring

Track these metrics:
- Import success/failure rates
- Processing time per feed
- Database growth
- Memory/CPU usage
- Network bandwidth

Use tools like:
- PM2 web dashboard
- Database monitoring tools
- Application performance monitoring (APM)
- Log analysis tools