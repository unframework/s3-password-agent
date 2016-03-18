var fs = require('fs');
var stream = require('stream');
var browserify = require('browserify');
var Promise = require('bluebird');
var express = require('express');

var AUTH0_EXPOSE_NAME = '__auth0';

function whenClientCodeCompiled(auth0Settings, sourceCode, basedir) {
    var clientRC = new stream.Readable();
    clientRC._read = function () {};
    clientRC.push(sourceCode);
    clientRC.push(null);

    var settingsRC = new stream.Readable();
    settingsRC._read = function () {};
    settingsRC.push('module.exports = ' + JSON.stringify(
        auth0Settings
            ? { domain: auth0Settings.domain, audience: auth0Settings.audience }
            : null
    ));
    settingsRC.push(null);

    var b = browserify().add(clientRC, { basedir: basedir });

    b = b.exclude(AUTH0_EXPOSE_NAME).require(settingsRC, { expose: AUTH0_EXPOSE_NAME, basedir: __dirname });

    if (auth0Settings) {
        b = b.require('auth0-lock');
    }

    return new Promise(function (resolve, reject) {
        b.bundle(function (err, buffer) {
            if(err) {
                reject(err);
            } else {
                console.info('compiled client code');
                resolve(buffer);
            }
        });
    });
}

function whenClientCodeLoaded(clientMainFile) {
    // asynchronously grab the client code file
    return new Promise(function (resolve, reject) {
        fs.readFile(clientMainFile, function (err, fileData) {
            if (err) {
                console.error('could not read client file', err);

                reject(err);
                return;
            }

            resolve(fileData);
        });
    });
}

function ClientAssetRouter(auth0Settings, clientMainFile, basedir) {
    var clientApp = express.Router();

    // asynchronously grab the client code file
    // @todo minify/etc?
    var whenReady = whenClientCodeLoaded(clientMainFile).then(function (fileData) {
        return whenClientCodeCompiled(auth0Settings, fileData, basedir);
    });

    // @todo rate limiting
    clientApp.get('', function (req, res) {
        whenReady.then(function (output) {
            res.setHeader('Content-Type', 'application/javascript');
            res.send(output);
        }, function (err) {
            res.status(500);
            res.send('error serving client');
        });
    });

    return clientApp;
}

module.exports = ClientAssetRouter;
