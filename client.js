var vdomLive = require('vdom-live');

var Auth = require('./lib/Auth');
var AuthWallView = require('./lib/AuthWallView');
var ClientWidget = require('./lib/ClientWidget');

// @todo fill console object as needed

// @todo wrap in a "server routes" helper object (for both client and server)
var LINK_AGENT_ROUTE = '/s3-link-agent.js';
var GO_ROUTE_PREFIX = '/go/';

function main() {
    new ClientWidget(LINK_AGENT_ROUTE, GO_ROUTE_PREFIX, function (baseURLPrefix) {
        var rootNode = null;

        vdomLive(function (renderLive, h) {
            var auth = new Auth(baseURLPrefix);

            var authView = new AuthWallView(auth, h);
            rootNode = renderLive(function () {
                return authView.render();
            });
        });

        return rootNode;
    });
}

main();
