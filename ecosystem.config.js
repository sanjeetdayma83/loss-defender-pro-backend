module.exports = {
  apps: [
    {
      name: "lossdefender-api",

      cwd: "/root/loss-defender-pro-backend/apps/api",

      script: "dist/src/main.js",

      instances: 1,
      exec_mode: "fork",

      autorestart: true,
      watch: false,

      max_memory_restart: "768M",
      restart_delay: 5000,
      kill_timeout: 10000,

      node_args: "--enable-source-maps",

      env: {
        NODE_ENV: "production",
        PORT: 4000
      },

      merge_logs: true,
      time: true,

      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
}
