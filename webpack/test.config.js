const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const ConfigWebpackPlugin = require('config-webpack');
const MinifyPlugin = require('babel-minify-webpack-plugin');
const shell = require('shelljs');

const customPath = path.join(__dirname, './customPublicPath');

module.exports = {
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
    filename: '[name].bundle.js'
  },
  plugins: [
    new ConfigWebpackPlugin(),
    new webpack.DllReferencePlugin({
      context: path.join(__dirname, '..', 'dll'),
      manifest: require('../dll/vendor-manifest.json') // eslint-disable-line
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.IgnorePlugin(/[^/]+\/[\S]+.dev$/),
    new MinifyPlugin({}, {
      comments: false
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('test'),
        COMMIT: JSON.stringify(shell.exec('git rev-parse HEAD', { silent: true }).trim())
      }
    })
  ],
  node: {
    fs: 'empty'
  },
  resolve: {
    extensions: ['*', '.js']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: []
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader?modules&sourceMap&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]',
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [autoprefixer]
            }
          }
        ]
      },
      {
        test: /\.global\.scss$/,
        use: [
          'style-loader?sourceMap',
          'css-loader?sourceMap',
          'sass-loader?sourceMap'
        ]
      },
      {
        test: /^((?!\.global).)*\.scss$/,
        use: [
          'style-loader?sourceMap',
          'css-loader?sourceMap&modules&localIdentName=[name]_[local]&importLoaders=1',
          'sass-loader?sourceMap'
        ]
      },
      {
        test: /\.svg$/,
        issuer: /\.scss$/,
        loader: 'url-loader'
      },
      {
        test: /\.inline\.svg$/,
        issuer: /\.js$/,
        loader: 'raw-loader',
      },
      {
        test: /\.(eot|otf|ttf|woff|woff2|gif)$/,
        loader: 'file-loader'
      },
      {
        test: /\.md$/,
        use: [
          'html-loader',
          'markdown-loader',
        ]
      },
    ]
  }
};
