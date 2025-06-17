module.exports = {
  apps: [
    {
      // API Server
      name: 'blog-mt-importer-api',
      script: './dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true,
    },
    {
      // RSS Import Scheduler
      name: 'rss-import-scheduler',
      script: './dist/cli.js',
      args: 'rss:import --all',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 * * * *', // Run every hour
      autorestart: false,
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/rss-import-error.log',
      out_file: './logs/rss-import-out.log',
      log_file: './logs/rss-import-combined.log',
      time: true,
    },
  ],

  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'node',
      host: 'your-server.com',
      ref: 'origin/master',
      repo: 'git@github.com:your-username/blog-mt-importer.git',
      path: '/var/www/blog-mt-importer',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
};