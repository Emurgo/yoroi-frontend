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
    "flowtype/require-parameter-type": [
      2,
      {
        "excludeArrowFunctions": true
      }
    ],
  },
}
