var fs = require('fs');
var AWS = require('aws-sdk');
var express = require('express');
var cookieParser = require('cookie-parser');

var SessionMiddleware = require('./lib/SessionMiddleware');
var ClientAssetRouter = require('./lib/ClientAssetRouter');
var LinkRouter = require('./lib/LinkRouter');
var SessionRouter = require('./lib/SessionRouter');
var InterstitialRouter = require('./lib/InterstitialRouter');

var configuredS3Bucket = requiredValue(process.env.S3_BUCKET, 'target S3 bucket');
var configuredPort = process.env.PORT || 3000;

var CONTENT_CONFIG_FILE = __dirname + '/content.yaml';
var USERS_CONFIG_FILE = __dirname + '/users.yaml';

var AUTH_COOKIE = 's3-link-agent-93f04cb9-f0a0-475d-8c86-cf610c2002b5';
var LINK_AGENT_ROUTE = '/s3-link-agent.js';
var LINK_AGENT_MAIN_ROUTE = '/s3-link-agent-main.js';

var contentYamlData = fs.readFileSync(CONTENT_CONFIG_FILE);
var usersYamlData = fs.readFileSync(USERS_CONFIG_FILE);

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
app.use(LINK_AGENT_ROUTE, new ClientAssetRouter(__dirname + '/client.js', __dirname));
app.use(LINK_AGENT_MAIN_ROUTE, new ClientAssetRouter(__dirname + '/clientMain.js', __dirname));
app.use('/go', new InterstitialRouter(LINK_AGENT_MAIN_ROUTE, '/download'));
app.use('/download', cookieParser(), sessionMiddleware, new LinkRouter(s3, configuredS3Bucket, contentYamlData));
app.use('/session', new SessionRouter(usersYamlData, sessionMiddleware));
app.listen(configuredPort);
