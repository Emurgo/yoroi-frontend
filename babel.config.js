module.exports = function(api) {
  // when running jest we need to use nodejs and not browser configurations
  const nodePlugins = api.env('jest')
    ? [ "dynamic-import-node" ]
    : [];

  return {
    "presets": [
      [
        "@babel/preset-env",
        {
          "corejs": 2,
          "modules": "commonjs",
          "useBuiltIns": "entry"
        }
      ],
      "@babel/preset-flow",
      "@babel/preset-react"
    ],
    "plugins": [
      [
        "@babel/plugin-proposal-decorators",
        {
          "legacy": true
        }
      ],
      [
        "@babel/plugin-transform-runtime",
        {
          "corejs": 2,
          "helpers": true,
          "regenerator": true
        }
      ],
      [
        "react-intl",
        {
          "messagesDir": "./translations/messages/",
          "enforceDescriptions": false,
          "extractSourceLocation": true
        }
      ],
      "@babel/plugin-syntax-dynamic-import",
      "add-module-exports",
      [
        "@babel/plugin-proposal-class-properties",
        {
          "loose": true
        }
      ],
      "@babel/plugin-proposal-export-default-from",
      "@babel/plugin-proposal-export-namespace-from",
      ...nodePlugins,
    ],
    "env": {
      "development": {
        "plugins": [
          "react-hot-loader/babel",
          "@babel/plugin-transform-runtime"
        ]
      }
    }
  }
};
