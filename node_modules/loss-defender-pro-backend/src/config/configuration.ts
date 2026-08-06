export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTtl: process.env.JWT_ACCESS_TTL || '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL || '7d',
  },
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    failedLoginThreshold: parseInt(process.env.FAILED_LOGIN_THRESHOLD || '5', 10),
    accountLockMinutes: parseInt(process.env.ACCOUNT_LOCK_MINUTES || '15', 10),
  },
  b2: {
    keyId: process.env.B2_KEY_ID,
    appKey: process.env.B2_APPLICATION_KEY,
    bucket: process.env.B2_BUCKET,
    endpoint: process.env.B2_ENDPOINT,
    signedUrlTtl: parseInt(process.env.B2_SIGNED_URL_TTL || '900', 10),
  },
});
