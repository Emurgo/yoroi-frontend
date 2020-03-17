// @flow

const commonConfig = require('./commonConfig');

const path = require('path');
const webpack = require('webpack');

const customPath = path.join(__dirname, './customPublicPath');

const defaultPublicPath = '/js/';

/*::
type EnvParams = {|
  networkName: string,
  nightly: "true" | "false",
  publicPath?: string,
|};
*/
const baseProdConfig = (env /*: EnvParams */) => ({
  mode: 'production',
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
    publicPath: env.publicPath == null ? defaultPublicPath : env.publicPath,
  },
  plugins: [
    ...commonConfig.plugins('build', env.networkName),
    new webpack.DefinePlugin(commonConfig.definePlugin(
      env.networkName,
      true,
      JSON.parse(env.nightly)
    )),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.IgnorePlugin(/[^/]+\/[\S]+.dev$/),
  ],
  module: {
    rules: [
      ...commonConfig.rules,
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: []
        }
      },
      {
        test: /\.(js|jsx)$/,
        exclude: [/node_modules/, /pdf\.worker(\.min)?\.js$/],
        use: 'babel-loader',
      },
      {
        test: /\.(eot|otf|ttf|woff|woff2|gif|png)$/,
        loader: 'file-loader',
        options: {
          // Need to specify public path so assets can be loaded from static resources like CSS
          publicPath: env.publicPath == null ? defaultPublicPath : env.publicPath,
        },
      },
    ]
  }
});

// export a callable function so we can swap out the network to use
module.exports = baseProdConfig;
