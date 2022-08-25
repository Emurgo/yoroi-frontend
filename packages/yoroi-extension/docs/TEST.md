# Tests

### Static analysis

```bash
npm run flow
npm run eslint
```

### Unit tests

We use Jest for unittests.

```bash
npm run jest
```

### E2E tests

Our end-to-end testing uses Selenium + Cucumber

You **must** run `npm run test:build` **before** running the tests!

`test:build` will *BUILD* the extension and then the tests will *LOAD* the extension.

Rerun `test:build` anytime you make changes to the application itself. If you only change test files, you do not need to rerun it.

```bash
# features (command to run all existing tests)
npm run test:run:e2e:chrome

# How to run one .feature file
npm run test:run:feature:chrome features/wallet-creation.feature

# How to run one test
npm run test:run:tag:chrome @it-10
```

### Trezor Emulator E2E tests

To be able to execute the test on Trezor locally you will need to prepare and run the emulator. To do so:

```bash
# Clone the trezor-usr-env
git clone https://github.com/trezor/trezor-user-env.git
cd trezor-user-env

# Install nix-shell
sudo apt update
sudo apt -y install nix-bin

# Download firmware
sudo ./src/binaries/firmware/bin/download.sh

# Download trezord-go
sudo ./src/binaries/trezord-go/bin/download.sh

# Copy the v2-master firmware to the root of the project
cp -rf src/binaries/firmware/bin/trezor-emu-core-v2-master ./

# Copy the trezord-go-v2.0.31 to the root of the project
cp -rf src/binaries/trezord-go/bin/trezord-go-v2.0.31 ./

# Create the logs folder in the root of the trezor-user-env
mkdir logs

# Run the trezor user environment
sudo docker run -p 9001:9001 -p 9002:9002 -p 21326:21326 -p 127.0.0.1:21325:21326 -p 21324:21324 -v logs:/trezor-user-env/logs/screens -v trezor-emu-core-v2-master:/trezor-user-env/src/binaries/firmware/bin/user_downloaded -v trezord-go-v2.0.31:/trezor-user-env/src/binaries/trezord-go/bin -d emurgornd/trezor-user-env:latest
```

### Create Html Reports

After executing the above commands to run tests, cucumber-html-reporter can be used to create html reports.

```bash
# How to create html reports after a test run
node reportGenerator.js
```

### Storybook

You can easily inspect the whole UI by running Storybook. It is useful for developing also because it supports hot-reload.

```bash
npm run storybook:watch
```

The Storybook is uploaded to this URL: https://yoroi-extension-storybook.netlify.com/

To update the build used by the URL, you can run `npm run storybook:publish`
