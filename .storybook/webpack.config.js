// @flow

const path = require('path');
const webpack = require('webpack');
const ConfigWebpackPlugin = require('config-webpack');

// your app's webpack.config.js
const devConfig = require('../webpack/devConfig');
const baseProdConfig = require('../webpack/prodConfig');
const commonConfig = require('../webpack/commonConfig');

const ENV = 'storybook';

module.exports = async ({ config, mode } /*: {|
  mode: 'PRODUCTION' | 'DEVELOPMENT',
  config: any,
|}*/) /*: * */ => {
  const isNightly = "false";
  const isProduction = mode === 'PRODUCTION';
  const customConfig = isProduction
    ? baseProdConfig({
      networkName: ENV,
      nightly: isNightly,
      publicPath: './',
    })
    : devConfig.baseDevConfig(ENV, isNightly === 'true');
  const finalConfig = {
    ...config,
    node: {
      ...config.node,
      __filename: true,
      fs: 'empty',
    },
    plugins: [
      ...config.plugins,
      new ConfigWebpackPlugin(),
      new webpack.DefinePlugin(commonConfig.definePlugin(ENV, isProduction, isNightly === 'true'))
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