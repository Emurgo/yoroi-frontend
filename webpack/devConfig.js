// @flow

const commonConfig = require('./commonConfig');

const path = require('path');
const webpack = require('webpack');

const host = 'localhost';
const port = 3000;
const customPath = path.join(__dirname, './customPublicPath');
const hotScript =
  'webpack-hot-middleware/client?path=__webpack_hmr&dynamicPublicPath=true';

const baseDevConfig = (networkName /*: string */) => ({
  mode: 'development',
  optimization: commonConfig.optimization,
  node: commonConfig.node,
  resolve: commonConfig.resolve,
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
    publicPath: `http://${host}:${port}/js`,
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
    publicPath: 'http://localhost:3000/js/'
  },
  plugins: [
    ...commonConfig.plugins('dev', networkName),
    new webpack.DefinePlugin(commonConfig.definePlugin(networkName, false)),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.IgnorePlugin(/[^/]+\/[\S]+.prod$/),
    new webpack.DefinePlugin({
      __HOST__: `'${host}'`,
      __PORT__: port,
    })
  ],
  module: {
    rules: [
      ...commonConfig.rules,
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
