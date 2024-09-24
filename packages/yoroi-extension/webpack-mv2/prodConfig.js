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
  isLight: "true" | "false"
|};
*/
const contentScriptConfig = (env /*: EnvParams */) /*: * */ => ({
  mode: 'production',
  optimization: commonConfig.optimization,
  experiments: commonConfig.experiments,
  resolve: commonConfig.resolve(),
  entry: {
    contentScript: [
      path.join(__dirname, '../chrome/content-scripts/bringInject.js'),
    ]
  },
  output: {
    path: path.join(__dirname, '../build/js'),
    filename: 'bringInject.js',
  },

  plugins: [
    ...commonConfig.plugins('build', env.networkName),
    new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1
    }),
    new webpack.DefinePlugin(commonConfig.definePlugin(
      env.networkName,
      true,
      JSON.parse(env.nightly),
      JSON.parse(env.isLight)
    )),
    new webpack.IgnorePlugin(/[^/]+\/[\S]+.dev$/),
  ],
  module: {
    rules: [
      ...commonConfig.rules(false),
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: []
        }
      },
    ]
  },
});

const baseProdConfig = (env /*: EnvParams */) /*: * */ => ({
  mode: 'production',
  optimization: commonConfig.optimization,
  experiments: commonConfig.experiments,
  resolve: commonConfig.resolve(),
  entry: {
    yoroi: [
      customPath,
      path.join(__dirname, '../chrome/extension/index')
    ],
    background: [
      customPath,
      path.join(__dirname, '../chrome/extension/background/index')
    ],
    connector: [
      customPath,
      path.join(__dirname, '../chrome/extension/connector/index')
    ],
    ledger: [
      customPath,
      path.join(__dirname, '../ledger/index')
    ],
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
      JSON.parse(env.nightly),
      JSON.parse(env.isLight)
    )),
    new webpack.IgnorePlugin(/[^/]+\/[\S]+.dev$/),
  ],
  module: {
    rules: [
      ...commonConfig.rules(false),
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
        include: [ path.resolve(__dirname, '../app') ],
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
module.exports = [ contentScriptConfig, baseProdConfig ];
