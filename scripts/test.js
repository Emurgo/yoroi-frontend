const tasks = require('./tasks');
const createWebpackServer = require('webpack-httpolyglot-server');
const testConfig = require('../webpack/test.config');

tasks.replaceWebpack();
console.log('[Copy assets]');
console.log('-'.repeat(80));
tasks.copyAssets('dev');

console.log('[Webpack Test]');
createWebpackServer(testConfig, {
  host: 'localhost',
  port: 3000
});
