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

function input(h, type, name, labelContents) {
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
            type: type,
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

function renderRoot(h, contents) {
    return h('div', {
        style: {
            position: 'fixed',
            top: 0,
            right: 0,
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

                background: '#f8f8f8'
            }
        }),

        h('div', {
            style: {
                position: 'absolute',
                zIndex: 2,
                top: 0,
                right: 0,
                width: '100vw',
                height: '100vh',

                lineHeight: '100vh',

                padding: 0,
                background: 'transparent',

                verticalAlign: 'middle',
                textAlign: 'center'
            }
        }, [
            h('div', {
                style: {
                    display: 'inline-block',
                    width: 0,
                    height: '100vh',
                    verticalAlign: 'middle'
                }
            }),
            h('div', {
                style: {
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    lineHeight: 1
                }
            }, contents)
        ])
    ]);
}

function AuthWallView(auth, h, downloadPath, auth0Lock) {
    var isLoading = false;
    var downloadTimer = null;
    var isDownloading = false;

    var auth0IsShowing = false;
    var lastAuth0Token = null;

    var renderAuth0 = function () {
        // auto-login via Auth0 when body is ready but not yet submitting the token
        if (!auth0IsShowing && !lastAuth0Token && document.body) {
            auth0IsShowing = true;

            auth0Lock.show({
                closable: false,
                responseType: 'token'
            }, function(err, profile, auth0Token) {
                auth0IsShowing = false;

                if (err) {
                    console.log('auth0 error', err);
                    return;
                }

                lastAuth0Token = auth0Token;

                document.getElementById('auth0Submit').click(); // get back into observed zone
            });
        }

        return h('form', { action: 'javascript:void(0)', onsubmit: function () {
            auth.authenticateWithAuth0Token(lastAuth0Token).then(function () {
                // reset to allow re-login
                lastAuth0Token = null;
            });
        } }, [
            text(h, 'Signing in...'),
            h('button', { id: 'auth0Submit', type: 'submit', style: { display: 'none' } })
        ]);
    };

    this.render = function () {
        if (!auth.getSessionIsReady()) {
            return renderRoot(h, [
                text(h, 'Starting download...')
            ]);
        }

        if (!auth.getSessionIsActive()) {
            return !auth0Lock
                ? renderRoot(h, [
                    heading(h, 'Access Download'),
                    gutter(h),
                    form(h, 'Continue', [
                        input(h, 'email', 'email', 'Email'),
                        gutter(h),
                        input(h, 'password', 'pin', 'PIN'),
                        gutter(h)
                    ], isLoading ? null : function (val) {
                        isLoading = true;
                        auth.authenticate(
                            val('email'),
                            val('pin')
                        ).then(function () { isLoading = false; });
                    })
                ])
                : renderRoot(h, [
                    renderAuth0()
                ]);
        }

        // auto-download on timer, in case the link is broken
        if (downloadTimer === null) {
            downloadTimer = setTimeout(function () {
                isDownloading = true;
                window.location = downloadPath;
            }, 1000);
        }

        return renderRoot(h, [
            text(h, isDownloading ? 'Download started, check status below' : 'Starting download...')
        ]);
    };
}

module.exports = AuthWallView;
