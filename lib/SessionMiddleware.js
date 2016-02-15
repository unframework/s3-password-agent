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
        jwt.verify(req.cookies[cookieName] || '', sessionSecret, function (err, tokenData) {
            if (err) {
                res.status(403);
                res.send('not authorized');
                return;
            }

            // populate verified session info
            var user = tokenData.sub;

            req.session = {
                user: user
            };

            // re-generate with new expiration time
            setupSession(res, user, function () {
                next();
            });
        });
    }

    function setupSession(res, user, callback) {
        jwt.sign({}, sessionSecret, { subject: user, expiresIn: 1800 }, function (sessionToken) {
            res.cookie(cookieName, sessionToken, { httpOnly: true });

            callback();
        });
    }

    sessionMiddleware.setup = setupSession;

    return sessionMiddleware;
};
