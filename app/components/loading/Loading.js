// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import LoadingSpinner from '../widgets/LoadingSpinner';
import AdaLogo from '../../assets/images/ada-logo.inline.svg';
import CardanoLogo from '../../assets/images/cardano-logo.inline.svg';
import YoroiLogo from '../../assets/images/yoroi-logo-shape-white.inline.svg';
import styles from './Loading.scss';
import LocalizableError from '../../i18n/LocalizableError';
import globalMessages from '../../i18n/global-messages';

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

type Props = {|
  +api: string,
  +isLoadingDataForNextScreen: boolean,
  +hasLoadedCurrentLocale: boolean,
  +hasLoadedCurrentTheme: boolean,
  +error: ?LocalizableError,
  +onExternalLinkClick: MouseEvent => void,
  +downloadLogs: void => void
|};

@observer
export default class Loading extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const {
      api,
      isLoadingDataForNextScreen,
      hasLoadedCurrentLocale,
      hasLoadedCurrentTheme,
      error
    } = this.props;

    const componentStyles = classNames([
      styles.component,
    ]);
    const yoroiLogoStyles = classNames([
      styles.yoroiLogo,
      hasLoadedCurrentTheme ? null : styles.hide,
    ]);
    const currencyLogoStyles = classNames([
      styles[`${api}-logo`],
    ]);
    const apiLogoStyles = classNames([
      styles[`${api}-apiLogo`],
    ]);

    const renderError = error == null || !hasLoadedCurrentLocale
      ? null
      : (
        <div className={styles.loading}>
          <h1 className={styles.error}>
            {intl.formatMessage(error)}<br /><br />
            {this._getErrorMessageComponent()}
          </h1>
        </div>
      );
    const renderContent = (error != null || !isLoadingDataForNextScreen)
      ? null
      : (
        <div className={styles.loading}>
          {hasLoadedCurrentLocale && (
            <h1 className={styles.headline}>
              {intl.formatMessage(messages.loading)}
            </h1>
          )}
          <LoadingSpinner />
        </div>
      );
    return (
      <div className={componentStyles}>
        <div className={styles.logos}>
          <span className={currencyLogoStyles}><AdaLogo /></span>
          <span className={yoroiLogoStyles}><YoroiLogo /></span>
          <span className={apiLogoStyles}><CardanoLogo /></span>
        </div>
        {renderContent}
        {renderError}
      </div>
    );
  }

  _getErrorMessageComponent = (): Node => {
    const { intl } = this.context;
    const {
      onExternalLinkClick,
      downloadLogs
    } = this.props;

    const downloadLogsLink = (
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      <a
        className={styles.link}
        href="#"
        onClick={_event => downloadLogs()}
      >
        {intl.formatMessage(globalMessages.downloadLogsLink)}
      </a>
    );

    const supportRequestLink = (
      <a
        className={styles.link}
        href={intl.formatMessage(globalMessages.supportRequestLinkUrl)}
        onClick={event => onExternalLinkClick(event)}
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
  };

}
