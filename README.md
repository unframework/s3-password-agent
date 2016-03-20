# S3 Password Agent

S3 Password Agent: password-protect AWS S3 download links for static sites like Jekyll / GitHub Pages. No extra generator plugins needed. [See live demo here](https://unframework.github.io/s3-password-agent-demo/).

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/unframework/s3-password-agent)

How to use:

* configure and deploy this Node.js server (e.g. Heroku or any other free host)
* include script tag and download links on your static site

How it works:

* user visits your site, clicks on the download link and is directed to the password agent server
* password agent server asks user for [Auth0 login](https://auth0.com/) / simple email + PIN
* user receives an auto-generated [temporary private S3 download URL](http://docs.aws.amazon.com/AmazonS3/latest/dev/RESTAuthentication.html#RESTAuthenticationQueryStringAuth) and gets file

Pros: you get to have your own trusted server instead of having to rely on a third-party relay service. The code is tiny and easily configured with no code changes or setup files. Cons: you have to have some minimal experience setting up a Heroku instance/other Node.js host.

As an extra feature, the user can be prompted for login right away, before clicking on a download link. This gives a sense of a restricted area "login wall" although the initial content page is still semi-visible behind the login popup. See below for pre-login popup setup.

Two modes of authentication are supported: [Auth0 lock-screen](https://auth0.com/docs/libraries/lock) (preferred) or simple email + PIN (very insecure and basic). See below for email + PIN mode config.

## Setup

Have your private S3 bucket ready, with an access key + secret authorized to read contents as appropriate.

If using Auth0 as authentication provider (recommended), [sign up for their free tier](https://auth0.com/how-it-works). Otherwise, see below for a less-secure + more-cumbersome local email/PIN method.

Deploy the password agent server. Free Node.js hosts such as [Heroku](https://www.heroku.com/) are perfectly okay, nothing more fancy is needed. Click on the above "[Deploy to Heroku](https://heroku.com/deploy?template=https://github.com/unframework/s3-password-agent)" button to get started.

Most configuration happens via env vars (config vars in Heroku instance settings). Here is the full list:

- AWS key ID and secret: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- AWS bucket: `S3_BUCKET`
- content whitelist (see below): `CONTENT`
- Auth0 settings: `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`
- CORS origin (only if using pre-login): `CORS_ORIGIN`

Your deployed password agent server will be accessible under a web URL that looks something like `https://abc123.herokuapp.com/` (any domain name works fine). Make note of it for later.

All downloads have to match a content whitelist. It is a list of one or more full file paths relative to S3 bucket root. File patterns (globs) are also allowed (e.g. `test-*.pdf` matches `test-1.pdf` and `**` matches every file in the bucket). Simplest way to define it is to set the `CONTENT` env var as a comma- or space-separated list:

```
docs/**, release-*/dist/*.zip
```

Alternatively, the content whitelist can be defined by editing and committing the config file - `content.yaml`:

```yaml
- docs/**
- release-*/dist/*.zip
```

Set up your static site (see [live demo page](https://unframework.github.io/s3-password-agent-demo/) for sample markup):

* add the widget script `https://<your-deployed-password-agent>/s3-links.js`, somewhere near the top of the page
* point download links to `#s3/<your-file-path>`, where `<your-file-path>` is the file relative to the bucket root

Ensure that Auth0 app settings include `https://<your-deployed-password-agent>` in the CORS origin list, otherwise logins will fail. Set the Auth0 JWT expiration time to be reasonably short, e.g. `1800` (half-hour), because they are not retained once user logs in anyway.

Don't forget to disable signups in Auth0! Go to **Connections**, find your database or social connection settings and turn on **Disable Sign Ups**. Otherwise, any anonymous visitor can choose to sign up and access your restricted links.

Oh, and add the users that should access the downloads in the Auth0 user management dashboard.

That's it.

## Pre-login Popup

Set up the CORS site origin config variable (`CORS_ORIGIN`) to contain the site where the auth popup will show. It may contain several comma/space separated values. For example:

```
https://main-download-area.example.com, https://my-staging-area.localdomain
```

Don't forget to add the same site to the Auth0 CORS origin set.

Make sure that the `https://<your-deployed-password-agent>` origin is still part of the Auth0 CORS origin set. That will help the user re-authenticate as needed during file download step.

Then include `https://<your-deployed-password-agent>/s3-login.js` as a script on your site *instead* of `https://<your-deployed-password-agent>/s3-links.js`.

## Simple Local Email + PIN Auth

Use of Auth0 for user sign-in is strongly recommended. This is the insecure local user list alternative.

Edit and commit the user list - `users.yaml` - set of allowed emails with their PINs:

```yaml
user1@example.com:
    pin: 1234
user2@example.com:
    pin: 01134
```

PINs can only be numeric. Leave Auth0 settings unset to turn on the email + PIN authentication mode.

**SECURITY WARNING:** please do not use this for anything with real security needs. PINs are restricted to only being numeric, to discourage any real passwords being used. These PINs are stored in plaintext, committed to your local repo clone and pushed to Heroku, so anyone who can read the repo source code can read the PINs and gain access to the whitelisted files.

## Development

```sh
cat <<EOF > test-env.sh
export PORT=3020 # for testing only

export AUTH0_DOMAIN=...
export AUTH0_CLIENT_ID=...
export AUTH0_CLIENT_SECRET=...

export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export S3_BUCKET=...

export CORS_ORIGIN=http://localhost:3000

export CONTENT='/**'
EOF

. test-env.sh

npm install
serve & # any background static server for the example page
supervisor index.js
```

Then visit `http://localhost:3000/examples/simple.html` in browser.
