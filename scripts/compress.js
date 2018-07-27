const fs = require('fs');
const path = require('path');
const ChromeExtension = require('crx');
const argv = require('minimist')(process.argv.slice(2));
/* eslint import/no-unresolved: 0 */
const name = require('../build/manifest.json').name;

const keyPath = argv.key;
const existsKey = fs.existsSync(keyPath);
const zipOnly = argv['zip-only'];
const isCrx = !zipOnly;

if (!argv.codebase || (isCrx && !existsKey)) {
  console.error('Missing input data.');
  return;
}

const crx = new ChromeExtension({
  appId: argv['app-id'],
  codebase: argv.codebase,
  privateKey: existsKey
    ? fs.readFileSync(keyPath)
    : null
});

async function compress(isCrxBuild) {
  await crx.load(path.join(__dirname, '../build'));
  const archiveBuffer = await crx.loadContents();
  fs.writeFileSync(`${name}.zip`, archiveBuffer);
  if (isCrxBuild) {
    const crxBuffer = await crx.pack(archiveBuffer);
    const updateXML = crx.generateUpdateXML();
    fs.writeFileSync('update.xml', updateXML);
    fs.writeFileSync(`${name}-${argv.env}.crx`, crxBuffer);
    fs.unlinkSync(`${name}.zip`);
  }
}

compress(isCrx).catch(err => console.error(err));
