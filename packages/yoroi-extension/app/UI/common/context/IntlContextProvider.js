import * as React from 'react';
import { intlShape } from 'react-intl';
import { IntlProvider as IntlCustomProvider } from '../../context/IntlProvider';
import { IntlProvider } from 'react-intl';

export class IntlContextProvider extends React.Component {
  static defaultProps = {
    children: undefined,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

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
    const { children, locale, key, messages } = this.props;
    return (
      <IntlProvider {...{ locale, key, messages }}>
        {children}
      </IntlProvider>
    )
  }
}