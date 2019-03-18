# Building a release candidate

To create a release candidate you must compress a local build.

## Unsigned build

Zip files can be shared

```bash
# compress build folder to {manifest.name}.zip and crx
$ npm run build -- --env "${network}"
$ npm run compress -- --env "${network}" --zip-only --app-id "APP_ID" --codebase "https://www.sample.com/dw/yoroi-extension.crx"
```

## (Chrome) Signed build

Crx are compressed and signed chrome extension bundles

```bash
# compress build folder to {manifest.name}.zip and crx
$ npm run build -- --env "${network}"
$ npm run compress -- --env "${network}"  --zip-only --app-id "APP_ID" --codebase "https://www.sample.com/dw/yoroi-extension.crx" --key ./production-key.pem
```

Note: Chrome extensions [update automatically](https://developer.chrome.com/extensions/autoupdate)

## (Firefox) Signed build (XPI)

TODO: Firefox

# Deploying new version

Update the version number in `manifest` files and in `package.json`

**Note**: You must repeat these steps with the `network` changed for:
- `mainnet`
- `staging`
1) Create a new [release on Github](https://github.com/Emurgo/yoroi-frontend/releases/)
1) Upload to [Chrome store](https://chrome.google.com/webstore/developer/dashboard)