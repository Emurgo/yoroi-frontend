# Environment

Tested on Ubuntu 18.04, Windows 10

# Prerequisites
### Windows 10
- Node 14 (check [nvm-windows](https://github.com/coreybutler/nvm-windows)
-- ``` nvm install 14 ```
-- ``` nvm use 14 ```
- Python 2.7.17 (check [pyenv-win](https://github.com/pyenv-win/pyenv-win))
-- ``` pyenv install 2.7.17 ```
-- ``` pyenv global 2.7.17 ```

### Packages
To install other Yoroi-frontend related dependencies use:
```bash
npm install
```

### Generating PEMs

To build production versions of Yoroi, you need a `pem` file (basically a key to sign the extension).
Although the real `pem` is not uploaded to Github for security reasons, you can generate your own `pem` for testing purposes using the following steps:

```
npm run keygen
mv key.pem pem_name_here.pem
```

Notably, I recommend running this for `production-key.pem` and `nightly-key.pem` (but you can look at the `npm` command to see the expected pem name for a build type)

### Firefox

Adding unsigned extensions is not supported for the regular version of Firefox.
You can test Yoroi as a temporary extension, but the extension will disappear every time you close your browser.
To avoid this, we recommend the following:
1) [Setting up Firefox-dev](https://askubuntu.com/questions/548003/how-do-i-install-the-firefox-developer-edition) (note that the Aurora PPA has been deprecated, so you might want to try another installation method).
2) Setting `xpinstall.signatures.required` to `false` in `about:config`.
3) Make sure typing `firefox` in your terminal opens firefox-dev or set the path of the binary using `setBinary(path)` in `firefox.Options()` in webdriver.js (otherwise the unittests will not pass).
