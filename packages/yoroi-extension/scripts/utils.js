// @flow

const fs = require('fs');
const shell = require('shelljs');
const argv: Object = require('minimist')(process.argv.slice(2));
const { injectedScripts } = require('../chrome/constants');

const shouldInjectConnector: boolean = argv.dontInjectConnector === undefined;
const isNightly: boolean = argv.nightly != null;

const exec: string => void = cmd => {
  const r = shell.exec(cmd);
  if (r.code !== 0) {
    process.exit(r);
  }
};

const buildAndCopyInjector: (string, string) => void = (destDir, buildType) => {
  console.log('[Build injector]');
  console.log('-'.repeat(80));

  let injectScript: string;
  try {
    const data = fs.readFileSync(`${__dirname}/../chrome/content-scripts/inject.js`);
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
  for (const script of injectedScripts) {
    shell.cp(`${__dirname}/../chrome/content-scripts/${script}`, destDir);
  }
};

module.exports = { exec, argv, shouldInjectConnector, isNightly, buildAndCopyInjector };
