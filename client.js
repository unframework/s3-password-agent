var vdomLive = require('vdom-live');

var Auth = require('./lib/Auth');
var AuthWallView = require('./lib/AuthWallView');
var ClientWidget = require('./lib/ClientWidget');

// @todo fill console object as needed

// @todo wrap in a "server routes" helper object (for both client and server)
var LINK_AGENT_ROUTE = '/s3-link-agent.js';
var GO_ROUTE_PREFIX = '/go/';

function convertLink(linkDom, prefix) {
    // get href as declared in page source, not computed href property
    var href = linkDom.getAttribute('href');

    // look for specially marked hrefs
    if (!href || href.slice(0, 4) !== '#s3/') {
        return;
    }

    linkDom.href = prefix + href.slice(4);
}

function main() {
    new ClientWidget(LINK_AGENT_ROUTE, function (baseURLPrefix) {
        var rootNode = null;

        vdomLive(function (renderLive, h) {
            var auth = new Auth(baseURLPrefix);

            var authView = new AuthWallView(auth, h);
            rootNode = renderLive(function () {
                return authView.render();
            });
        });

        return rootNode;
    }, function (baseURLPrefix, rootNode) {
        document.body.appendChild(rootNode);

        var linkList = Array.prototype.slice.call(document.querySelectorAll('a'));

        linkList.forEach(function (linkDom) {
            convertLink(linkDom, baseURLPrefix + GO_ROUTE_PREFIX);
        });
    });
}

main();
