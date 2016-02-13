var fs = require('fs');
var stream = require('stream');
var browserify = require('browserify');
var Promise = require('bluebird');
var AWS = require('aws-sdk');
var express = require('express');
var cors = require('cors');

var LINK_AGENT_ROUTE = '/s3-link-agent.js';

var S3_BUCKET = process.env.S3_BUCKET

// whitelist accessible keys
var objectKeyMap = Object.create(null);
objectKeyMap['/key-graphic.png'] = true;

var s3 = new AWS.S3();

function whenClientSideCodeReady(sourceCode) {
    var clientRC = new stream.Readable();
    clientRC._read = function () {};
    clientRC.push(sourceCode);
    clientRC.push(null);

    var b = browserify().add(clientRC, { basedir: __dirname });

    return new Promise(function (resolve, reject) {
        b.bundle(function (err, buffer) {
            if(err) {
                reject(err);
            } else {
                resolve(buffer);
            }
        });
    });
}

var app = express();

// @todo rate limiting
app.get(LINK_AGENT_ROUTE, function (req, res) {
    // grab the client code file
    // @todo minify/etc?
    // @todo cache the code?
    fs.readFile('client.js', function (err, fileData) {
        if (err) {
            console.error('could not read client file', err);

            res.status(500)
            res.send('error serving client');
            return;
        }

        whenClientSideCodeReady(fileData).then(function (output) {
            res.setHeader('Content-Type', 'application/javascript');
            res.send(output);
        });
    });
});

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

var sessionApp = express.Router(); // @todo restrict domain
sessionApp.use(cors());
sessionApp.use(function (req, res, next) {
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    next();
});

sessionApp.get('/status', function (req, res) {
    setTimeout(function () {
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.send('true');
    }, 1000);
});

app.use('/session', sessionApp);

app.listen(process.env.PORT || 3000);
