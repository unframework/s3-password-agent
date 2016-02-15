var fs = require('fs');
var stream = require('stream');
var browserify = require('browserify');
var Promise = require('bluebird');
var express = require('express');

function whenClientSideCodeReady(sourceCode, basedir) {
    var clientRC = new stream.Readable();
    clientRC._read = function () {};
    clientRC.push(sourceCode);
    clientRC.push(null);

    var b = browserify().add(clientRC, { basedir: basedir });

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

function ClientAssetRouter(basedir) {
    var clientApp = express.Router();

    // @todo rate limiting
    clientApp.get('', function (req, res) {
        // grab the client code file
        // @todo minify/etc?
        // @todo cache the code?
        fs.readFile(basedir + '/client.js', function (err, fileData) {
            if (err) {
                console.error('could not read client file', err);

                res.status(500);
                res.send('error serving client');
                return;
            }

            whenClientSideCodeReady(fileData, basedir).then(function (output) {
                res.setHeader('Content-Type', 'application/javascript');
                res.send(output);
            });
        });
    });

    return clientApp;
}

module.exports = ClientAssetRouter;
