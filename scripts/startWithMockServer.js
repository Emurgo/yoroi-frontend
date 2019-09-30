// @flow
const { getMockServer } = require('../features/mock-chain/mockServer');
const { resetChain } = require('../features/mock-chain/mockImporter');

getMockServer({ outputLog: true });
resetChain();

const tasks = require('./tasks');

const createWebpackServer = require('webpack-httpolyglot-server');

const ENV = 'test';

const config = require(`../webpack/devConfig`);
process.env.NODE_CONFIG_ENV = ENV;

tasks.replaceWebpack();

console.log('[Build manifest]');
console.log('-'.repeat(80));
tasks.buildManifests();

console.log('[Copy assets]');
console.log('-'.repeat(80));
tasks.copyAssets('dev', ENV);

console.log('[Webpack Dev]');
console.log('-'.repeat(80));
console.log('If you\'re developing Inject page,');
console.log('please allow `https://localhost:3000` connections in Google Chrome,');
console.log('and load unpacked extensions with `./dev` folder. (see https://developer.chrome.com/extensions/getstarted#unpacked)\n');

createWebpackServer(config.baseDevConfig(ENV), {
  host: 'localhost',
  port: 3000
});
