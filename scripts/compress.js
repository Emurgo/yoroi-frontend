// @flow

// add package-specific dependencies
module.paths.unshift(`${process.cwd()}/node_modules`);

const fs = require('fs');
const path = require('path');
const ChromeExtension = require('crx');
const { utfToBytes } = require('../packages/yoroi-extension/app/coreUtils');
const argv = require('minimist')(process.argv.slice(2));
/* eslint import/no-unresolved: 0 */

// Ignore FlowLint telling you to delete this. CI needs it
// $FlowExpectedError[cannot-resolve-module] build-time generated file so Flow fails to find it
const name = require(path.join(process.cwd(), '/build/manifest.json')).name;

function readKeyFromFile(keyPath) {
  if (!fs.existsSync(keyPath)) {
    throw new Error(`Key not found at ${keyPath}`);
  }
  return fs.readFileSync(keyPath);
}

function getPrivateKey() {
  if (argv.key == null) return null;
  if (argv.key.startsWith('./')) {
    return readKeyFromFile(argv.key);
  }
  return utfToBytes(argv.key);
}

const privateKey = getPrivateKey();
const zipOnly = argv['zip-only'];
const isCrx = !zipOnly;

if (!argv.codebase) {
  console.error('Missing codebase param.');
  process.exit();
}

const crx = new ChromeExtension({
  appId: argv['app-id'],
  codebase: argv.codebase,
  version: 3,
  privateKey,
});

async function compress(isCrxBuild) {
  await crx.load(path.join(process.cwd(), '/build'));
  const archiveBuffer = await crx.loadContents();
  fs.writeFileSync(`${name}.zip`, archiveBuffer);

  // xpi files are used for Firefox and are simply a renaming of zip
  fs.copyFile(
    `${name}.zip`,
    `${name}.xpi`,
    0, // flag
    (err) => {
      if (err) throw err;
    }
  );
  if (isCrxBuild) {
    const crxBuffer = await crx.pack(archiveBuffer);
    // const updateXML = crx.generateUpdateXML();
    // fs.writeFileSync('update.xml', updateXML);
    fs.writeFileSync(`${name}-${argv.env}.crx`, crxBuffer);
    fs.unlinkSync(`${name}.zip`);
  }
}

compress(isCrx).catch(err => console.error(err));
