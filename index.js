var AWS = require('aws-sdk');

var S3_BUCKET = process.env.S3_BUCKET

var s3 = new AWS.S3();

var params = {
    Key: 'key-graphic.png',
    Bucket: S3_BUCKET,
    Expires: 60 // 1 minute
};

s3.getSignedUrl('getObject', params, function (err, url) {
    if (err) {
        console.error('could not get url', err);
        return;
    }

    console.log('output:', url);
});
