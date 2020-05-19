// @flow

const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const ConfigWebpackPlugin = require('config-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const shell = require('shelljs');
const manifestEnvs = require('../chrome/manifestEnvs');

const plugins = (folder /*: string */, networkName /*: string */) /*: * */ => {
  let pageTitle = '';
  switch (networkName) {
    case 'shelley-dev':
    case 'shelley-testnet':
      pageTitle = 'Yoroi Staking Testnet';
      break;
    default:
      pageTitle = 'Yoroi';
  }

  return [
    /** We remove non-English languages from BIP39 to avoid triggering bad word filtering */
    new webpack.IgnorePlugin(/^\.\/(?!english)/, /bip39\/src\/wordlists$/),
    /**
     * We use the HtmlWebpackPlugin to group back together the chunks inside the HTML
     * and with dynamic page title
     */
    new HtmlWebpackPlugin({
      filename: path.join(__dirname, `../${folder}/main_window.html`),
      template: path.join(__dirname, '../chrome/views/main_window.html'),
      chunks: ['yoroi'],
      alwaysWriteToDisk: true,
      title: pageTitle,
    }),
    new HtmlWebpackPlugin({
      filename: path.join(__dirname, `../${folder}/background.html`),
      template: path.join(__dirname, '../chrome/views/background.html'),
      chunks: ['background'],
      alwaysWriteToDisk: true
    }),
    /**
     * This plugin adds `alwaysWriteToDisk` to `HtmlWebpackPlugin`.
     * We need this otherwise the HTML files are managed by in-memory only by our hot reloader
     * But we need this written to disk so the extension can be loaded by Chrome
     */
    new HtmlWebpackHarddiskPlugin(),
    // populates the CONFIG global based on ENV
    new ConfigWebpackPlugin(),
  ];
};

const rules /*: boolean => Array<*> */ = (isDev) => [
  // Pdfjs Worker webpack config, reference to issue: https://github.com/mozilla/pdf.js/issues/7612#issuecomment-315179422
  {
    test: /pdf\.worker(\.min)?\.js$/,
    use: 'raw-loader',
  },
  {
    test: /\.css$/,
    use: [
      {
        loader: 'style-loader',
      },
      {
        loader: 'css-loader',
        options: {
          importLoaders: 1,
          sourceMap: isDev,
          modules: {
            mode: 'local',
            localIdentName: '[name]__[local]___[hash:base64:5]',
          }
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          plugins: () => [autoprefixer],
        }
      }
    ]
  },
  {
    test: /\.global\.scss$/,
    use: [
      {
        loader: 'style-loader',
      },
      {
        loader: 'css-loader',
        options: {
          sourceMap: isDev,
          modules: {
            mode: 'global',
          },
        },
      },
      'sass-loader'
    ]
  },
  {
    test: /^((?!\.global).)*\.scss$/,
    use: [
      {
        loader: 'style-loader',
      },
      {
        loader: 'css-loader',
        options: {
          importLoaders: 1,
          sourceMap: isDev,
          modules: {
            mode: 'local',
            localIdentName: '[name]_[local]',
          }
        },
      },
      'sass-loader'
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
    use: [{
      loader: '@svgr/webpack',
      options: {
        svgoConfig: {
          plugins: [{
            removeViewBox: false
          }]
        }
      }
    }]
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
  }
];


const optimization = {
  // https://github.com/webpack/webpack/issues/7470
  nodeEnv: false,
  splitChunks: {
    // the default delimiter ~ doesn't work with Terser
    automaticNameDelimiter: '_',
    chunks: 'all',
    // Firefox require all files to be <4MBs
    maxSize: 4000000,
  }
};

const node = {
  fs: 'empty'
};

const resolve = (networkName /*: string */) /*: * */ => ({
  extensions: ['*', '.js', '.wasm'],
  alias: (networkName === 'test')
    ? {
      // todo: make conditional
      'trezor-connect': path.resolve(__dirname, '../features/mock-trezor-connect/'),
    }
    : {},
});

const definePlugin = (
  networkName /*: string */,
  isProd /*: boolean */,
  isNightly /*: boolean */
) /*: * */ => ({
  'process.env': {
    NODE_ENV: JSON.stringify(isProd ? 'production' : 'development'),
    COMMIT: JSON.stringify(shell.exec('git rev-parse HEAD', { silent: true }).trim()),
    BRANCH: JSON.stringify(shell.exec('git rev-parse --abbrev-ref HEAD', { silent: true }).trim()),
    NIGHTLY: isNightly,
    SEIZA_FOR_YOROI_URL: JSON.stringify(manifestEnvs.SEIZA_FOR_YOROI_URL),
  }
});

module.exports = {
  plugins,
  rules,
  optimization,
  node,
  resolve,
  definePlugin,
};
