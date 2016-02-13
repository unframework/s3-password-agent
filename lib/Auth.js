var Promise = require('bluebird');

var AUTH_STORAGE_ITEM = 's3-link-agent-ded9a317-3ab7-4350-be97-a59ec9d2b79d';

function Auth() {
    this.isAuthenticated = !!window.localStorage.getItem(AUTH_STORAGE_ITEM);
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
