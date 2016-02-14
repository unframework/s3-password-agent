function text(h, contents) {
    return h('span', {
        style: {
            font: 'normal 16px sans-serif',
            lineHeight: '1em'
        }
    }, contents)
}

function gutter(h) {
    return h('div', {
        style: {
            font: '0px',
            height: '10px'
        }
    })
}

function heading(h, contents) {
    return h('div', {
        style: {
            font: 'bold 24px sans-serif',
            lineHeight: '1em'
        }
    }, contents)
}

function button(h, contents, onclick) {
    return h('button', {
        style: {
            display: 'inline-block',
            whiteSpace: 'nowrap',
            font: 'normal 16px sans-serif',
            lineHeight: '1em',
            padding: '5px 15px',
            verticalAlign: 'middle',
            borderRadius: '3px',
            border: '1px solid #ccc',
            background: '#e0e0e0',

            cursor: 'pointer'
        },
        disabled: onclick ? false : 'disabled',
        onclick: onclick
    }, contents);
}

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

                background: isMinimized ? '#f0f0f0' : '#fff',
                opacity: isMinimized ? 0 : 0.9, // fade-in starts at zero

                transition: isMinimized
                    ? 'width 0.25s, height 0.25s, top 0.25s, right 0.25s, background 0.15s, opacity 10s'
                    : 'opacity 0.15s'
            }
        }),

        h('div', {
            style: {
                position: isMinimized ? 'relative' : 'absolute',
                zIndex: 2,
                top: isMinimized ? '5px' : 0,
                right: isMinimized ? '5px' : 0,
                width: isMinimized ? 'auto' : '100vw',
                height: isMinimized ? 'auto' : '100vh',

                lineHeight: isMinimized ? 'inherit' : '100vh',

                padding: isMinimized ? '5px' : 0,
                background: isMinimized ? '#f0f0f0' : 'transparent',

                verticalAlign: 'middle',
                textAlign: 'center'
            }
        }, [
            h('div', {
                style: {
                    display: 'inline-block',
                    width: 0,
                    height: isMinimized ? 0 : '100vh',
                    verticalAlign: 'middle'
                }
            }),
            h('div', {
                style: {
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    lineHeight: 1
                }
            }, isMinimized ? contents : []),
            h('div', {
                style: {
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    opacity: isMinimized ? 0 : 1,
                    transition: isMinimized ? '' : 'opacity 0.4s',
                    lineHeight: 1
                }
            }, isMinimized ? [] : contents)
        ])
    ]);
}

function AuthWallView(auth, h) {
    var isLoading = false;

    this.render = function () {
        if (!auth.getSessionIsActive()) {
            return renderRoot(h, false, [
                heading(h, 'Please log in'),
                gutter(h),
                button(h, 'Authenticate', isLoading ? null : function () {
                    isLoading = true;
                    auth.authenticate().then(function () { isLoading = false; });
                })
            ]);
        }

        return renderRoot(h, true, button(h, 'Sign Out', isLoading ? null : function () {
            isLoading = true;
            auth.signOut().then(function () { isLoading = false; });
        }));
    };
}

module.exports = AuthWallView;
