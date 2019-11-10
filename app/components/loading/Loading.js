// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import SvgInline from 'react-svg-inline';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import LoadingSpinner from '../widgets/LoadingSpinner';
import adaLogo from '../../assets/images/ada-logo.inline.svg';
import cardanoLogo from '../../assets/images/cardano-logo.inline.svg';
import yoroiLogo from '../../assets/images/yoroi-logo-shape-white.inline.svg';
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
  +onExternalLinkClick: Function,
  +downloadLogs: Function
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
      hasLoadedCurrentTheme ? null : styles['is-loading-theme']
    ]);
    const yoroiLogoStyles = classNames([
      styles.yoroiLogo
    ]);
    const currencyLogoStyles = classNames([
      styles[`${api}-logo`],
    ]);
    const apiLogoStyles = classNames([
      styles[`${api}-apiLogo`],
    ]);

    const yoroiLoadingLogo = yoroiLogo;
    const currencyLoadingLogo = adaLogo;
    const apiLoadingLogo = cardanoLogo;

    return (
      <div className={componentStyles}>
        <div className={styles.logos}>
          <SvgInline svg={currencyLoadingLogo} className={currencyLogoStyles} />
          <SvgInline svg={yoroiLoadingLogo} className={yoroiLogoStyles} />
          <SvgInline svg={apiLoadingLogo} className={apiLogoStyles} />
        </div>
        {hasLoadedCurrentLocale && (
          <div>
            {isLoadingDataForNextScreen && (
              <div className={styles.loading}>
                <h1 className={styles.headline}>
                  {intl.formatMessage(messages.loading)}
                </h1>
                <LoadingSpinner />
              </div>
            )}
            {error && (
              <div className={styles.loading}>
                <h1 className={styles.error}>
                  {intl.formatMessage(error)}<br />
                  {this._getErrorMessageComponent()}
                </h1>
              </div>
            )}
          </div>
        )}
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
