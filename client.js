(function (window, document) {
    var LINK_AGENT_ROUTE = '/s3-link-agent.js';

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

    // detect source
    var baseURLPrefix = detectBaseURLPrefix();
    console.log('got prefix', baseURLPrefix);

    var linkList = document.querySelectorAll('a');
    console.log('got links', linkList);

})(window, document);
