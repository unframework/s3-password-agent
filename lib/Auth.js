var xhr = require('xhr');
var Promise = require('bluebird');

var AUTH_STORAGE_ITEM = 's3-link-agent-ded9a317-3ab7-4350-be97-a59ec9d2b79d';
var SESSION_STATUS_ROUTE = '/session/status';

function whenXHR(options) {
    return new Promise(function (resolve, reject) {
        xhr(options, function (err, resp, body) {
            if (err || resp.statusCode !== 200) {
                reject(err || resp.statusCode);
                return;
            }

            try {
                resolve(JSON.parse(body));
            } catch (e) {
                reject(e);
            }
        });
    });
}

function Auth(baseURLPrefix) {
    this.isAuthenticated = true || !!window.localStorage.getItem(AUTH_STORAGE_ITEM);

    // run initial validation
    if (this.isAuthenticated) {
        whenXHR({
            method: 'GET',
            uri: baseURLPrefix + SESSION_STATUS_ROUTE
        }).then(function (body) {
            console.log('status', body);
        }, function (code) {
            console.log('cannot get session status', code);
        });
    }
}

Auth.prototype.authenticate = function () {
    return new Promise(function (resolve) {
        // test timeout
        setTimeout(function () {
            this.isAuthenticated = true;

            resolve();
        }.bind(this), 1000);
    }.bind(this));
};

module.exports = Auth;
