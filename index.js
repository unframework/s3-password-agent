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
var configuredContent = process.env.CONTENT || '';
var configuredPort = process.env.PORT || 3000;

var CONTENT_CONFIG_FILE = __dirname + '/content.yaml';
var USERS_CONFIG_FILE = __dirname + '/users.yaml';

var auth0Settings = process.env.AUTH0_DOMAIN ? {
    domain: process.env.AUTH0_DOMAIN,
    audience: process.env.AUTH0_CLIENT_ID || '',
    secret: new Buffer(process.env.AUTH0_CLIENT_SECRET || '', 'base64')
} : null;

var AUTH_COOKIE = 's3-password-agent-93f04cb9-f0a0-475d-8c86-cf610c2002b5';
var LINK_AGENT_ROUTE = '/s3-links.js'; // uncommon name for better self-detection
var LINK_AGENT_LOGIN_ROUTE = '/s3-login.js'; // uncommon name for better self-detection
var LINK_AGENT_MAIN_ROUTE = '/go.js';

// get content glob list from either source
var contentYamlList = Array.prototype.slice.call(yaml.safeLoad(fs.readFileSync(CONTENT_CONFIG_FILE)) || []);
var contentVarList = configuredContent.split(/[\s,]+/g).filter(function (v) { return !!v.length; });

if (contentVarList.length > 0 && contentYamlList.length > 0) {
    throw new Error('use either env var or file to define content whitelist but not both');
}

var contentList = contentVarList.length > 0 ? contentVarList : contentYamlList;

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
app.get('/', function (req, res) { res.send('s3-password-agent'); }); // default text for looky-loos
app.use(LINK_AGENT_ROUTE, new ClientAssetRouter(auth0Settings, __dirname + '/client.js', __dirname));
app.use(LINK_AGENT_LOGIN_ROUTE, new ClientAssetRouter(auth0Settings, __dirname + '/clientLogin.js', __dirname));
app.use(LINK_AGENT_MAIN_ROUTE, new ClientAssetRouter(auth0Settings, __dirname + '/clientMain.js', __dirname));
app.use('/go', new InterstitialRouter(LINK_AGENT_MAIN_ROUTE, '/download'));
app.use('/download', cookieParser(), sessionMiddleware, new LinkRouter(s3, configuredS3Bucket, contentList));
app.use('/session', new SessionRouter(usersYaml, auth0Settings, sessionMiddleware, siteList));
app.listen(configuredPort);
