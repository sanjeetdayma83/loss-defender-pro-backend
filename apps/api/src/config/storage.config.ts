export default () => ({
  storage: {
    driver: process.env.STORAGE_DRIVER ?? 'b2',

    uploadPath: process.env.UPLOAD_PATH ?? 'uploads',

    bucket: process.env.B2_BUCKET_NAME,

    endpoint: process.env.B2_ENDPOINT,

    region: process.env.B2_REGION ?? 'us-east-005',

    keyId: process.env.B2_KEY_ID,

    applicationKey: process.env.B2_APPLICATION_KEY,
  },
});
