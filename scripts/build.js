// @flow

const tasks = require('./tasks');
const argv = require('minimist')(process.argv.slice(2));

// override NODE_ENV for ConfigWebpackPlugin
process.env.NODE_CONFIG_ENV = argv.env;
const isNightly = argv.nightly != null;

export function buildProd(env: string) {
  const shell = require('shelljs');

  console.log('[Build manifest]');
  console.log('-'.repeat(80));
  tasks.buildManifests(false, isNightly);

  console.log('[Copy assets]');
  console.log('-'.repeat(80));
  tasks.copyAssets('build', env);

  console.log('[Webpack Build]');
  console.log('-'.repeat(80));

  process.exit(shell.exec(`./node_modules/.bin/webpack --config webpack/prodConfig.js --progress --profile --colors --env.networkName=${argv.env} --env.nightly=${isNightly.toString()}`).code);
}

export function buildDev(env: string) {
  const connections = require('./connections');
  const createWebpackServer = require('webpack-httpolyglot-server');

  const config = require(`../webpack/devConfig`);

  console.log('[Build manifest]');
  console.log('-'.repeat(80));
  tasks.buildManifests(true, isNightly);

  console.log('[Copy assets]');
  console.log('-'.repeat(80));
  tasks.copyAssets('dev', env);

  console.log('[Webpack Dev]');
  console.log('-'.repeat(80));
  console.log('If you\'re developing Inject page,');
  console.log(`please allow 'https://localhost:${connections.Ports.WebpackDev}' connections in Google Chrome,`);
  console.log('and load unpacked extensions with `./dev` folder. (see https://developer.chrome.com/extensions/getstarted#unpacked)\n');
  createWebpackServer(config.baseDevConfig(argv.env, isNightly), {
    host: 'localhost',
    port: connections.Ports.WebpackDev
  });
}

if (argv.type === 'debug') {
  buildDev(argv.env);
} else if (argv.type === 'prod') {
  buildProd(argv.env);
} else {
  throw new Error(`Unknown type ${argv.type}`);
}
