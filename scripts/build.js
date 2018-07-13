const tasks = require('./tasks');
const argv = require('minimist')(process.argv.slice(2));

tasks.replaceWebpack();
console.log('[Copy assets]');
console.log('-'.repeat(80));
tasks.copyAssets('build', argv.env);

console.log('[Webpack Build]');
console.log('-'.repeat(80));

exec(`webpack --config webpack/${argv.env}.config.js --progress --profile --colors`);
