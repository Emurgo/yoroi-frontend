// flow
import * as React from 'react';

const IntlProviderContext = React.createContext<{ intl: any }>({ intl: null });

export const IntlProvider = ({ children, intl }: { children: React.ReactNode; intl: any }) => {
  return <IntlProviderContext.Provider value={{ intl }}>{children}</IntlProviderContext.Provider>;
};

export const useIntl = () =>
  React.useContext(IntlProviderContext) ?? console.warn('IntlProviderontext: needs to be wrapped in a IntlProvider');
