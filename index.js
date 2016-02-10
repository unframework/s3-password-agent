var AWS = require('aws-sdk');
var express = require('express');

var S3_BUCKET = process.env.S3_BUCKET

var s3 = new AWS.S3();

var params = {
    Key: 'key-graphic.png',
    Bucket: S3_BUCKET,
    Expires: 60 // 1 minute
};

var app = express();

// @todo rate limiting
app.get('/go/', function (req, res) {
    s3.getSignedUrl('getObject', params, function (err, url) {
        if (err) {
            console.error('could not get url', err);

            res.status(500)
            res.send('cannot redirect');
            return;
        }

        console.info('redirecting', url); // @todo more info or just remove
        res.redirect(302, url);
    });
});

app.listen(process.env.PORT || 3000);
