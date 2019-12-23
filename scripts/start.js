// @flow
const tasks = require('./tasks');
const connections = require('./connections');
const createWebpackServer = require('webpack-httpolyglot-server');

const argv = require('minimist')(process.argv.slice(2));

const config = require(`../webpack/devConfig`);

process.env.NODE_CONFIG_ENV = argv.env;

tasks.replaceWebpack();

console.log('[Build manifest]');
console.log('-'.repeat(80));
tasks.buildManifests();

console.log('[Copy assets]');
console.log('-'.repeat(80));
tasks.copyAssets('dev', argv.env);

console.log('[Webpack Dev]');
console.log('-'.repeat(80));
console.log('If you\'re developing Inject page,');
console.log(`please allow 'https://localhost:${connections.Ports.WebpackDev}' connections in Google Chrome,`);
console.log('and load unpacked extensions with `./dev` folder. (see https://developer.chrome.com/extensions/getstarted#unpacked)\n');
createWebpackServer(config.baseDevConfig(argv.env), {
  host: 'localhost',
  port: connections.Ports.WebpackDev
});
