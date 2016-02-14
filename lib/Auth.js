var xhr = require('xhr');
var Promise = require('bluebird');

var AUTH_STORAGE_ITEM = 's3-link-agent-ded9a317-3ab7-4350-be97-a59ec9d2b79d';
var SESSION_SIGN_IN_ROUTE = '/session';
var SESSION_STATUS_ROUTE = '/session/status';
var SESSION_SIGN_OUT_ROUTE = '/session/sign-out';

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
    this._isSignedIn = !!window.localStorage.getItem(AUTH_STORAGE_ITEM);

    // run initial validation
    if (this._isSignedIn) {
        whenXHR({
            method: 'GET',
            withCredentials: true,
            uri: this._baseURLPrefix + SESSION_STATUS_ROUTE
        }).then(function (body) {
            if (!body) {
                this._isSignedIn = false;
                this.persist();

                console.log('signed out stale session');
            }
        }.bind(this), function (code) {
            console.log('cannot get session status:', code);
        }.bind(this));
    }
}

Auth.prototype.getSessionIsActive = function () {
    return this._isSignedIn;
}

Auth.prototype.authenticate = function () {
    return whenXHR({
        method: 'POST',
        withCredentials: true,
        uri: this._baseURLPrefix + SESSION_SIGN_IN_ROUTE
    }).then(function () {
        this._isSignedIn = true;
        this.persist();

        console.log('signed in');
    }.bind(this), function (code) {
        console.log('cannot sign in:', code);
    }.bind(this));
};

Auth.prototype.signOut = function () {
    return whenXHR({
        method: 'POST',
        withCredentials: true,
        uri: this._baseURLPrefix + SESSION_SIGN_OUT_ROUTE
    }).then(function () {
        this._isSignedIn = false;
        this.persist();

        console.log('signed out');
    }.bind(this), function (code) {
        console.log('cannot sign out:', code);
    }.bind(this));
};

Auth.prototype.persist = function () {
    window.localStorage.setItem(AUTH_STORAGE_ITEM, this._isSignedIn ? '1' : '');
};

module.exports = Auth;
