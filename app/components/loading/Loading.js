// @flow
import React, { Component } from 'react';
import SvgInline from 'react-svg-inline';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import classNames from 'classnames';
import LoadingSpinner from '../widgets/LoadingSpinner';
import icarusLogo from '../../assets/images/icarus-logo-loading.inline.svg';
import styles from './Loading.scss';
import type { ReactIntlMessage } from '../../types/i18nTypes';
import environment from '../../environment';
import LocalizableError from '../../i18n/LocalizableError';

type State = {};

type Props = {
  currencyIcon: string,
  apiIcon: string,
  isLoadingDataForNextScreen: boolean,
  loadingDataForNextScreenMessage: ReactIntlMessage,
  hasLoadedCurrentLocale: boolean,
  hasLoadedCurrentTheme: boolean,
  error: ?LocalizableError
};

@observer
export default class Loading extends Component<Props, State> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const {
      currencyIcon,
      apiIcon,
      isLoadingDataForNextScreen,
      loadingDataForNextScreenMessage,
      hasLoadedCurrentLocale,
      hasLoadedCurrentTheme,
      error
    } = this.props;

    const componentStyles = classNames([
      styles.component,
      hasLoadedCurrentTheme ? null : styles['is-loading-theme'],
      null,
      null,
    ]);
    const icarusLogoStyles = classNames([
      styles.icarusLogo
    ]);
    const currencyLogoStyles = classNames([
      styles[`${environment.API}-logo`],
    ]);
    const apiLogoStyles = classNames([
      styles[`${environment.API}-apiLogo`],
    ]);

    const icarusLoadingLogo = icarusLogo;
    const currencyLoadingLogo = currencyIcon;
    const apiLoadingLogo = apiIcon;

    return (
      <div className={componentStyles}>
        <div className={styles.logos}>
          <SvgInline svg={currencyLoadingLogo} className={currencyLogoStyles} />
          <SvgInline svg={icarusLoadingLogo} className={icarusLogoStyles} />
          <SvgInline svg={apiLoadingLogo} className={apiLogoStyles} />
        </div>
        {hasLoadedCurrentLocale && (
          <div>
            {isLoadingDataForNextScreen && (
              <div className={styles.loading}>
                <h1 className={styles.headline}>
                  {intl.formatMessage(loadingDataForNextScreenMessage)}
                </h1>
                <LoadingSpinner />
              </div>
            )}
            {error && (
              <div className={styles.loading}>
                <h1 className={styles.error}>
                  {intl.formatMessage(error)}
                </h1>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
