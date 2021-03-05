// @flow

module.exports = {
  rules: {
    'flowtype/require-return-type': [
      2,
      'always',
      {
        excludeArrowFunctions: true,
        annotateUndefined: 'always-enforce',
        excludeMatching: ['constructor'],
      }
    ],
    'flowtype/require-parameter-type': [
      2,
      {
        excludeArrowFunctions: true
      }
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ClassProperty:not([typeAnnotation])',
        message: 'Missing type annotation of class property. This has unexpected cross-module behavior.'
      },
    ],
  },
};
