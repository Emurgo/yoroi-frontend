// @flow
/* eslint-disable  import/no-unused-modules */

const fs = require('fs');
const shell = require('shelljs');
const tasks = require('./tasks');
const argv = require('minimist')(process.argv.slice(2));
const { buildAndCopyInjector } = require('../scripts/utils');

const exec = cmd => {
  const r = shell.exec(cmd);
  if (r.code !== 0) {
    process.exit(r);
  }
};

// override NODE_ENV for ConfigWebpackPlugin
process.env.NODE_CONFIG_ENV = argv.env;
// this is hack to prevent `config` from loading `test.json` when the host name is "test"
process.env.HOST = 'no such named config file';
const isNightly = argv.nightly != null;
const shouldInjectConnector = argv.dontInjectConnector === undefined;

export function buildProd(env: string) {
  console.log('[Build manifest]');
  console.log('-'.repeat(80));
  tasks.buildManifests(false, isNightly, shouldInjectConnector);

  console.log('[Copy assets]', env);
  console.log('-'.repeat(80));
  tasks.copyAssets('build', env);

  console.log('[Webpack Build]');
  console.log('-'.repeat(80));

  exec(`npx webpack --config webpack-mv2/prodConfig.js --progress --profile --color --env networkName=${argv.env} --env nightly=${isNightly.toString()} --env isLight=${(!shouldInjectConnector).toString()}`);

  if (shouldInjectConnector) {
    buildAndCopyInjector('build/js', isNightly ? 'nightly' : 'prod');
  }
}

export function buildDev(env: string) {
  const connections = require('./connections');
  const createWebpackServer = require('webpack-httpolyglot-server');
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');

  const path = require('path');

  const config = require(`../webpack-mv2/devConfig`);

  console.log('[Build manifest]');
  console.log('-'.repeat(80));
  tasks.buildManifests(true, isNightly, shouldInjectConnector);

  console.log('[Copy assets]');
  console.log('-'.repeat(80));
  tasks.copyAssets('dev', env);

  if (shouldInjectConnector) {
    buildAndCopyInjector('dev/js', 'dev');
  }

  console.log('[Webpack Dev]');
  console.log('-'.repeat(80));
  console.log('Please load unpacked extensions with `./dev` folder. (see https://developer.chrome.com/extensions/getstarted#unpacked)\n');

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
      !shouldInjectConnector
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
