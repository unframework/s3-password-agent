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

function convertLink(linkDom, prefix) {
    // get href as declared in page source, not computed href property
    var href = linkDom.getAttribute('href');

    // look for specially marked hrefs
    if (!href || href.slice(0, 4) !== '#s3/') {
        return;
    }

    linkDom.href = prefix + href.slice(4);
}

function ClientWidget(suffix, linkPrefix, onInit) {
    // detect source (our own script tag should be available immediately)
    var baseURLPrefix = findScriptBySrcSuffix(suffix).src.slice(0, -suffix.length);
    console.log('s3-link-agent: URL prefix =', baseURLPrefix);

    var rootNode = onInit(baseURLPrefix);

    window.addEventListener('DOMContentLoaded', function () {
        document.body.appendChild(rootNode);

        var linkList = Array.prototype.slice.call(document.querySelectorAll('a'));

        linkList.forEach(function (linkDom) {
            convertLink(linkDom, baseURLPrefix + linkPrefix);
        });
    }, false);
}

module.exports = ClientWidget;
