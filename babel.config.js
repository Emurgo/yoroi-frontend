module.exports = function (api) {
  // when running jest we need to use nodejs and not browser configurations
  const nodePlugins = api.env('jest')
    ? ['dynamic-import-node']
    : [];

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          corejs: 2,
          modules: (api.env('test') || api.env('jest')) ? 'commonjs' : 'auto',
          useBuiltIns: 'entry'
        }
      ],
      '@babel/preset-flow',
      '@babel/preset-react'
    ],
    plugins: [
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
          corejs: (api.env('test') || api.env('jest')) ? false : 2,
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
      ...nodePlugins,
    ],
    env: {
      development: {
        plugins: [
          'react-hot-loader/babel',
          '@babel/plugin-transform-runtime'
        ]
      },
      'shelley-dev': {
        plugins: [
          'react-hot-loader/babel',
          '@babel/plugin-transform-runtime'
        ]
      },
      cucumber: {
        plugins: [
          '@babel/plugin-transform-runtime',
          ['module-resolver', {
            alias: {
              'cardano-wallet-browser': 'cardano-wallet',
              'js-chain-libs': 'js-chain-libs-node',
            }
          }]
        ]
      }
    }
  };
};
