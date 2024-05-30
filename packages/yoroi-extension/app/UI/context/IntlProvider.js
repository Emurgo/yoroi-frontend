// flow
import * as React from 'react';
import type { Node } from 'react';

const IntlProviderContext = React.createContext(null);

export const IntlProvider = ({ children, intl }: Node) => {
  return <IntlProviderContext.Provider value={{ intl }}>{children}</IntlProviderContext.Provider>;
};

export const useIntl = () =>
  React.useContext(IntlProviderContext) ?? invalid('IntlProviderontext: needs to be wrapped in a IntlProvider');
