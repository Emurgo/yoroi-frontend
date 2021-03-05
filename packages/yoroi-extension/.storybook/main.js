// @flow

module.exports = {
  stories: [
    '../app/components/**/*.stories.js',
    '../app/containers/**/*.stories.js',
    '../app/ergo-connector/components/**/*.stories.js',
    '../app/ergo-connector/containers/**/*.stories.js',
  ],
  addons: [
    '@storybook/addon-knobs/register',
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addon-viewport',
    '@storybook/addon-postcss',
    'storycap',
  ],
  core: {
    builder: "webpack5",
  },
};
