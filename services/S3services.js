const AWS = require('aws-sdk');
require('dotenv').config();

exports.uploadtoS3 = (data, filename) => {
    let s3Bucket = new AWS.S3({
        accessKeyId: process.env.IAM_ACCESS_KEY,
        secretAccessKey: process.env.IAM_SECRET_ACCESS_KEY
    });

    var params = {
        Bucket: process.env.BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read'
    };

    return new Promise((resolve, reject) => {
        s3Bucket.upload(params, (err, s3response) => {
            if (err) {
                console.log('Something went wrong!', err);
                reject(err);
            } else {
                resolve(s3response.Location);
            };
        });
    });
};