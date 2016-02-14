function renderRoot(h, isMinimized, contents) {
    return h('div', {
        style: {
            position: 'fixed',
            top: 0,
            right: 0,
            width: isMinimized ? 'auto' : '100vw',
            height: isMinimized ? 'auto' : '100vh'
        }
    }, [
        h('div', {
            style: {
                position: 'absolute',
                zIndex: 1,
                top: isMinimized ? '5px' : 0,
                right: isMinimized ? '5px' : 0,
                width: isMinimized ? 0 : '100vw',
                height: isMinimized ? 0 : '100vh',

                background: isMinimized ? '#eee' : '#fff',
                opacity: isMinimized ? 0 : 0.9, // fade-in starts at zero

                transition: isMinimized
                    ? 'width 0.15s, height 0.15s, top 0.15s, right 0.15s, background 0.15s, opacity 10s'
                    : 'opacity 0.15s'
            }
        }),

        isMinimized
            ? h('div', {
                style: {
                    position: 'relative',
                    zIndex: 2,
                    top: '5px',
                    right: '5px',
                    padding: '5px',
                    background: '#eee'
                }
            }, contents)

            : h('div', {
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
            }, contents))
    ]);
}

function AuthWallView(auth, h) {
    var isLoading = false;

    this.render = function () {
        if (!auth.getSessionIsActive()) {
            return renderRoot(h, false, [ h('div', [
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

        return renderRoot(h, true, h('button', {
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
