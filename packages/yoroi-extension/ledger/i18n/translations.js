// @flow //

// $FlowFixMe require.context comes from webpack
const req = require.context('./locales', true, /\.json.*$/);
const translations: { [locale: string]: { [key: string]: string } } = {};
const SUPPORTED_LOCALS = [];

req.keys().forEach((file) => {
  const locale = file.replace('./', '').replace('.json', '');
  SUPPORTED_LOCALS.push(locale);
  translations[locale] = req(file);
});

export {
  translations,
  SUPPORTED_LOCALS
};
