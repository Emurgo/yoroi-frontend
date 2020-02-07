// @flow
import { rm, mkdir, cp } from 'shelljs';
import { NetworkType } from '../config/config-types';
import type { Network } from '../config/config-types';
import { values } from 'lodash';
import fs from 'fs';
import path from 'path';

exports.replaceWebpack = () => {
  const replaceTasks = [{
    from: 'webpack/replace/JsonpMainTemplate.runtime.js',
    to: 'node_modules/webpack/lib/JsonpMainTemplate.runtime.js'
  }, {
    from: 'webpack/replace/process-update.js',
    to: 'node_modules/webpack-hot-middleware/process-update.js'
  }];

  replaceTasks.forEach(task => cp(task.from, task.to));
};

exports.copyAssets = (type: string, env: string) => {
  rm('-rf', type);
  mkdir(type);
  mkdir(`${type}/js`);
  cp(`chrome/manifest.${env}.json`, `${type}/manifest.json`);
  cp('-R', 'chrome/assets/*', type);
  cp('chrome/content-scripts/3rd-party-trezor/*.js', `${type}/js/`);
  cp('chrome/content-scripts/3rd-party-trezor/trezor-usb-permissions.html', `${type}/`);
  cp('chrome/content-scripts/ledger/*.js', `${type}/js/`);
};

const buildManifest = (type: Network, isDebug: boolean) => {
  const genManifestContent = require(`../chrome/manifest.${type}`);
  const manifestContentJSON = JSON.stringify(genManifestContent(isDebug), null, 4);

  const OUTPUT_FILE_NAME = `manifest.${type}.json`;
  const manifestDestPath = path.resolve(`${__dirname}/../chrome`, OUTPUT_FILE_NAME);

  try {
    fs.writeFileSync(manifestDestPath, manifestContentJSON);
    console.log(`File ${OUTPUT_FILE_NAME} has been created`);
  } catch (err) {
    console.error(err);
  }
};

const manifestTypes = values(NetworkType);
exports.buildManifests = (isDebug: boolean) => {
  manifestTypes.map((type) => buildManifest(type, isDebug));
};
