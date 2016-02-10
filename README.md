# [WIP] S3 Link Agent

S3 link agent: sign private S3 download links and insert redirect code into static pages.

Works as a Node-based redirect server for self-hosting (Heroku-friendly). Serves up a snippet of client-side JS that shows authentication UI (TODO) and replaces any link with `href="#s3/<objectkey>"` to point to the redirect server. The redirect server forwards the authenticated (TODO) user browser to a signed private S3 bucket link with a short expiry time.

Intended for use with any static site generator like GitHub Pages, with no extra plugins.

## Development

```sh
cat <<EOF > test-env.sh
export PORT=3020
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export S3_BUCKET=...
EOF

. test-env.sh

npm install
serve & # any background static server for the example page
supervisor index.js
```

Then http://localhost:3000/example.html in browser.
