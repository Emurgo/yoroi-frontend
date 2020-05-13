// @flow

module.exports = {
  env: {
    shelljs: true
  },
  rules: {
    'no-console': 0,
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }]
  }
};
