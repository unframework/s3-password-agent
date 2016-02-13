var vdomLive = require('vdom-live');

function AuthWallView(auth) {
    var liveNode = null;
    var isLoading = false;

    vdomLive(function (renderLive, h) {
        liveNode = renderLive(function () {
            return h('div', [
                isLoading
                    ? 'WAITING'
                    : auth.isAuthenticated ? 'AUTH:YES' : 'AUTH:NO',
                ' ',
                h('button', {
                    type: 'button',
                    onclick: function () {
                        isLoading = true;
                        auth.authenticate().then(function () { isLoading = false; });
                    }
                }, 'Authenticate')
            ]);
        });
    });

    this.rootNode = liveNode;
}

module.exports = AuthWallView;
