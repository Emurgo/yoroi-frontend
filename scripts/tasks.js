// @flow
import { rm, mkdir, cp } from 'shelljs';

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
  cp('chrome/3rd-party/trezor/*.js', `${type}/js/`);
  cp('chrome/3rd-party/trezor/trezor-usb-permissions.html', `${type}/`);
};
