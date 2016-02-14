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
                right: 0,
                width: '100vw',
                height: '100vh',

                background: '#fff',
                opacity: 0.9,

                transition: 'opacity 0.15s'
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

function renderStickyCorner(h, contents) {
    return h('div', {
        style: {
            position: 'fixed',
            top: 0,
            right: 0
        }
    }, [
        h('div', {
            style: {
                position: 'absolute',
                zIndex: 1,
                top: '5px',
                right: '5px',
                width: 0,
                height: 0,

                background: '#eee',
                opacity: 0, // starting point for background fade-in

                transition: 'width 0.15s, height 0.15s, top 0.15s, right 0.15s, background 0.15s, opacity 10s'
            }
        }),

        h('div', {
            style: {
                position: 'relative',
                zIndex: 2,
                top: '5px',
                right: '5px',
                padding: '5px',
                background: '#eee'
            }
        }, contents),
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

        return renderStickyCorner(h, h('button', {
            type: 'button',
            disabled: isLoading ? 'disabled' : false,
            onclick: function () {
                isLoading = true;
                auth.signOut().then(function () { isLoading = false; });
            }
        }, 'Sign Out'));
    };
}

module.exports = AuthWallView;
