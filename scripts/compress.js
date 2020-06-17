// @flow
const fs = require('fs');
const path = require('path');
const ChromeExtension = require('crx');
const argv = require('minimist')(process.argv.slice(2));
/* eslint import/no-unresolved: 0 */

// Ignore FlowLint telling you to delete this. CI needs it
// $FlowExpectedError[cannot-resolve-module] build-time generated file so Flow fails to find it
const name = require('../build/manifest.json').name;

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
  return Buffer.from(argv.key, 'utf-8');
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
  await crx.load(path.join(__dirname, '../build'));
  const archiveBuffer = await crx.loadContents();
  fs.writeFileSync(`${name}.zip`, archiveBuffer);

  // xpi files are used for Firefox and are simply a renaming of zip
  /** Reusing the same manifest for Chrome and Firefox is not supported by Selenium
   * Notably, Chrome rejects Firefox extension IDs in the manifest but Selenium requires them
   * We fix this by forking the repository and implementing the capability ourselves
   * We can switch back to the selenium-webdriver package once the following is on npm
   * https://github.com/SeleniumHQ/selenium/pull/6787
   */
  fs.copyFile(
    `${name}.zip`,
    `${name}-${argv.env}.xpi`,
    0, // flag
    (err) => {
      if (err) throw err;
    }
  );
  if (isCrxBuild) {
    const crxBuffer = await crx.pack(archiveBuffer);
    const updateXML = crx.generateUpdateXML();
    fs.writeFileSync('update.xml', updateXML);
    fs.writeFileSync(`${name}-${argv.env}.crx`, crxBuffer);
    fs.unlinkSync(`${name}.zip`);
  }
}

compress(isCrx).catch(err => console.error(err));
