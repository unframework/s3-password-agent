var express = require('express');
var yaml = require('js-yaml');
var Minimatch = require('minimatch').Minimatch;

function LinkRouter(s3, s3Bucket, contentGlobStringList) {
    // whitelist accessible keys
    var objectKeyGlobList = contentGlobStringList.map(function (rawConfigValue) {
        if (typeof rawConfigValue !== 'string') {
            throw new Error('content key whitelist must contain only strings');
        }

        var globPattern = rawConfigValue[0] === '/' ? rawConfigValue.substring(1) : rawConfigValue;

        // globs with no funny business
        return new Minimatch(globPattern, {
            noext: true,
            nocase: true,
            nocomment: true,
            nonegate: true
        });
    });

    console.info('using content whitelist:', objectKeyGlobList.map(function (mm) { return mm.pattern; }));

    var linkApp = express.Router(); // @todo restrict domain

    // @todo rate limiting
    linkApp.get(/^\/(.*)$/, function (req, res) {
        var user = req.session.user;
        var unsafeObjectPath = req.params[0];

        // check whitelist
        var someGlobMatches = objectKeyGlobList.some(function (mm) {
            return mm.match(unsafeObjectPath);
        });

        if (!someGlobMatches) {
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
