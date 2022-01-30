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

### Create Html Reports
After executing the above commands to run tests, cucumber-html-reporter can be used to create html reports.
````bash
# How to create html reports after a test run
node reportGenerator.js
````

### Storybook

You can easily inspect the whole UI by running Storybook. It is useful for developing also because it supports hot-reload.

```bash
npm run storybook:watch
```

The Storybook is uploaded to this URL: https://yoroi-extension-storybook.netlify.com/

To update the build used by the URL, you can run `npm run storybook:publish`
