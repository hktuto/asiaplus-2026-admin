module.exports = {
  apps: [
    {
      name: 'asiaplus-2026-admin',
      script: "pnpm",
      args: "start",
      env: {
        NODE_ENV: "production",
        HOST: "0.0.0.0",
        PORT: 1339,
        APP_KEYS: "toBeModified1,toBeModified2",
        API_TOKEN_SALT: "tobemodified",
        ADMIN_JWT_SECRET: "tobemodified",
        TRANSFER_TOKEN_SALT: "tobemodified",
        JWT_SECRET: "tobemodified",
      },
    },
  ],
};
