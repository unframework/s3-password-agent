# S3 Link Agent

S3 link agent: password protect S3 download links for static sites like GitHub Pages. No extra generator plugins needed.

Configure and deploy this Node server to a free Heroku instance. The server provides a JS widget: include it in your static site. That's it.

* user visits your site, clicks on the download link and is directed to the Heroku server
* Heroku server asks user for email + PIN
* Heroku server signs a temporary private S3 link and returns a 302 redirect

Content whitelist - `content.yaml` - is a list of allowed downloadable bucket paths:

```yaml
- myfile1.png
- some/other/file2.pdf
- example*.*
```

User list - `users.yaml` - is a list of allowed emails with their PINs:

```yaml
user1@example.com:
    pin: 1234
user2@example.com:
    pin: 01134
```

**SECURITY WARNING:** please do not use this for anything with real security needs. PINs are restricted to only being numeric, to discourage any real passwords being used. These PINs are stored in plaintext, committed to your local repo clone and pushed to Heroku, so anyone who can read the repo source code can read the PINs and gain access to the whitelisted files.

Required Heroku configuration variables (do not commit these into the repo!):

- AWS key ID and secret: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- AWS bucket: `S3_BUCKET`

Setting up download links from your webpages:

* either point download links directly at `http://<heroku-server>/go/<your-file-path>`
* or add the widget script `http://<heroku-server>/s3-link-agent.js` and then point links to `#s3/<your-file-path>`

That's it.

## Development

```sh
cat <<EOF > test-env.sh
export PORT=3020 # for testing only
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

## To Do

- glob matching on file path whitelist
