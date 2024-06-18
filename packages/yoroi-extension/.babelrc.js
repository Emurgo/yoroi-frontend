// @flow

/**
 * when running jest we need to use nodejs and not browser configurations
*/
const nodePlugins = {
  plugins: [
    'dynamic-import-node',
    '@babel/plugin-transform-runtime',
    ['module-resolver', {
      alias: {
        'cardano-wallet-browser': 'cardano-wallet',
        '@emurgo/cardano-serialization-lib-browser': '@emurgo/cardano-serialization-lib-nodejs',
        '@emurgo/cardano-message-signing-browser': '@emurgo/cardano-message-signing-nodejs',
        '@emurgo/cross-csl-browser': '@emurgo/cross-csl-nodejs',
      }
    }]
  ]
};

/*::
// https://babeljs.io/docs/en/config-files#config-function-api
type ApiType = { env: (void | string | Array<string>) => (string | boolean), ... };
*/
module.exports = function (api /*: ApiType */) /*: * */ {
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          corejs: 3,
          modules: (api.env('test') || api.env('jest')) ? 'commonjs' : 'auto',
          useBuiltIns: 'entry',
        }
      ],
      '@babel/preset-flow',
      [
        '@babel/preset-react',
        {
          runtime: 'automatic',
        },
      ],
    ],
    plugins: [
      '@babel/plugin-proposal-nullish-coalescing-operator',
      '@babel/plugin-proposal-optional-chaining',
      'babel-plugin-ts-nameof',
      [
        '@babel/plugin-proposal-decorators',
        {
          legacy: true
        }
      ],
      [
        '@babel/plugin-transform-runtime',
        {
          // CoreJS breaks Jest mocks for some reason
          corejs: (api.env('test') || api.env('jest')) ? false : 3,
          helpers: true,
          regenerator: true
        }
      ],
      [
        'react-intl',
        {
          messagesDir: './translations/messages/',
          extractSourceLocation: true
        }
      ],
      '@babel/plugin-syntax-dynamic-import',
      'add-module-exports',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-private-methods',
      '@babel/plugin-proposal-export-default-from',
      '@babel/plugin-proposal-export-namespace-from',
    ],
    env: {
      test: nodePlugins,
      jest: nodePlugins,
    }
  };
};
