const fs = require('fs');
const shell = require('shelljs');
const argv = require('minimist')(process.argv.slice(2));

const shouldInjectConnector = argv.dontInjectConnector === undefined;
const isNightly = argv.nightly != null;

const exec = cmd => {
  const r = shell.exec(cmd);
  if (r.code !== 0) {
    process.exit(r);
  }
};

const buildAndCopyInjector = (destDir: string, buildType: string) => {
  console.log('[Build injector]');
  console.log('-'.repeat(80));
  shell.pushd('../yoroi-ergo-connector')
  exec('npm run prod:custom -- --yoroiExtensionId=self');
  shell.popd();
  let injectScript: string;
  try {
    const data = fs.readFileSync('../yoroi-ergo-connector/build/inject.js');
    injectScript = Buffer.from(data).toString('utf-8');
  } catch (e) {
    console.error('Failed to read the connector inject script!', e);
    throw e;
  }
  try {
    const fixedInjectScript = injectScript.replace('$YOROI_BUILD_TYPE_ENV$', buildType);
    fs.writeFileSync(`${destDir}/inject.js`, fixedInjectScript);
  } catch (e) {
    console.error('Failed to write the fixed connector inject script!', e);
    throw e;
  }
};

module.exports = { exec, argv, shouldInjectConnector, isNightly, buildAndCopyInjector };
