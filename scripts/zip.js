const tasks = require('./tasks');
const argv = require('minimist')(process.argv.slice(2));

const env = argv.env || 'mainnet';
const zipName = argv.name || 'Yoroi-Build';

console.log('[Building the project]');
console.log('-'.repeat(80));

exec(`npm run build -- --env "${env}"`);

console.log('[Applying name]');
console.log('-'.repeat(80));

exec(`mv build ${zipName}`);

console.log('[Zipping]');
console.log('-'.repeat(80));

exec(`zip -r ${zipName}.zip ${zipName}/`);

console.log('[Cleaning]');
console.log('-'.repeat(80));

exec(`mv ${zipName} build`);