const path = require('path');
const webpack = require('webpack');

const dependencies = Object.keys(
  require('../package.json').dependencies
).filter(dep => dep !== 'react-polymorph' && dep !== 'node-sass'
  // WebAssembly module cannot be included in initial chunk
  // download and compilation must happen asynchronous
  && dep !== 'cardano-wallet-browser');

module.exports = {
  mode: 'production',
  optimization: {
    // https://github.com/webpack/webpack/issues/7470
    nodeEnv: false,
  },
  context: process.cwd(),
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.less', '.css'],
    modules: [__dirname, 'node_modules']
  },
  entry: {
    vendor: dependencies
  },
  node: {
    // need to remove "fs" library as we are not a nodejs application
    fs: 'empty'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../dll'),
    library: '[name]',
  },

  plugins: [
    /** We remove non-English languages from BIP39 to avoid triggering bad word filtering */
    new webpack.IgnorePlugin(/^\.\/(?!english)/, /bip39\/src\/wordlists$/),
    // creates a config file that will tell your main webpack config
    // where to find the precompiled library code bundle
    new webpack.DllPlugin({
      context: __dirname,
      name: '[name]',
      path: path.join(__dirname, '../dll/[name]-manifest.json')
    })
  ]
};
