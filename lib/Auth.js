var xhr = require('xhr');
var Promise = require('bluebird');

var AUTH_STORAGE_ITEM = 's3-link-agent-ded9a317-3ab7-4350-be97-a59ec9d2b79d';
var SESSION_SIGN_IN_ROUTE = '/session';
var SESSION_STATUS_ROUTE = '/session/:key/status';
var SESSION_SIGN_OUT_ROUTE = '/session/:key/sign-out';

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
    this._baseURLPrefix = baseURLPrefix;
    this._sessionKey = window.localStorage.getItem(AUTH_STORAGE_ITEM) || null;

    // run initial validation
    if (this._sessionKey !== null) {
        whenXHR({
            method: 'GET',
            uri: this._baseURLPrefix + SESSION_STATUS_ROUTE.replace(':key', encodeURIComponent(this._sessionKey))
        }).then(function (body) {
            console.log('status', body);
        }, function (code) {
            console.log('cannot get session status:', code);
        });
    }
}

Auth.prototype.getSessionIsActive = function () {
    return this._sessionKey !== null;
}

Auth.prototype.authenticate = function () {
    return whenXHR({
        method: 'POST',
        uri: this._baseURLPrefix + SESSION_SIGN_IN_ROUTE
    }).then(function (body) {
        this._sessionKey = body;
        this.persist();

        console.log('signed in');
    }.bind(this), function (code) {
        console.log('cannot sign in:', code);
    }.bind(this));
};

Auth.prototype.signOut = function () {
    return whenXHR({
        method: 'POST',
        uri: this._baseURLPrefix + SESSION_SIGN_OUT_ROUTE.replace(':key', encodeURIComponent(this._sessionKey))
    }).then(function () {
        this._sessionKey = null;
        this.persist();

        console.log('signed out');
    }.bind(this), function (code) {
        console.log('cannot sign out:', code);
    }.bind(this));
};

Auth.prototype.persist = function () {
    window.localStorage.setItem(AUTH_STORAGE_ITEM, this._sessionKey || '');
};

module.exports = Auth;
