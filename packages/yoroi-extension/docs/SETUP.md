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
