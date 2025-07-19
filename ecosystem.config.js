module.exports = {
  apps: [
    {
      name: 'strapi-api',
      script: 'npm',
      args: 'run start',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 1337
      },
      error_file: './logs/strapi-error.log',
      out_file: './logs/strapi-out.log',
      log_file: './logs/strapi-combined.log',
      time: true
    },
    {
      name: 'blockchain-services',
      script: 'start-blockchain-services.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/blockchain-error.log',
      out_file: './logs/blockchain-out.log',
      log_file: './logs/blockchain-combined.log',
      time: true
    }
  ]
}; 