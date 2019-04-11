const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const ConfigWebpackPlugin = require('config-webpack');
const shell = require('shelljs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const customPath = path.join(__dirname, './customPublicPath');

module.exports = {
  mode: 'production',
  optimization: {
    // https://github.com/webpack/webpack/issues/7470
    nodeEnv: false,
    splitChunks: {
      // the default delimiter ~ doesn't work with Terser
      automaticNameDelimiter: '_',
      chunks: 'all',
      // Firefox require all files to be <4MBs
      maxSize: 4000000,
    }
  },
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
    publicPath: '/js/',
  },
  plugins: [
    /** We remove non-English languages from BIP39 to avoid triggering bad word filtering */
    new webpack.IgnorePlugin(/^\.\/(?!english)/, /bip39\/src\/wordlists$/),
    /**
     * We need CardanoWallet for flow to get the WASM binding types.
     * However, the flow definitions aren't available to webpack at runtime
     * so we have to mock them out with a noop
     */
    new webpack.NormalModuleReplacementPlugin(
      /CardanoWallet/,
      'lodash/noop.js'
    ),
    /**
     * We use the HtmlWebpackPlugin to group back together the chunks inside the HTML
     */
    new HtmlWebpackPlugin({
      filename: path.join(__dirname, '../build/main_window.html'),
      template: path.join(__dirname, '../chrome/views/main_window.html'),
      chunks: ['yoroi']
    }),
    new HtmlWebpackPlugin({
      filename: path.join(__dirname, '../build/background.html'),
      template: path.join(__dirname, '../chrome/views/background.html'),
      chunks: ['background']
    }),
    new ConfigWebpackPlugin(),
    new webpack.DllReferencePlugin({
      context: path.join(__dirname, '..', 'dll'),
      manifest: require('../dll/vendor-manifest.json')
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.IgnorePlugin(/[^/]+\/[\S]+.dev$/),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('mainnet'),
        COMMIT: JSON.stringify(shell.exec('git rev-parse HEAD', { silent: true }).trim())
      }
    })
  ],
  resolve: {
    extensions: ['*', '.js', '.wasm']
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
      // Pdfjs Worker webpack config, reference to issue: https://github.com/mozilla/pdf.js/issues/7612#issuecomment-315179422
      {
        test: /pdf\.worker(\.min)?\.js$/,
        use: 'raw-loader',
      },
      {
        test: /\.(js|jsx)$/,
        exclude: [/node_modules/, /pdf\.worker(\.min)?\.js$/],
        use: 'babel-loader',
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
        loader: 'svg-inline-loader?removeSVGTagAttrs=false&removeTags=true&removingTags[]=title&removingTags[]=desc&idPrefix=[sha512:hash:hex:5]-',
      },
      {
        test: /\.(eot|otf|ttf|woff|woff2|gif)$/,
        loader: 'file-loader',
        options: {
          // Need to specify public path so assets can be loaded from static resources like CSS
          publicPath: '/js/'
        },
      },
      {
        test: /\.md$/,
        use: [
          'html-loader',
          'markdown-loader',
        ]
      },
      {
        test: /\.wasm$/,
        type: 'webassembly/experimental'
      },
    ]
  }
};
