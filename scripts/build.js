// @flow
const tasks = require('./tasks');
const argv = require('minimist')(process.argv.slice(2));
const shell = require('shelljs');

// ovrerride NODE_ENV for ConfigWebpackPlugin
process.env.NODE_CONFIG_ENV = argv.env;

tasks.replaceWebpack();

console.log('[Build manifest]');
console.log('-'.repeat(80));
tasks.buildManifests();

console.log('[Copy assets]');
console.log('-'.repeat(80));
tasks.copyAssets('build', argv.env);

console.log('[Webpack Build]');
console.log('-'.repeat(80));

process.exit(shell.exec(`./node_modules/.bin/webpack --config webpack/prodConfig.js --progress --profile --colors --env=${argv.env}`).code);
