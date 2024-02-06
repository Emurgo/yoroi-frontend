// @flow

const tasks = require('./tasks');
const connections = require('./connections');

const createWebpackServer = require('webpack-httpolyglot-server');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const ENV = 'test';

const config = require(`../webpack/devConfig`);
process.env.NODE_CONFIG_ENV = ENV;

console.log('[Build manifest]');
console.log('-'.repeat(80));
tasks.buildManifests(true, false, true);

console.log('[Copy assets]');
console.log('-'.repeat(80));
tasks.copyAssets('dev', ENV);

console.log('[Webpack Dev]');
console.log('-'.repeat(80));
console.log('If you\'re developing Inject page,');
console.log(`please allow 'https://localhost:${connections.Ports.WebpackDev}' connections in Google Chrome,`);
console.log('and load unpacked extensions with `./dev` folder. (see https://developer.chrome.com/extensions/getstarted#unpacked)\n');

// mock backend script runs the same babel for compiling the server as for compiling the website
// this is problematic because we need the nodejs version of the WASM bindings for the server
// we hack it by just loading the nodejs versions here and swapping it into the variables
const { RustModule } = require('../app/api/ada/lib/cardanoCrypto/rustLoader');
const wasmv2 = require('cardano-wallet');
const wasmv4 = require('@emurgo/cardano-serialization-lib-nodejs/cardano_serialization_lib');

RustModule._wasmv2 = wasmv2;
// $FlowExpectedError[incompatible-type] nodejs & browser API have same interface so it's okay
RustModule._wasmv4 = wasmv4;

const { getMockServer } = require('../features/mock-chain/mockCardanoServer');
const { MockChain, resetChain } = require('../features/mock-chain/mockCardanoImporter');

getMockServer({ outputLog: true });
resetChain(MockChain.Standard);

createWebpackServer(
  config.baseDevConfig(ENV, false, undefined),
  webpack,
  webpackDevMiddleware,
  webpackHotMiddleware,
  {
    host: 'localhost',
    port: connections.Ports.WebpackDev,
  }
);
