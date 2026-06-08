module.exports = {
  apps: [
    {
      name: 'asiaplus',
      script: 'pnpm',
      args: 'start',
      exec_interpreter: 'bash',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: 1339,
        APP_KEYS: 'toBeModified1,toBeModified2',
        API_TOKEN_SALT: 'tobemodified',
        ADMIN_JWT_SECRET: 'tobemodified',
        TRANSFER_TOKEN_SALT: 'tobemodified',
        JWT_SECRET: 'tobemodified',
      },
    },
  ],
};
