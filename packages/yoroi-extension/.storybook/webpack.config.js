// @flow

const path = require('path');
const webpack = require('webpack');
const ConfigWebpackPlugin = require('config-webpack');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

// your app's webpack.config.js
const devConfig = require('../webpack/devConfig');
const [ baseProdConfig ] = require('../webpack/prodConfig');
const commonConfig = require('../webpack/commonConfig');

const ENV = 'storybook';

module.exports = async ({ config, mode } /*: {|
  mode: 'PRODUCTION' | 'DEVELOPMENT',
  config: any,
|}*/) /*: * */ => {
  const isNightly = "false";
  const isLight = "false";
  const isProduction = mode === 'PRODUCTION';
  const customConfig = isProduction
    ? baseProdConfig({
      networkName: ENV,
      nightly: isNightly,
      publicPath: './',
      isLight
    })
    : devConfig.baseDevConfig(ENV, isNightly === 'true',);

  const finalConfig = {
    ...config,
    node: {
      ...config.node,
      __filename: true,
    },
    plugins: [
      ...config.plugins,
      new ConfigWebpackPlugin(),
      new ReactRefreshWebpackPlugin(),
      new webpack.DefinePlugin(commonConfig.definePlugin(ENV, isProduction, isNightly === 'true')),
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      })
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
      fallback: {
        ...customConfig.resolve.fallback,
        ...config.resolve.fallback,
      },
      alias: {
        ...customConfig.resolve.alias,
        ...config.resolve.alias,
        // mysteriously we need to alias this for Storybook
        'cardano-wallet-browser': 'cardano-wallet-browser/cardano_wallet_browser',
        'ergo-lib-wasm-browser': 'ergo-lib-wasm-browser/ergo_lib_wasm',
      },
    },
    experiments: {
      ...customConfig.experiments,
    },
  };

  finalConfig.module.rules.push({
    test: /\.stories\.jsx?$/,
    loader: require.resolve('@storybook/source-loader'),
    enforce: 'pre',
  });

  return finalConfig;
};
