# Building a release candidate

To create a release candidate you must compress a local build.

## Unsigned build (zip)

Zip files can be shared

```bash
# compress build folder to {manifest.name}.zip and crx
$ npm run build -- --env "${network}"
$ npm run compress -- --env "${network}" --zip-only --app-id "APP_ID" --codebase "https://www.sample.com/dw/yoroi-extension.crx"
```

## Signed build (CRX)

Crx are compressed and signed chrome extension bundles

```bash
# compress build folder to {manifest.name}.zip and crx
$ npm run build -- --env "${network}"
$ npm run compress -- --env "${network}" --app-id "APP_ID" --codebase "https://www.sample.com/dw/yoroi-extension.crx" --key ./production-key.pem
```

Note: Chrome extensions [update automatically](https://developer.chrome.com/extensions/autoupdate)