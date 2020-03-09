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
        '@emurgo/js-chain-libs': '@emurgo/js-chain-libs-node',
      }
    }]
  ]
};

/*::
// https://babeljs.io/docs/en/config-files#config-function-api
type ApiType = { env: (void | string | Array<string>) => (string | boolean), ... };
*/
module.exports = function (api /*: ApiType */) {
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          corejs: 3,
          modules: (api.env('test') || api.env('jest')) ? 'commonjs' : 'auto',
          useBuiltIns: 'entry'
        }
      ],
      '@babel/preset-flow',
      '@babel/preset-react'
    ],
    plugins: [
      '@babel/plugin-proposal-nullish-coalescing-operator',
      '@babel/plugin-proposal-optional-chaining',
      'nameof-js',
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
      [
        '@babel/plugin-proposal-class-properties',
        {
          loose: true
        }
      ],
      '@babel/plugin-proposal-export-default-from',
      '@babel/plugin-proposal-export-namespace-from',
      ...(api.env('development') || api.env('storybook')
        ? [
          'react-hot-loader/babel',
        ]
        : []),
    ],
    env: {
      cucumber: nodePlugins,
      test: nodePlugins,
      jest: nodePlugins,
    }
  };
};
