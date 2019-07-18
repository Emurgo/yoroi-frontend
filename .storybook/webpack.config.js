const path = require('path');
// your app's webpack.config.js
const custom = require('../webpack/devConfig');

module.exports = async ({ config, mode }) => {
  const customConfig = custom.baseDevConfig();
  const finalConfig = {
    ...config,
    module: { ...config.module, rules: customConfig.module.rules }
  };

  finalConfig.module.rules.push({
    test: /\.stories\.jsx?$/,
    loaders: [require.resolve('@storybook/addon-storysource/loader')],
    enforce: 'pre',
  });

  return finalConfig;
};