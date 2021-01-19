const crypto = require('crypto');
const S3 = require('aws-sdk/clients/s3');
const Bucket = process.env.BUCKET || 'lowav';

exports.handler = async (_) => {
    try {
        const key = crypto.randomBytes(16).toString('hex');
        const s3 = new S3();
        const params = {
            Expires: 60,
            Bucket,
            Conditions: [['content-length-range', 1e4, 1e8]], // 10KB - 100MB
            Fields: { key }
        };
        const data = await new Promise(async (resolve, reject) => {
            s3.createPresignedPost(params, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data);
            });
        });
        return {
            key,
            ...data
        }
    } catch (err) {
        console.log('Error creating s3 policy', err);
    }
};
