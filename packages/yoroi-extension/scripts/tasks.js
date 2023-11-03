// @flow
import { rm, mkdir, cp } from 'shelljs';
import { NetworkType } from '../config/config-types';
import type { Network } from '../config/config-types';
import { values } from 'lodash';
import fs from 'fs';
import path from 'path';
import { overrideForNightly } from '../chrome/manifest.template';

export const copyAssets = (type: string, env: string) => {
  rm('-rf', type);
  mkdir(type);
  mkdir(`${type}/js`);
  cp(`chrome/manifest.${env}.json`, `${type}/manifest.json`);
  cp('-R', 'chrome/assets/*', type);
  cp('chrome/content-scripts/3rd-party-trezor/*.js', `${type}/js/`);
  cp('chrome/content-scripts/3rd-party-trezor/trezor-usb-permissions.html', `${type}/`);
};

const buildManifest = (
  type: Network,
  isDebug: boolean,
  isNightly: boolean,
  shouldInjectConnector: boolean,
) => {
  const genManifestContent = require(`../chrome/manifest.${type}`);
  let manifestContent = genManifestContent(isDebug, shouldInjectConnector);
  if (isNightly) {
    manifestContent = overrideForNightly(manifestContent);
  }
  const manifestContentJSON = JSON.stringify(manifestContent, null, 4);

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

export const buildManifests = (
  isDebug: boolean,
  isNightly: boolean,
  shouldInjectConnector: boolean
) => {
  manifestTypes.forEach((type) => {
    buildManifest(type, isDebug, isNightly, shouldInjectConnector);
  });
};
