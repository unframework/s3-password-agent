var fs = require('fs');
var stream = require('stream');
var browserify = require('browserify');
var Promise = require('bluebird');
var AWS = require('aws-sdk');
var express = require('express');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var yaml = require('js-yaml');

var SessionMiddleware = require('./lib/SessionMiddleware');

var S3_BUCKET = process.env.S3_BUCKET;
var CONTENT_CONFIG_FILE = __dirname + '/content.yaml';
var USERS_CONFIG_FILE = __dirname + '/users.yaml';

var AUTH_COOKIE = 's3-link-agent-93f04cb9-f0a0-475d-8c86-cf610c2002b5';
var LINK_AGENT_ROUTE = '/s3-link-agent.js';

var contentYaml = Array.prototype.slice.call(yaml.safeLoad(fs.readFileSync(CONTENT_CONFIG_FILE)));
var usersYaml = yaml.safeLoad(fs.readFileSync(USERS_CONFIG_FILE));

// whitelist accessible keys
var objectKeyMap = Object.create(null);
contentYaml.forEach(function (rawConfigValue) {
    if (typeof rawConfigValue !== 'string') {
        throw new Error('content key whitelist must contain only strings');
    }

    var key = rawConfigValue[0] === '/' ? rawConfigValue.substring(1) : rawConfigValue;
    objectKeyMap[key] = true;
});

console.log('using whitelist:', Object.keys(objectKeyMap));
console.log('authorized users list:', Object.keys(usersYaml));

var origin = 'http://localhost:3000';

var s3 = new AWS.S3();
var sessionMiddleware = new SessionMiddleware(AUTH_COOKIE);

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

            res.status(500);
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
app.get(/^\/go\/(.*)$/, cookieParser(), sessionMiddleware, function (req, res) {
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
sessionApp.use(cors({
    origin: origin,
    credentials: true
}));
sessionApp.use(function (req, res, next) {
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    next();
});
sessionApp.use(cookieParser());

sessionApp.post('', bodyParser.json(), function (req, res) {
    var email = req.body.email;
    var pin = req.body.pin;

    // this is super cheesy, so only numeric pins are allowed,
    // to avoid semblance of any real security
    // although, gosh, people might type in their bank digits... @todo secure this
    if (!/^[0-9]{4,6}$/.exec(pin)) {
        res.status(400);
        res.send('malformed pin');
        return;
    }

    // validate credentials in a super cheesy way
    var authInfo = usersYaml.hasOwnProperty(email) ? usersYaml[email] : null;

    if (!authInfo || authInfo.pin + '' !== pin) {
        res.status(403);
        res.send('not authorized');
        return;
    }

    // user is authenticated
    sessionMiddleware.setup(res, function () {
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(true));
    });
});

sessionApp.post('/assert', sessionMiddleware, function (req, res) {
    res.status(200);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(true));
});

sessionApp.post('/sign-out', function (req, res) {
    res.status(200);
    res.cookie(AUTH_COOKIE, '', { httpOnly: true });
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(true));
});

app.use('/session', sessionApp);

app.listen(process.env.PORT || 3000);
