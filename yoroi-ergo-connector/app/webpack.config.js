// @flow
const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = {
  entry: {
    // $FlowFixMe
    app: path.resolve(__dirname, 'src/index.js'),
  },
  output: {
    publicPath: '/',
    // $FlowFixMe
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[hash].js',
  },
  mode: 'development',
  module: {
    rules: [
      {
        // $FlowFixMe
        test: /\.global\.scss$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'global',
              },
            },
          },
          'sass-loader',
        ],
      },
      {
        // $FlowFixMe
        test: /^((?!\.global).)*\.scss$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: {
                mode: 'local',
                localIdentName: '[name]_[local]',
              },
            },
          },
          'sass-loader',
        ],
      },
      {
        // $FlowFixMe
        test: /\.svg$/,
        // $FlowFixMe
        issuer: /\.scss$/,
        loader: 'url-loader',
      },
      {
        // $FlowFixMe
        test: /\.inline\.svg$/,
        // $FlowFixMe
        issuer: /\.js$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              svgoConfig: {
                plugins: [
                  {
                    removeViewBox: false,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        // $FlowFixMe
        test: /\.js$/,
        loader: 'babel-loader?cacheDirectory',
        // $FlowFixMe
        exclude: /node_modules/,
        options: {
          // $FlowFixMe
          plugins: [[require.resolve('react-refresh/babel'), { skipEnvCheck: true }]],
        },
      },
      {
        // $FlowFixMe
        test: /\.(js|jsx)$/,
        // $FlowFixMe
        exclude: [/node_modules/, /pdf\.worker(\.min)?\.js$/],
        use: 'babel-loader?cacheDirectory',
      },
      {
        // $FlowFixMe
        test: /\.(eot|otf|ttf|woff|woff2|gif|png)$/,
        loader: 'file-loader',
      },
      {
        // $FlowFixMe
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    // $FlowFixMe
    new HtmlWebPackPlugin({
      template: path.resolve(__dirname, 'public/index.html'),
    }),
    // new CopyWebpackPlugin(['index.html']),
    // $FlowFixMe
    new ReactRefreshWebpackPlugin(),
    // $FlowFixMe
    new webpack.HotModuleReplacementPlugin(),
  ],
};
