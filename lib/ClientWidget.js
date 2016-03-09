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

function ClientWidget(suffix, onInit, onDomLoaded) {
    // detect source (our own script tag should be available immediately)
    var baseURLPrefix = findScriptBySrcSuffix(suffix).src.slice(0, -suffix.length);
    console.log('s3-link-agent: URL prefix =', baseURLPrefix);

    var rootNode = onInit(baseURLPrefix);

    window.addEventListener('DOMContentLoaded', function () {
        onDomLoaded(baseURLPrefix, rootNode);
    }, false);
}

module.exports = ClientWidget;