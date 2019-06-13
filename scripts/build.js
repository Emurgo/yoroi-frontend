const tasks = require('./tasks');
const argv = require('minimist')(process.argv.slice(2));

process.env.NODE_ENV = argv.env;

tasks.replaceWebpack();
console.log('[Copy assets]');
console.log('-'.repeat(80));
tasks.copyAssets('build', argv.env);

console.log('[Webpack Build]');
console.log('-'.repeat(80));

process.exit(exec(`./node_modules/.bin/webpack --config webpack/prodConfig.js --progress --profile --colors --env=${argv.env}`).code);
