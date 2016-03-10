# S3 Link Agent

S3 link agent: password protect S3 download links for static sites like GitHub Pages. No extra generator plugins needed.

Configure and deploy this Node server to a free Heroku instance. The server provides a JS widget: include it in your static site. That's it.

* user visits your site, clicks on the download link and is directed to the Heroku server
* Heroku server asks user for email + PIN
* Heroku server signs a temporary private S3 link and returns a 302 redirect

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
