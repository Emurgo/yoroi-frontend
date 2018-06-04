const createWebpackServer = require('webpack-httpolyglot-server');
const testConfig = require('../webpack/test.config');

console.log('[Webpack Test]');
createWebpackServer(testConfig, {
  host: 'localhost',
  port: 3000
});
