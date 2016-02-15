var fs = require('fs');
var stream = require('stream');
var browserify = require('browserify');
var Promise = require('bluebird');
var express = require('express');

function whenClientCodeCompiled(sourceCode, basedir) {
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
                console.info('compiled client code');
                resolve(buffer);
            }
        });
    });
}

function ClientAssetRouter(clientMainFile, basedir) {
    var clientApp = express.Router();

    // asynchronously grab the client code file
    var whenReady = new Promise(function (resolve, reject) {
        // @todo minify/etc?
        fs.readFile(clientMainFile, function (err, fileData) {
            if (err) {
                console.error('could not read client file', err);

                reject(err);
                return;
            }

            resolve(whenClientCodeCompiled(fileData, basedir));
        });
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
