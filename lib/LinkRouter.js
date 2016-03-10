var express = require('express');
var yaml = require('js-yaml');

function LinkRouter(s3, s3Bucket, contentYamlData) {
    var contentYaml = Array.prototype.slice.call(yaml.safeLoad(contentYamlData));

    // whitelist accessible keys
    var objectKeyMap = Object.create(null);
    contentYaml.forEach(function (rawConfigValue) {
        if (typeof rawConfigValue !== 'string') {
            throw new Error('content key whitelist must contain only strings');
        }

        var key = rawConfigValue[0] === '/' ? rawConfigValue.substring(1) : rawConfigValue;
        objectKeyMap[key] = true;
    });

    console.info('using whitelist:', Object.keys(objectKeyMap));

    var linkApp = express.Router(); // @todo restrict domain

    // @todo rate limiting
    linkApp.get(/^\/(.*)$/, function (req, res) {
        var user = req.session.user;
        var unsafeObjectPath = req.params[0];

        // check whitelist
        if (!Object.prototype.hasOwnProperty.call(objectKeyMap, unsafeObjectPath)) {
            console.error('unknown key requested', unsafeObjectPath);

            res.status(500)
            res.send('cannot redirect');
            return;
        }

        var accessibleObjectKey = unsafeObjectPath;

        var params = {
            Key: accessibleObjectKey,
            Bucket: s3Bucket,
            ResponseContentDisposition: 'attachment', // trigger download
            Expires: 60 // 1 minute
        };

        s3.getSignedUrl('getObject', params, function (err, url) {
            if (err) {
                console.error('could not get url', err);

                res.status(500)
                res.send('cannot redirect');
                return;
            }

            console.info('redirecting', user, 'to:', url); // @todo more info or just remove
            res.redirect(302, url);
        });
    });

    return linkApp;
}

module.exports = LinkRouter;
