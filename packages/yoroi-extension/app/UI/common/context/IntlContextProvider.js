import * as React from 'react';
import { IntlContext, IntlProvider } from 'react-intl';
import { IntlProvider as IntlCustomProvider } from '../../context/IntlProvider';

export class IntlContextProvider extends React.Component {
  static defaultProps = {
    children: undefined,
  };

  static contextType = IntlContext;
  render() {
    const { children } = this.props;
    const { intl } = this.context;

    return (
      <IntlCustomProvider intl={intl}>
        {children}
      </IntlCustomProvider>
    );
  }
}


export class IntlProviderWrapper extends React.Component {
  render() {
    const { children, locale, messages } = this.props;
    return (
      <IntlProvider {...{ locale, key: locale, messages }}>
        {children}
      </IntlProvider>
    )
  }
}