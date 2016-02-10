var AWS = require('aws-sdk');
var express = require('express');

var S3_BUCKET = process.env.S3_BUCKET

// whitelist accessible keys
var objectKeyMap = Object.create(null);
objectKeyMap['/key-graphic.png'] = true;

var s3 = new AWS.S3();

var app = express();

// @todo rate limiting
app.get(/^\/go(\/.*)$/, function (req, res) {
    var unsafeObjectPath = req.params[0];

    // check whitelist
    if (!Object.prototype.hasOwnProperty.call(objectKeyMap, unsafeObjectPath)) {
        console.error('unknown key requested', unsafeObjectPath);

        res.status(500)
        res.send('cannot redirect');
        return;
    }

    // strip leading slash to get object key for signing request
    var accessibleObjectKey = unsafeObjectPath.substring(1);

    var params = {
        Key: accessibleObjectKey,
        Bucket: S3_BUCKET,
        Expires: 60 // 1 minute
    };

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
