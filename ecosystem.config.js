module.exports = {
  apps: [
    {
      name: 'Taco Authentication',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
