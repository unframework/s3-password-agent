function AuthWallView(auth, h) {
    var isLoading = false;

    this.render = function () {
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
    };
}

module.exports = AuthWallView;
