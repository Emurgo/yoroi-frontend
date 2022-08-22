// @flow

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const tasks = require('./tasks');

const { baseDevConfig, backgroundServiceWorkerConfig } = require(`../webpack/devConfig`);
const { argv, shouldInjectConnector, isNightly, buildAndCopyInjector } = require('./utils');

// override NODE_ENV for ConfigWebpackPlugin
process.env.NODE_CONFIG_ENV = argv.env;

function devMainWindow(env: string) {
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

  const config = baseDevConfig(
    argv.env,
    isNightly,
    argv.ergoConnectorExtensionId,
    !shouldInjectConnector
  );

  const compiler = webpack(config);

  const server = new WebpackDevServer(config.devServer, compiler);
  server.start();
}

function devBackgroundServiceWorker() {
  const config = backgroundServiceWorkerConfig(
    argv.env,
    isNightly,
    argv.ergoConnectorExtensionId,
    !shouldInjectConnector
  );

  const compiler = webpack(config);

  const server = new WebpackDevServer(config.devServer, compiler);
  server.start();
}

if (argv._[0] === 'main') {
  devMainWindow(argv.env);
} else if (argv._[0] === 'background') {
  devBackgroundServiceWorker();
} else {
  console.error('unknown component');
  process.exit(1);
}

