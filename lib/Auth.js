var xhr = require('xhr');
var Promise = require('bluebird');

var AUTH_STORAGE_ITEM = 's3-link-agent-ded9a317-3ab7-4350-be97-a59ec9d2b79d';
var SESSION_STATUS_ROUTE = '/session/status';

function Auth(baseURLPrefix) {
    this.isAuthenticated = !!window.localStorage.getItem(AUTH_STORAGE_ITEM);

    xhr({
        method: 'GET',
        uri: baseURLPrefix + SESSION_STATUS_ROUTE
    }, function (err, resp, body) {
        if (err || resp.statusCode !== 200) {
            console.log('cannot get session status', err || resp.statusCode);
            return;
        }

        console.log('status', body);
    });
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
