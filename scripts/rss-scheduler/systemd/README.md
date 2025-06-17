# Systemd Timer Setup for RSS Import

This directory contains systemd service and timer files for scheduling RSS imports on Linux systems using systemd.

## Installation

1. Copy the service and timer files to the systemd directory:
   ```bash
   sudo cp blog-rss-import.service /etc/systemd/system/
   sudo cp blog-rss-import.timer /etc/systemd/system/
   ```

2. Create the log directory:
   ```bash
   sudo mkdir -p /var/log/blog-mt-importer
   sudo chown node:node /var/log/blog-mt-importer
   ```

3. Adjust the service file:
   - Update `WorkingDirectory` to your project path
   - Update `User` and `Group` to match your system user
   - Adjust environment variables as needed

4. Reload systemd and enable the timer:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable blog-rss-import.timer
   sudo systemctl start blog-rss-import.timer
   ```

## Usage

Check timer status:
```bash
systemctl status blog-rss-import.timer
```

Check service status:
```bash
systemctl status blog-rss-import.service
```

View logs:
```bash
journalctl -u blog-rss-import.service -f
```

Run manually:
```bash
sudo systemctl start blog-rss-import.service
```

List all timers:
```bash
systemctl list-timers
```

## Customization

Edit the timer schedule in `blog-rss-import.timer`:
- `OnCalendar=hourly` - Run every hour
- `OnCalendar=daily` - Run once per day
- `OnCalendar=*:0/30` - Run every 30 minutes
- `OnCalendar=Mon-Fri 09:00` - Run Monday to Friday at 9 AM