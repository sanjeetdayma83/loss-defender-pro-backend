export default () => ({
  app: {
    name: process.env.APP_NAME,
    env: process.env.NODE_ENV,
    port: Number(process.env.PORT),
    apiPrefix: process.env.API_PREFIX,
    logLevel: process.env.LOG_LEVEL,
  },
});
