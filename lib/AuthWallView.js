var Promise = require('bluebird');

function text(h, contents) {
    return h('span', {
        style: {
            font: 'normal 20px sans-serif',
            color: '#444',
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
            color: '#222',
            lineHeight: '1em'
        }
    }, contents)
}

function input(h, name, labelContents) {
    var inputWidthPx = 300;

    return h('label', {
        style: {
            display: 'block',
            position: 'relative',
            lineHeight: '20px',
            paddingTop: '5px',
            paddingBottom: '5px',
            paddingRight: (inputWidthPx + 10) + 'px',
            whiteSpace: 'nowrap',
            textAlign: 'right'
        }
    }, [
        text(h, labelContents),
        h('input', {
            name: name,
            style: {
                position: 'absolute',
                top: 0,
                right: 0,
                width: inputWidthPx + 'px',
                lineHeight: '20px',
                fontSize: '18px',
                color: '#444',
                border: '1px solid #ccc',
                padding: '4px'
            }
        })
    ]);
}

// @todo error display
function form(h, label, contents, onsubmit) {
    return h('form', {
        style: {
            padding: 0,
            margin: 0,
            opacity: onsubmit ? 1 : 0.4,
            transition: 'opacity 0.1s'
        },
        onsubmit: function (e) {
            e.preventDefault();

            onsubmit(function (name) {
                return e.target.querySelectorAll('input[name=' + name + ']')[0].value;
            });

            return false;
        }
    }, [
        contents,
        h('button', {
            type: 'submit',
            disabled: onsubmit ? false : 'disabled',
            style: {
                display: 'inline-block',
                whiteSpace: 'nowrap',
                font: 'normal 16px sans-serif',
                color: '#222',
                lineHeight: '1em',
                padding: '5px 15px',
                verticalAlign: 'middle',
                borderRadius: '3px',
                border: '1px solid #ccc',
                background: '#e0e0e0',

                cursor: 'pointer'
            }
        }, label)
    ]);
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

                background: isMinimized ? '#e0e0e0' : 'radial-gradient(ellipse farthest-corner at 50% 50%, rgba(255, 255, 255, 1) 0%, rgba(160, 160, 160, 0.8) 100%)',
                opacity: isMinimized ? 0 : 0.6, // fade-in starts at zero

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
                form(h, 'Authenticate', [
                    input(h, 'email', 'Email'),
                    gutter(h),
                    input(h, 'pin', 'PIN'),
                    gutter(h)
                ], isLoading ? null : function (val) {
                    isLoading = true;
                    auth.authenticate(
                        val('email'),
                        val('pin')
                    ).then(function () { isLoading = false; });
                })
            ]);
        }

        return renderRoot(h, true, form(h, 'Sign Out', [], isLoading ? null : function () {
            isLoading = true;
            auth.signOut().then(function () { isLoading = false; });
        }));
    };
}

module.exports = AuthWallView;
