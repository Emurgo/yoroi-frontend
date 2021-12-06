// @flow

const shell = require('shelljs');
const tasks = require('./tasks');
const argv = require('minimist')(process.argv.slice(2));

const exec = cmd => {
  const r = shell.exec(cmd);
  if (r.code !== 0) {
    process.exit(r);
  }
};

// override NODE_ENV for ConfigWebpackPlugin
process.env.NODE_CONFIG_ENV = argv.env;
const isNightly = argv.nightly != null;
const shouldInjectConnector = argv.dontInjectConnector === undefined;

const buildAndCopyInjector = (destDir: string) => {
  console.log('[Build injector]');
  console.log('-'.repeat(80));
  shell.pushd('../yoroi-ergo-connector')
  exec('npm run prod:custom -- --yoroiExtensionId=self');
  shell.popd();
  shell.cp('../yoroi-ergo-connector/build/inject.js', destDir);
};

export function buildProd(env: string) {
  console.log('[Build manifest]');
  console.log('-'.repeat(80));
  tasks.buildManifests(false, isNightly, shouldInjectConnector);

  console.log('[Copy assets]');
  console.log('-'.repeat(80));
  tasks.copyAssets('build', env);

  console.log('[Webpack Build]');
  console.log('-'.repeat(80));

  exec(`npx webpack --config webpack/prodConfig.js --progress --profile --color --env networkName=${argv.env} --env nightly=${isNightly.toString()}`);

  if (shouldInjectConnector) {
    buildAndCopyInjector('build/js');
  }
}

export function buildDev(env: string) {
  const connections = require('./connections');
  const createWebpackServer = require('webpack-httpolyglot-server');
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');

  const path = require('path');
  const fs = require('fs');

  const config = require(`../webpack/devConfig`);

  console.log('[Build manifest]');
  console.log('-'.repeat(80));
  tasks.buildManifests(true, isNightly, shouldInjectConnector);

  console.log('[Copy assets]');
  console.log('-'.repeat(80));
  tasks.copyAssets('dev', env);

  if (shouldInjectConnector) {
    buildAndCopyInjector('dev/js');
  }

  console.log('[Webpack Dev]');
  console.log('-'.repeat(80));
  console.log('If you\'re developing Inject page,');
  console.log(`please allow 'https://localhost:${connections.Ports.WebpackDev}' connections in Google Chrome,`);
  console.log('and load unpacked extensions with `./dev` folder. (see https://developer.chrome.com/extensions/getstarted#unpacked)\n');

  const serverOpts: any = {
    host: 'localhost',
    port: connections.Ports.WebpackDev
  };

  if (argv.type === 'debug') {
    const sslOverridesPath = path.join(__dirname, './sslOverrides.js');
    if (fs.existsSync(sslOverridesPath)) {
      const sslOverrides = require(sslOverridesPath);
      serverOpts.key = sslOverrides.key;
      serverOpts.cert = sslOverrides.cert;
    }
  }

  createWebpackServer(
    config.baseDevConfig(
      argv.env,
      isNightly,
      argv.ergoConnectorExtensionId
    ),
    webpack,
    webpackDevMiddleware,
    webpackHotMiddleware,
    serverOpts
  );
}

if (argv.type === 'debug') {
  buildDev(argv.env);
} else if (argv.type === 'prod') {
  buildProd(argv.env);
} else {
  throw new Error(`Unknown type ${argv.type}`);
}
