function renderOverlay(h, contents) {
    return h('div', {
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh'
        }
    }, [
        h('div', {
            style: {
                position: 'absolute',
                zIndex: 1,
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',

                background: '#fff',
                opacity: 0.9
            }
        }),
        h('div', {
            style: {
                position: 'absolute',
                zIndex: 2,
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                lineHeight: '100vh',
                verticalAlign: 'middle',
                textAlign: 'center'
            }
        }, h('div', {
            style: {
                display: 'inline-block'
            }
        }, contents)),
    ]);
}

function AuthWallView(auth, h) {
    var isLoading = false;

    this.render = function () {
        if (!auth.getSessionIsActive()) {
            return renderOverlay(h, [ h('div', [
                'Please log in',
                ' ',
                h('button', {
                    type: 'button',
                    disabled: isLoading ? 'disabled' : false,
                    onclick: function () {
                        isLoading = true;
                        auth.authenticate().then(function () { isLoading = false; });
                    }
                }, 'Authenticate')
            ]) ]);
        }

        return h('button', {
            type: 'button',
            disabled: isLoading ? 'disabled' : false,
            onclick: function () {
                isLoading = true;
                auth.signOut().then(function () { isLoading = false; });
            }
        }, 'Sign Out');
    };
}

module.exports = AuthWallView;
