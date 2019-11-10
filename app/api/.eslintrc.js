module.exports = {
  rules: {
    'flowtype/require-return-type': [
      2,
      'always',
      {
        excludeArrowFunctions: true,
        annotateUndefined: 'ignore',
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
