const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const tasks = require('./tasks');
const { baseDevConfig, backgroundServiceWorkerConfig } = require(`../webpack/devConfig`);
const { argv, shouldInjectConnector, isNightly, buildAndCopyInjector } = require('./utils');

// override NODE_ENV for ConfigWebpackPlugin
process.env.NODE_CONFIG_ENV = argv.env;

function devMainWindow(env: string) {
  /*
  console.log('[Build manifest]');
  console.log('-'.repeat(80));
  tasks.buildManifests(true, isNightly, shouldInjectConnector);

  console.log('[Copy assets]');
  console.log('-'.repeat(80));
  tasks.copyAssets('dev', env);
  */
  buildAndCopyInjector('dev/js', 'dev');
}

devMainWindow(argv.env);
