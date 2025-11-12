const { defineConfig, globalIgnores } = require('eslint/config');
const js = require('@eslint/js');
const { FlatCompat } = require('@eslint/eslintrc');
const { fixupPluginRules } = require('@eslint/compat');
const globals = require('globals');

// Parsers
const babelParser = require('@babel/eslint-parser');
const typescriptParser = require('@typescript-eslint/parser');

// Plugins
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const reactHooks = require('eslint-plugin-react-hooks');
const promise = require('eslint-plugin-promise');
const react = require('eslint-plugin-react');
const flowtype = require('eslint-plugin-flowtype');
const noFloatingPromise = require('eslint-plugin-no-floating-promise');
const prettier = require('eslint-plugin-prettier');

// Setup compatibility layer for airbnb config
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

const airbnbConfig = compat.extends('airbnb', 'prettier');

// Shared rules that apply to all file types
const sharedRules = {
  // Import rules
  'import/no-extraneous-dependencies': 'off',
  'import/no-unresolved': 'off',
  'import/extensions': 'off',
  'import/no-dynamic-require': 'off',
  'import/no-named-as-default': 'off',
  'import/no-named-as-default-member': 'off',
  'import/prefer-default-export': 'off',
  'import/order': 'off',
  'import/imports-first': 1,

  // React rules
  'react/react-in-jsx-scope': 'off',
  'react/jsx-uses-react': 'off',
  'react/jsx-no-bind': 'off',
  'react/prefer-stateless-function': 'off',
  'react/no-unused-prop-types': 'off',
  'react/prop-types': 0,
  'react/require-default-props': 1,
  'react/sort-comp': 0,
  'react/destructuring-assignment': 0,
  'react/jsx-one-expression-per-line': 'off',
  'react/jsx-wrap-multilines': 'off',
  'react/jsx-props-no-spreading': 0,
  'react/jsx-curly-newline': 0,
  'react/jsx-tag-spacing': 0,
  'react/jsx-first-prop-new-line': 0,
  'react/jsx-curly-brace-presence': 0,
  'react/button-has-type': 1,
  'react/no-array-index-key': 1,
  'react/static-property-placement': ['warn', 'static public field'],
  'react/state-in-constructor': ['warn', 'never'],
  'react/jsx-indent': 1,

  // React Hooks
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'warn',

  // Promise rules
  'promise/param-names': 2,
  'promise/always-return': 2,
  'promise/catch-or-return': 2,
  'promise/no-native': 0,

  // Flowtype rules
  'flowtype/define-flow-type': 1,
  'flowtype/use-flow-type': 1,
  'flowtype/require-valid-file-annotation': 0,
  'flowtype/no-primitive-constructor-types': 2,
  'flowtype/no-dupe-keys': 2,

  // Floating promises
  'no-floating-promise/no-floating-promise': 2,

  // General JavaScript rules
  'no-undef': 'off', // TypeScript handles this for TS files
  'func-names': 'off',
  'new-cap': 'off',
  'arrow-parens': ['off'],
  'consistent-return': 'off',
  'comma-dangle': 'off',
  'generator-star-spacing': 'off',
  'lines-between-class-members': 'off',
  'no-multiple-empty-lines': 'off',
  'no-multi-spaces': 'off',
  'no-restricted-globals': 'off',
  'no-restricted-syntax': 'off',
  'no-return-await': 'off',
  'no-use-before-define': 'off',
  'object-curly-newline': 'off',
  'operator-linebreak': 0,
  'prefer-destructuring': 0,
  'class-methods-use-this': 0,
  'no-continue': 0,
  'no-duplicate-imports': 0,
  'no-param-reassign': 0,
  'no-plusplus': 0,
  'no-bitwise': 0,
  'no-underscore-dangle': 0,
  'no-console': 0,
  'no-mixed-operators': 0,
  'no-multi-assign': 0,
  'no-undef-init': 0,
  'prefer-template': 0,
  'no-trailing-spaces': 1,
  'padded-blocks': 0,
  'arrow-body-style': 0,
  'key-spacing': 1,
  'no-empty-function': 1,
  'max-len': 0,
  'no-useless-escape': 1,
  'prefer-const': 1,
  'object-curly-spacing': 1,
  'spaced-comment': 0,
  'no-nested-ternary': 0,
  'global-require': 'off',
  'no-await-in-loop': 0,
  'no-unused-expressions': 2,
  'no-lone-blocks': 0,
  'max-classes-per-file': 0,
  'no-extra-boolean-cast': 0,
  camelcase: 0,

  // Code style
  quotes: [
    'error',
    'single',
    {
      avoidEscape: true,
      allowTemplateLiterals: true,
    },
  ],

  'no-unneeded-ternary': [
    'error',
    {
      defaultAssignment: true,
    },
  ],

  // Project-specific restrictions
  'no-restricted-properties': [
    2,
    {
      object: 'TrezorConnect',
      message: 'Use TrezorWrapper instead to minimize Trezor iframe lifespan',
    },
  ],
};

module.exports = defineConfig([
  // ============================================================================
  // Global Configuration
  // ============================================================================
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.mocha,
        ...globals.node,
        ...globals.jest,
        chrome: true,
        API: true,
        NETWORK: true,
        MOBX_DEV_TOOLS: true,
        CONFIG: true,
        yoroi: true,
        nameof: true,
      },
    },
    rules: {
      'import/no-extraneous-dependencies': 'off',
      'import/no-unresolved': 'off',
    },
  },

  // ============================================================================
  // Airbnb Config (applies to all files)
  // ============================================================================
  ...airbnbConfig,

  // Override airbnb rules globally
  {
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },

  // ============================================================================
  // JavaScript/JSX Files Configuration
  // ============================================================================
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
          legacyDecorators: true,
        },
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-react'],
        },
      },
    },

    plugins: {
      promise,
      react,
      flowtype: fixupPluginRules(flowtype),
      'no-floating-promise': noFloatingPromise,
      prettier,
      '@typescript-eslint': typescriptEslint,
      'react-hooks': reactHooks,
    },
    rules: {
      ...sharedRules,
      'react/jsx-filename-extension': ['error', { extensions: ['.js', '.jsx'] }],
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },

  // ============================================================================
  // TypeScript/TSX Files Configuration
  // ============================================================================
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      promise,
      react,
      flowtype: fixupPluginRules(flowtype),
      'no-floating-promise': noFloatingPromise,
      prettier,
      '@typescript-eslint': typescriptEslint,
      'react-hooks': reactHooks,
    },
    rules: {
      ...sharedRules,
      'react/jsx-filename-extension': ['error', { extensions: ['.ts', '.tsx'] }],

      // TypeScript-specific rules
      'no-unused-vars': 'off', // Turn off base rule, use TypeScript version
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // ============================================================================
  // Ignore Patterns
  // ============================================================================
  globalIgnores([
    '**/node_modules/**',
    '**/build/**',
    '**/dev/**',
    '**/ampli/**',
    '**/flow/**',
    '**/flow-typed/**',
    '**/ledger/**',
    '**/translations/**',
    '**/config/**',
    '**/docs/**',
  ]),
]);
