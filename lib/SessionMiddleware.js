var crypto = require('crypto');
var jwt = require('jsonwebtoken');

module.exports = function (cookieName) {
    // eventually generate secret
    var sessionSecret = null;
    crypto.randomBytes(16, function (err, buf) {
        if (err) {
            throw err;
        }

        sessionSecret = buf;
    });

    function sessionMiddleware(req, res, next) {
        jwt.verify(req.cookies[cookieName] || '', sessionSecret, function (err) {
            if (err) {
                res.status(403);
                res.send('not authorized');
                return;
            }

            // re-generate with new expiration time
            setupSession(res, function () {
                next();
            });
        });
    }

    function setupSession(res, callback) {
        jwt.sign({}, sessionSecret, { expiresIn: 1800 }, function (sessionToken) {
            res.cookie(cookieName, sessionToken, { httpOnly: true });

            callback();
        });
    }

    sessionMiddleware.setup = setupSession;

    return sessionMiddleware;
};
