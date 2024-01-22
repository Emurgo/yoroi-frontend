// @flow

const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const commonConfig = require('./commonConfig');
const connections = require('../scripts-mv2/connections');

const path = require('path');
const webpack = require('webpack');

const host = 'localhost';
const customPath = path.join(__dirname, './customPublicPath');
const hotScript =
  'webpack-hot-middleware/client?path=__webpack_hmr&dynamicPublicPath=true';

const baseDevConfig = (
  networkName /*: string */,
  isNightly /*: boolean */,
  isLight /* : ?boolean */ = false
) /*: * */ => ({
  mode: 'development',
  optimization: commonConfig.optimization,
  experiments: commonConfig.experiments,
  resolve: commonConfig.resolve(),
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
    connector: [
      customPath,
      hotScript,
      path.join(__dirname, '../chrome/extension/connector/index')
    ],
    ledger: [
      customPath,
      hotScript,
      path.join(__dirname, '../ledger/index')
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
    new webpack.DefinePlugin(commonConfig.definePlugin(
      networkName,
      false,
      isNightly,
      Boolean(isLight)
    )),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.IgnorePlugin({
      resourceRegExp: /[^/]+\/[\S]+.prod$/,
    }),
    new webpack.DefinePlugin({
      __HOST__: `'${host}'`,
      __PORT__: connections.Ports.WebpackDev,
    }),
    new ReactRefreshWebpackPlugin(),
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
        include: [ path.resolve(__dirname, '../app') ],
        loader: 'file-loader',
      },
    ]
  }
});

module.exports = { baseDevConfig };
