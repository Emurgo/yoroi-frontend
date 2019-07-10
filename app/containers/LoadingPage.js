// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, FormattedMessage, intlShape } from 'react-intl';
import CenteredLayout from '../components/layout/CenteredLayout';
import Loading from '../components/loading/Loading';
import adaLogo from '../assets/images/ada-logo.inline.svg';
import cardanoLogo from '../assets/images/cardano-logo.inline.svg';
import type { InjectedProps } from '../types/injectedPropsType';
import { handleExternalLinkClick } from '../utils/routing';
import globalMessages from '../i18n/global-messages';
import { downloadLogs } from '../utils/logging';

const messages = defineMessages({
  loading: {
    id: 'loading.screen.loading',
    defaultMessage: '!!!loading components',
  },
  error: {
    id: 'loading.screen.error',
    defaultMessage: '!!!For more help, you can {supportRequestLink}',
  },
});

@observer
export default class LoadingPage extends Component<InjectedProps> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { stores } = this.props;
    const { loading } = stores;
    const { hasLoadedCurrentLocale, hasLoadedCurrentTheme } = stores.profile;
    return (
      <CenteredLayout>
        <Loading
          currencyIcon={adaLogo}
          apiIcon={cardanoLogo}
          hasLoadedCurrentLocale={hasLoadedCurrentLocale}
          hasLoadedCurrentTheme={hasLoadedCurrentTheme}
          isLoadingDataForNextScreen={loading.isLoading}
          loadingDataForNextScreenMessage={messages.loading}
          error={loading.error}
          getErrorMessage={this.getErrorMessage}
        />
      </CenteredLayout>
    );
  }

  getErrorMessage = (): Node => {
    const { intl } = this.context;

    const downloadLogsLink = (
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      <a
        href="#"
        onClick={_event => downloadLogs()}
      >
        {intl.formatMessage(globalMessages.downloadLogsLink)}
      </a>
    );

    const supportRequestLink = (
      <a
        href={intl.formatMessage(globalMessages.supportRequestLinkUrl)}
        onClick={event => handleExternalLinkClick(event)}
      >
        {intl.formatMessage(globalMessages.contactSupport)}
      </a>
    );

    return (
      <p>
        <FormattedMessage {...globalMessages.logsContent} values={{ downloadLogsLink }} /><br />
        <FormattedMessage {...messages.error} values={{ supportRequestLink }} />
      </p>
    );
  }
}
