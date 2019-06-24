// @flow
// This is essentially bulk require

// $FlowFixMe require.context comes from webpack
const req = require.context('./locales', true, /\.json.*$/);
const translations: { [locale: string]: { [key: string]: string } } = {};

req.keys().forEach((file) => {
  const locale = file.replace('./', '').replace('.json', '');
  translations[locale] = req(file);
});

module.exports = translations;
