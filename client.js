var vdomLive = require('vdom-live');

var Auth = require('./lib/Auth');
var AuthWallView = require('./lib/AuthWallView');

// @todo fill console object as needed

// @todo wrap in a "server routes" helper object (for both client and server)
var LINK_AGENT_ROUTE = '/s3-link-agent.js';
var GO_ROUTE_PREFIX = '/go/';

function findScriptBySrcSuffix(suffix) {
    var fullScriptList = Array.prototype.slice.call(document.querySelectorAll('script'));
    var selfScriptList = fullScriptList.filter(function (dom) {
        return (dom.src && dom.src.slice(-suffix.length) === suffix);
    });

    if (selfScriptList.length !== 1) {
        throw new Error('expected to find just one script matching self');
    }

    return selfScriptList[0];
}

function convertLink(linkDom, baseURLPrefix) {
    // get href as declared in page source, not computed href property
    var href = linkDom.getAttribute('href');

    // look for specially marked hrefs
    if (!href || href.slice(0, 4) !== '#s3/') {
        return;
    }

    linkDom.href = baseURLPrefix + GO_ROUTE_PREFIX + href.slice(4);
}

function main() {
    // detect source (our own script tag should be available immediately)
    var baseURLPrefix = findScriptBySrcSuffix(LINK_AGENT_ROUTE).src.slice(0, -LINK_AGENT_ROUTE.length);
    console.log('s3-link-agent: URL prefix =', baseURLPrefix);

    var rootNode = null;

    vdomLive(function (renderLive, h) {
        var auth = new Auth(baseURLPrefix);

        var authView = new AuthWallView(auth, h);
        rootNode = renderLive(function () {
            return authView.render();
        });
    });

    window.addEventListener('DOMContentLoaded', function () {
        document.body.appendChild(rootNode);

        var linkList = Array.prototype.slice.call(document.querySelectorAll('a'));

        linkList.forEach(function (linkDom) {
            convertLink(linkDom, baseURLPrefix);
        });
    }, false);
}

main();
