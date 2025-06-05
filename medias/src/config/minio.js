const Minio = require('minio');
const dotenv = require('dotenv');

dotenv.config();

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || '172.17.0.3',
    port: parseInt(process.env.MINIO_PORT || '38423'),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

const BUCKET_NAME = 'test-blog';

// Ensure bucket exists
const initializeBucket = async () => {
    try {
        const exists = await minioClient.bucketExists(BUCKET_NAME);
        if (!exists) {
            await minioClient.makeBucket(BUCKET_NAME);
            console.log('Created bucket:', BUCKET_NAME);
        }
    } catch (error) {
        console.error('Error initializing MinIO bucket:', error);
        throw error;
    }
};

module.exports = {
    minioClient,
    BUCKET_NAME,
    initializeBucket
}; 