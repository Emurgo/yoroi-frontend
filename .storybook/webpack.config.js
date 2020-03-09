const path = require('path');
const webpack = require('webpack');
const ConfigWebpackPlugin = require('config-webpack');

// your app's webpack.config.js
const custom = require('../webpack/devConfig');
const commonConfig = require('../webpack/commonConfig');

const ENV = 'storybook';

module.exports = async ({ config, mode }) => {
  const customConfig = custom.baseDevConfig(ENV);
  const finalConfig = {
    ...config,
    node: {
      ...config.node,
      fs: 'empty',
    },
    plugins: [
      ...config.plugins,
      new ConfigWebpackPlugin(),
      new webpack.DefinePlugin(commonConfig.definePlugin(ENV, false))
    ],
    module: {
      ...config.module,
      rules: customConfig.module.rules
    },
    resolve: {
      ...config.resolve,
      extensions: [
        ...config.resolve.extensions,
        '.wasm',
      ],
    },
  };

  finalConfig.module.rules.push({
    test: /\.stories\.jsx?$/,
    loaders: [require.resolve('@storybook/source-loader')],
    enforce: 'pre',
  });

  return finalConfig;
};