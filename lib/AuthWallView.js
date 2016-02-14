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
                opacity: 0.7
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
        return renderOverlay(h, [ h('div', [
            isLoading
                ? 'WAITING'
                : auth.getSessionIsActive() ? 'AUTH:YES' : 'AUTH:NO',
            ' ',
            h('button', {
                type: 'button',
                onclick: function () {
                    isLoading = true;
                    auth.authenticate().then(function () { isLoading = false; });
                }
            }, 'Authenticate'),
            h('button', {
                type: 'button',
                onclick: function () {
                    isLoading = true;
                    auth.signOut().then(function () { isLoading = false; });
                }
            }, 'Sign Out')
        ]) ]);
    };
}

module.exports = AuthWallView;
