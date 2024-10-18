// @flow
const ConfigWebpackPlugin = require('config-webpack');
const commonConfig = require('./commonConfig');

const path = require('path');
const webpack = require('webpack');

const customPath = path.join(__dirname, './customPublicPath');

const baseDevConfig = (
  networkName /*: string */,
  isNightly /*: boolean */,
  isLight /* : ?boolean */ = false
) /*: * */ => ({
  mode: 'development',
  optimization: commonConfig.optimization,
  experiments: commonConfig.experiments,
  resolve: commonConfig.resolve(),
  devtool: 'source-map',
  entry: {
    yoroi: [
      customPath,
      path.join(__dirname, '../chrome/extension/index')
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
  devServer: {
    port: 8080,
    devMiddleware: {
      publicPath: `js`,
      stats: {
        colors: true
      },
      headers: { 'Access-Control-Allow-Origin': '*' },
      writeToDisk: true,
    },
  },
  output: {
    path: path.join(__dirname, '../dev/js'),
    filename: '[name].bundle.js',
    publicPath: 'js/',
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
  ],
  module: {
    rules: [
      ...commonConfig.rules(true),
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
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

const backgroundServiceWorkerConfig = (
  networkName /*: string */,
  isNightly /*: boolean */,
  isLight /* : ?boolean */ = false
) /*: * */ => ({
  mode: 'development',
  experiments: { asyncWebAssembly: true },
  resolve: commonConfig.resolve(),
  // could not use the eval option because Chrome manifest v3 prohibits eval()
  devtool: 'source-map',
  entry: {
    background: [
      path.join(__dirname, '../chrome/extension/background/index')
    ],
  },
  devServer: {
    port: 8081,
    devMiddleware: {
      writeToDisk: true,
    },
    hot: false,
    liveReload: false,
  },
  output: {
    path: path.join(__dirname, '../dev/js'),
    filename: 'background-service-worker.js',
  },
  plugins: [
    new ConfigWebpackPlugin(),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.DefinePlugin(commonConfig.definePlugin(
      networkName,
      false,
      isNightly,
      Boolean(isLight)
    )),
    new webpack.IgnorePlugin({
      resourceRegExp: /[^/]+\/[\S]+.prod$/,
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
    new webpack.NormalModuleReplacementPlugin(
      /rustLoader/,
      (resource) => {
        resource.request = resource.request.replace('rustLoader', 'rustLoaderForBackground')
      }
    ),
  ],
  module: {
    rules: [
      ...commonConfig.rules(true),
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
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

module.exports = { baseDevConfig, backgroundServiceWorkerConfig };
