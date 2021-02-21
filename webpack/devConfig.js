// @flow

const commonConfig = require('./commonConfig');
const connections = require('../scripts/connections');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const path = require('path');
const webpack = require('webpack');

const host = 'localhost';
const customPath = path.join(__dirname, './customPublicPath');
const hotScript =
  'webpack-hot-middleware/client?path=__webpack_hmr&dynamicPublicPath=true';

const baseDevConfig = (
  networkName /*: string */,
  isNightly /*: boolean */,
) /*: * */ => ({
  mode: 'development',
  optimization: commonConfig.optimization,
  experiments: commonConfig.experiments,
  resolve: commonConfig.resolve(networkName),
  devtool: 'eval-source-map',
  entry: {
    yoroi: [
      customPath,
      hotScript,
      path.join(__dirname, '../chrome/extension/index')
    ],
    background: [
      customPath,
      hotScript,
      path.join(__dirname, '../chrome/extension/background')
    ],
    sign: [
      customPath,
      hotScript,
      path.join(__dirname, '../chrome/extension/ergo-connector/sign')
    ],
    connect: [
      customPath,
      hotScript,
      path.join(__dirname, '../chrome/extension/ergo-connector/connect')
    ],
    config: [
      customPath,
      hotScript,
      path.join(__dirname, '../chrome/extension/ergo-connector/config')
    ],
  },
  devMiddleware: {
    publicPath: `http://${host}:${connections.Ports.WebpackDev}/js`,
    stats: {
      colors: true
    },
    headers: { 'Access-Control-Allow-Origin': '*' }
  },
  hotMiddleware: {
    path: '/js/__webpack_hmr'
  },
  output: {
    path: path.join(__dirname, '../dev/js'),
    filename: '[name].bundle.js',
    // Need to so `HtmlWebpackPlugin` knows where to find the js bundles
    publicPath: `http://localhost:${connections.Ports.WebpackDev}/js/`
  },
  plugins: [
    ...commonConfig.plugins('dev', networkName),
    new ReactRefreshWebpackPlugin(),
    new webpack.DefinePlugin(commonConfig.definePlugin(networkName, false, isNightly)),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.IgnorePlugin({
      resourceRegExp: /[^/]+\/[\S]+.prod$/,
    }),
    new webpack.DefinePlugin({
      __HOST__: `'${host}'`,
      __PORT__: connections.Ports.WebpackDev,
    })
  ],
  module: {
    rules: [
      ...commonConfig.rules(true),
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          plugins: [[require.resolve('react-refresh/babel'), { skipEnvCheck: true }]],
          cacheDirectory: true,
        },
      },
      {
        test: /\.(js|jsx)$/,
        exclude: [/node_modules/, /pdf\.worker(\.min)?\.js$/],
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
        },
      },
      {
        test: /\.(eot|otf|ttf|woff|woff2|gif|png)$/,
        loader: 'file-loader',
      },
    ]
  }
});

module.exports = { baseDevConfig };
