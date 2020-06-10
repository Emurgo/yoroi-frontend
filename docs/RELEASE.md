# Building a release candidate

To create a release candidate you must compress a local build.

See [BUILD.md](./BUILD.md) for how to build the code.

# Deploying new version

Update the version number in `chrome/constants.js` for the version you want to release.

1) Create a new [release on Github](https://github.com/Emurgo/yoroi-frontend/releases/)
1) Upload to [Chrome store](https://chrome.google.com/webstore/developer/dashboard)

## Yoroi Nightly

Yoroi Nightly builds are published automatically for any commit that bumps the version number. It can take some time (in my experience sometimes even 1-2 days) for the build to be distributed to users.

## (Chrome) Signed build

Upload the signed build to the [chrome webstore](https://chrome.google.com/webstore/).

Extension will [update automatically](https://developer.chrome.com/extensions/autoupdate) for users once uploaded.

## (Firefox) Signed build (XPI)

The same steps as Chrome also produce an `xpi` file. You can upload this directly to the [EMURGO AMO account](https://addons.mozilla.org/en-US/firefox/user/14971548/). Extension will update automatically for users once uploaded.
