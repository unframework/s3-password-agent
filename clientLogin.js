var vdomLive = require('vdom-live');

var ClientWidget = require('./lib/ClientWidget');
var Auth = require('./lib/Auth');
var AuthWallView = require('./lib/AuthWallView');

// @todo fill console object as needed

// @todo wrap in a "server routes" helper object (for both client and server)
var LINK_AGENT_LOGIN_ROUTE = '/s3-link-agent-login.js';
var GO_ROUTE_PREFIX = '/go/';

var auth0Settings = require('__auth0');
var auth0Lock = auth0Settings ? new require('auth0-lock')(auth0Settings.audience, auth0Settings.domain) : null;

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
    vdomLive(function (renderLive, h) {
        new ClientWidget(LINK_AGENT_LOGIN_ROUTE, function (baseURLPrefix) {
            var auth = new Auth(baseURLPrefix);

            var authView = new AuthWallView(auth, h, null, auth0Lock);
            return renderLive(function () {
                return authView.render();
            });
        }, function (baseURLPrefix, rootNode) {
            // @todo make reusable between widgets
            var linkList = Array.prototype.slice.call(document.querySelectorAll('a'));

            linkList.forEach(function (linkDom) {
                convertLink(linkDom, baseURLPrefix + GO_ROUTE_PREFIX);
            });

            document.body.appendChild(rootNode);
        });
    });
}

main();
