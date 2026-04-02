module.exports = {
  apps: [
    {
      name: "comunitaria-app",
      script: ".next/standalone/server.js",
      instances: "max", // Usa todos los núcleos disponibles
      exec_mode: "cluster", // Modo cluster (mejor rendimiento)
      autorestart: true,
      watch: false,
      max_memory_restart: "800M", // Reinicia si usa mucha memoria
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      // Opcional: logs más limpios
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      combine_logs: true,
      error_file: "/dev/stderr",
      out_file: "/dev/stdout",
    },
  ],
};
