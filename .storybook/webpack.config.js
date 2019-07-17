const path = require('path');
// your app's webpack.config.js
const custom = require('../webpack/devConfig');

module.exports = async ({ config, mode }) => {
  const customConfig = custom.baseDevConfig();
  return { ...config, module: { ...config.module, rules: customConfig.module.rules } };
};