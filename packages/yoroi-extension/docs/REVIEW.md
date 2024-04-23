# Reviewing Yoroi

Hello, and thank you for reviewing Yoroi for your platform!

### Finding version commit you're testing

You should be able to find the exact release you're reviewing in the [RELEASE](https://github.com/Emurgo/yoroi-frontend/releases) tab.

If you want to know the exact version & commit used for the build you've received, you can find it inside the settings page.

![image](https://user-images.githubusercontent.com/2608559/84115683-6d48d880-aa69-11ea-92b3-f36954f1227f.png)

### How to do I get an account for review purposes?

Yoroi connects to network(s) called "blockchains". These blockchains are decentralized networks that we have no control over. Wallets are just a way for users to easily view and manage assets their own on the network. That means there is no way to "credit" a tester account for you.

You can:

- create or restore a wallet on our software (does not require any money or personal information. All generated data never leaves your computer)

- ask us to send you a small amount of funds / share with you a wallet with a small amount of funds to test with (again, these are real assets on the network so we cannot easily share any non-trivial amount). Although even this only gives you limited access because we cannot send you all possible combinations, nor can we physically send you "hardware wallets".

We cannot:

- generate any "god-mode" or unlimited fund account for you to test with

### Building the code

Make sure you checked out the exact commit for the version you're testing. Keep in mind builds may differ slightly in the following way:

1) Information like commit number, branch name, etc. are stored inside builds.
1) Some tooling like nodejs's buffer library saves your user path inside the build information (ex: `C:/github/yoroi`)

However, overall the build should match exactly.

#### Setting it up on your machine (recommended)

If you want to build the code on your machine, you should be able to follow the regular project setup and build steps outlined in the repository's main readme.

#### Building with docker

Docker is a tool that allows you to setup a virtual environment inside your computer. You can use this tool to setup an environment that replicate the environment we use for our automated CI builds.

You can find download instructions for Docker [here](https://docs.docker.com/get-docker/)

```
# go to exact commit that was released to Firefox & Chrome
git checkout insert-commit-or-version-number-here

# Setup CI environment that will be used to build
nvm use
npm run localci:setup
npm run localci:newbuild

# Enter CI environment docker image
docker exec -it yoroi_ci /bin/bash
cd yoroi/

# generate mock keys (from SETUP.md)
npm run keygen
mv key.pem production-key.pem
npm run keygen
mv key.pem shelley-production.pem

# Install correct nodejs version inside docker image

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
nvm install
npm install

# build

npm run prod:stable
```

If you need to access the build from your host machine, you can use the following command to copy the build folder out of the docker container and into your host machine. (**note**: you must run this command from the host machine and not from inside the docker image)
```
docker cp yoroi_ci:/yoroi/build ./build
```

### Other FAQ

**Q**: Who can use the hardware wallet? Is it accessible to every user? What are the requirements to be able to use it? \
**A**: Hardware wallets are sold by independent companies -- Satoshi Labs (Trezor) and Ledger (Ledger device). Their products are not just for Yoroi, but work for cryptocurrency wallets in general as long as they provide the integration. They're meant to increase the security of the user by managing their private key inside a physical device instead of on a computer

**Q**: Why does Yoroi make requests to a remote endpoint like "history" and "filterUsed" \
**A**: Yoroi is what you call a "light" (or sometimes "lite") wallet -- that means that instead of storing the entire blockchain, it queries a server for your account balance. We have an article that gives an overview of the security features of Yoroi here: https://medium.com/emurgo-announcement/yoroi-wallet-security-a42aafa79525
As I mentioned previously, all transaction history in the blockchain is publicly visible. Our extensions just fetches the subset of this data relevant to them through this remote endpoint.
