var xhr = require('xhr');
var Promise = require('bluebird');

var AUTH_STORAGE_ITEM = 's3-link-agent-ded9a317-3ab7-4350-be97-a59ec9d2b79d';
var SESSION_SIGN_IN_ROUTE = '/session';
var SESSION_ASSERT_ROUTE = '/session/assert';
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
    this._isSignedIn = window.localStorage.getItem(AUTH_STORAGE_ITEM) ? null : false; // validate logged-in status first

    // run initial validation
    if (this._isSignedIn === null) {
        whenXHR({
            method: 'POST',
            withCredentials: true,
            uri: this._baseURLPrefix + SESSION_ASSERT_ROUTE
        }).then(function (body) {
            this._isSignedIn = true;

            console.log('s3-link-agent: confirmed valid session');
        }.bind(this), function (code) {
            // always sign out, on any error
            this._isSignedIn = false;
            this.persist();

            console.log('s3-link-agent: signed out stale session');
        }.bind(this));
    }
}

Auth.prototype.getSessionIsReady = function () {
    return this._isSignedIn !== null;
};

Auth.prototype.getSessionIsActive = function () {
    if (this._isSignedIn === null) {
        throw new Error('not loaded');
    }

    return this._isSignedIn;
};

// @todo send pin as a hash? HTTPS is probably just as good, obvs
Auth.prototype.authenticate = function (email, pin) {
    return whenXHR({
        method: 'POST',
        withCredentials: true,
        uri: this._baseURLPrefix + SESSION_SIGN_IN_ROUTE,
        json: { email: email, pin: pin }
    }).then(function () {
        this._isSignedIn = true;
        this.persist();

        console.log('s3-link-agent: signed in');
    }.bind(this), function (code) {
        console.log('s3-link-agent: cannot sign in:', code);
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

        console.log('s3-link-agent: signed out');
    }.bind(this), function (code) {
        console.log('s3-link-agent: cannot sign out:', code);
    }.bind(this));
};

Auth.prototype.persist = function () {
    window.localStorage.setItem(AUTH_STORAGE_ITEM, this._isSignedIn ? '1' : '');
};

module.exports = Auth;
