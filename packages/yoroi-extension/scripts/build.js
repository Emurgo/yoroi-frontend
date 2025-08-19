// @flow

const tasks = require('./tasks');
const {
  exec, argv, shouldInjectConnector,
  isNightly, isE2E, buildAndCopyInjector,
} = require('./utils');

// override NODE_ENV for ConfigWebpackPlugin
process.env.NODE_CONFIG_ENV = argv.env;

function buildProd(env: string) {
  console.log('[Build manifest]');
  console.log('-'.repeat(80));
  tasks.buildManifests(false, isNightly, shouldInjectConnector);

  console.log('[Copy assets]', env);
  console.log('-'.repeat(80));
  tasks.copyAssets('build', env);

  console.log('[Webpack Build]');
  console.log('-'.repeat(80));

  // Here I can read OS var and will have 4 different env vars
  exec(`npx webpack --config webpack/prodConfig.js --progress --profile --color --env networkName=${argv.env} --env nightly=${isNightly.toString()} --env isLight=${(!shouldInjectConnector).toString()} --env isE2E=${isE2E.toString()} --env testMode=https://preprod-backend.yoroiwallet.com`);

  if (shouldInjectConnector) {
    buildAndCopyInjector('build/js', isNightly ? 'nightly' : 'prod');
  }
}

buildProd(argv.env);
