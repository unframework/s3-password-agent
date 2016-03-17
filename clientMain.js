var vdomLive = require('vdom-live');

var ClientWidget = require('./lib/ClientWidget');
var Auth = require('./lib/Auth');
var AuthWallView = require('./lib/AuthWallView');

var LINK_AGENT_MAIN_ROUTE = '/s3-link-agent-main.js';

var downloadPath = window.DOWNLOAD_PATH;
var auth0Lock = window.AUTH0_LOCK;

// @todo fill console object as needed

function main() {
    vdomLive(function (renderLive, h) {
        new ClientWidget(LINK_AGENT_MAIN_ROUTE, function (baseURLPrefix) {
            var rootNode = null;

            var auth = new Auth(baseURLPrefix);

            var authView = new AuthWallView(auth, h, downloadPath, auth0Lock);
            rootNode = renderLive(function () {
                return authView.render();
            });

            return rootNode;
        }, function (baseURLPrefix, rootNode) {
            document.body.appendChild(rootNode);
        });
    });
}

main();
