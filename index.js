var fs = require('fs');
var AWS = require('aws-sdk');
var express = require('express');

var SessionMiddleware = require('./lib/SessionMiddleware');
var ClientAssetRouter = require('./lib/ClientAssetRouter');
var LinkRouter = require('./lib/LinkRouter');
var SessionRouter = require('./lib/SessionRouter');

var S3_BUCKET = process.env.S3_BUCKET;
var CONTENT_CONFIG_FILE = __dirname + '/content.yaml';
var USERS_CONFIG_FILE = __dirname + '/users.yaml';

var AUTH_COOKIE = 's3-link-agent-93f04cb9-f0a0-475d-8c86-cf610c2002b5';
var LINK_AGENT_ROUTE = '/s3-link-agent.js';

var contentYamlData = fs.readFileSync(CONTENT_CONFIG_FILE);
var usersYamlData = fs.readFileSync(USERS_CONFIG_FILE);

var origin = 'http://localhost:3000'; // @todo configure

var s3 = new AWS.S3();
var sessionMiddleware = new SessionMiddleware(AUTH_COOKIE);

var app = express();
app.use(LINK_AGENT_ROUTE, new ClientAssetRouter(__dirname));
app.use('/go', new LinkRouter(s3, S3_BUCKET, contentYamlData, sessionMiddleware));
app.use('/session', new SessionRouter(origin, usersYamlData, sessionMiddleware));
app.listen(process.env.PORT || 3000);
