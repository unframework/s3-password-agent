// @todo fill console object as needed
var LINK_AGENT_ROUTE = '/s3-link-agent.js';
var GO_ROUTE_PREFIX = '/go/';

function detectBaseURLPrefix() {
    var fullScriptList = Array.prototype.slice.call(document.querySelectorAll('script'));
    var selfScriptList = fullScriptList.filter(function (dom) {
        return (dom.src && dom.src.slice(-LINK_AGENT_ROUTE.length) === LINK_AGENT_ROUTE);
    });

    if (selfScriptList.length !== 1) {
        throw new Error('expected to find just one script matching self');
    }

    return selfScriptList[0].src.slice(0, -LINK_AGENT_ROUTE.length);
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
    var baseURLPrefix = detectBaseURLPrefix();
    console.log('s3-link-agent: URL prefix =', baseURLPrefix);

    window.addEventListener('load', function () {
        var linkList = Array.prototype.slice.call(document.querySelectorAll('a'));

        linkList.forEach(function (linkDom) {
            convertLink(linkDom, baseURLPrefix);
        });
    }, false);
}

main();
