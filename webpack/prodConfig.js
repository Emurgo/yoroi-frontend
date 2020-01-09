// @flow

const commonConfig = require('./commonConfig');

const path = require('path');
const webpack = require('webpack');

const customPath = path.join(__dirname, './customPublicPath');

const baseProdConfig = (networkName /*: string */) => ({
  mode: 'production',
  devtool: false,
  optimization: commonConfig.optimization,
  node: commonConfig.node,
  resolve: commonConfig.resolve,
  entry: {
    yoroi: [
      customPath,
      path.join(__dirname, '../chrome/extension/index')
    ],
    background: [
      customPath,
      path.join(__dirname, '../chrome/extension/background')
    ]
  },
  output: {
    path: path.join(__dirname, '../build/js'),
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js',
    publicPath: '/js/',
  },
  plugins: [
    ...commonConfig.plugins('build', networkName),
    new webpack.DefinePlugin(commonConfig.definePlugin(networkName, true)),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.IgnorePlugin(/[^/]+\/[\S]+.dev$/),
  ],
  module: {
    rules: [
      ...commonConfig.rules(true),
      {
        test: /\.js$/,
        use: [
          'thread-loader',
          {
            loader: 'babel-loader',
            options: {
              presets: [],
            },
          },
        ],
        exclude: [/node_modules/],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: [/node_modules/, /pdf\.worker(\.min)?\.js$/],
        use: ['thread-loader', 'babel-loader'],
      },
      {
        test: /\.(eot|otf|ttf|woff|woff2|gif|png)$/,
        loader: 'file-loader',
        options: {
          // Need to specify public path so assets can be loaded from static resources like CSS
          publicPath: '/js/'
        },
      },
    ]
  }
});

// export a callable function so we can swap out the network to use
module.exports = baseProdConfig;
