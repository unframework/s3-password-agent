var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var yaml = require('js-yaml');
var jwt = require('jsonwebtoken');

function SessionRouter(usersYaml, sessionMiddleware) {
    console.info('authorized users list:', Object.keys(usersYaml));

    var sessionApp = express.Router(); // @todo restrict domain

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
        console.info('authenticated', email); // @todo more info or just remove

        sessionMiddleware.setup(res, email, function () {
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
        sessionMiddleware.clear(res, function () {
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(true));
        });
    });

    return sessionApp;
}

module.exports = SessionRouter;
