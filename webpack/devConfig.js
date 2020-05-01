// @flow

const commonConfig = require('./commonConfig');
const connections = require('../scripts/connections');

const path = require('path');
const webpack = require('webpack');

const host = 'localhost';
const customPath = path.join(__dirname, './customPublicPath');
const hotScript =
  'webpack-hot-middleware/client?path=__webpack_hmr&dynamicPublicPath=true';

const baseDevConfig = (
  networkName /*: string */,
  isNightly /*: boolean */,
) => ({
  mode: 'development',
  optimization: commonConfig.optimization,
  node: commonConfig.node,
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
    ]
  },
  devMiddleware: {
    publicPath: `http://${host}:${connections.Ports.WebpackDev}/js`,
    stats: {
      colors: true
    },
    noInfo: true,
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
    new webpack.DefinePlugin(commonConfig.definePlugin(networkName, false, isNightly)),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.IgnorePlugin(/[^/]+\/[\S]+.prod$/),
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
        loader: 'babel-loader?cacheDirectory',
        exclude: /node_modules/
      },
      {
        test: /\.(js|jsx)$/,
        exclude: [/node_modules/, /pdf\.worker(\.min)?\.js$/],
        use: 'babel-loader?cacheDirectory',
      },
      {
        test: /\.(eot|otf|ttf|woff|woff2|gif|png)$/,
        loader: 'file-loader',
      },
    ]
  }
});

module.exports = { baseDevConfig };
