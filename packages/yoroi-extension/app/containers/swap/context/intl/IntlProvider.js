// TODO: Add types once migration to new structure
import * as React from 'react';

const IntlProviderContext = React.createContext({ intl: null });

export const IntlProvider = ({ children, intl }) => {
  return <IntlProviderContext.Provider value={{ intl }}>{children}</IntlProviderContext.Provider>;
};

export const useIntl = () =>
  React.useContext(IntlProviderContext) ?? console.warn('IntlProviderontext: needs to be wrapped in a IntlProvider');
