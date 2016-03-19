var fs = require('fs');
var AWS = require('aws-sdk');
var express = require('express');
var cookieParser = require('cookie-parser');
var yaml = require('js-yaml');

var SessionMiddleware = require('./lib/SessionMiddleware');
var ClientAssetRouter = require('./lib/ClientAssetRouter');
var LinkRouter = require('./lib/LinkRouter');
var SessionRouter = require('./lib/SessionRouter');
var InterstitialRouter = require('./lib/InterstitialRouter');

var configuredS3Bucket = requiredValue(process.env.S3_BUCKET, 'target S3 bucket');
var configuredCORSOrigin = process.env.CORS_ORIGIN || '';
var configuredPort = process.env.PORT || 3000;

var CONTENT_CONFIG_FILE = __dirname + '/content.yaml';
var USERS_CONFIG_FILE = __dirname + '/users.yaml';

var auth0Settings = process.env.AUTH0_DOMAIN ? {
    domain: process.env.AUTH0_DOMAIN,
    audience: process.env.AUTH0_CLIENT_ID || '',
    secret: new Buffer(process.env.AUTH0_CLIENT_SECRET || '', 'base64')
} : null;

var AUTH_COOKIE = 's3-link-agent-93f04cb9-f0a0-475d-8c86-cf610c2002b5';
var LINK_AGENT_ROUTE = '/s3-links.js';
var LINK_AGENT_LOGIN_ROUTE = '/s3-login.js';
var LINK_AGENT_MAIN_ROUTE = '/go.js';

var contentYamlData = fs.readFileSync(CONTENT_CONFIG_FILE);

// list of pre-login sites
var siteList = configuredCORSOrigin.split(/[\s,]+/g).filter(function (v) { return !!v.length; });

// @todo make UserDB class
var usersYaml = yaml.safeLoad(fs.readFileSync(USERS_CONFIG_FILE)) || {};

function requiredValue(val, description) {
    if (val === null || val === undefined) {
        throw new Error('missing configuration for: ' + description);
    }

    return val;
}

var s3 = new AWS.S3();
var sessionMiddleware = new SessionMiddleware(AUTH_COOKIE);

var app = express();
app.get('/', function (req, res) { res.send('s3-link-agent'); }); // default text for looky-loos
app.use(LINK_AGENT_ROUTE, new ClientAssetRouter(auth0Settings, __dirname + '/client.js', __dirname));
app.use(LINK_AGENT_LOGIN_ROUTE, new ClientAssetRouter(auth0Settings, __dirname + '/clientLogin.js', __dirname));
app.use(LINK_AGENT_MAIN_ROUTE, new ClientAssetRouter(auth0Settings, __dirname + '/clientMain.js', __dirname));
app.use('/go', new InterstitialRouter(LINK_AGENT_MAIN_ROUTE, '/download'));
app.use('/download', cookieParser(), sessionMiddleware, new LinkRouter(s3, configuredS3Bucket, contentYamlData));
app.use('/session', new SessionRouter(usersYaml, auth0Settings, sessionMiddleware, siteList));
app.listen(configuredPort);
