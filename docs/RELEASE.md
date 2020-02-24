# Building a release candidate

To create a release candidate you must compress a local build.

## Unsigned build

Zip files can be shared

```bash
# compress build folder to {manifest.name}.zip
# if CARDANO_NETWORK is not provided, it defaults to "testnet"
$ CARDANO_NETWORK=mainnet npm run prod:unsigned
```

## (Chrome) Signed build

Crx are compressed and signed chrome extension bundles

```bash
# compress build folder to {manifest.name}.zip and crx
$ npm run prod:byron
```

Note: Chrome extensions [update automatically](https://developer.chrome.com/extensions/autoupdate)

## (Firefox) Signed build (XPI)

The same steps as Chrome also produce an `xpi` file. You can upload this directly to the [EMURGO AMO account](https://addons.mozilla.org/en-US/firefox/user/14971548/)

# Deploying new version

Update the version number in `manifest` files and in `package.json`

**Note**: You must repeat these steps with the `network` changed for:
- `mainnet`
- `staging`
1) Create a new [release on Github](https://github.com/Emurgo/yoroi-frontend/releases/)
1) Upload to [Chrome store](https://chrome.google.com/webstore/developer/dashboard)
