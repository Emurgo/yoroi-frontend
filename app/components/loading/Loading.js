// @flow
import React, { Component } from 'react';
import SvgInline from 'react-svg-inline';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import classNames from 'classnames';
import LoadingSpinner from '../widgets/LoadingSpinner';
import yoroiLogo from '../../assets/images/yoroi-logo-shape-white.inline.svg';
import styles from './Loading.scss';
import type { ReactIntlMessage } from '../../types/i18nTypes';
import environment from '../../environment';
import LocalizableError from '../../i18n/LocalizableError';

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
export default class Loading extends Component<Props> {

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
      hasLoadedCurrentTheme ? null : styles['is-loading-theme']
    ]);
    const yoroiLogoStyles = classNames([
      styles.yoroiLogo
    ]);
    const currencyLogoStyles = classNames([
      styles[`${environment.API}-logo`],
    ]);
    const apiLogoStyles = classNames([
      styles[`${environment.API}-apiLogo`],
    ]);

    const yoroiLoadingLogo = yoroiLogo;
    const currencyLoadingLogo = currencyIcon;
    const apiLoadingLogo = apiIcon;

    return (
      <div className={componentStyles}>
        <div className={styles.logos}>
          <SvgInline svg={currencyLoadingLogo} className={currencyLogoStyles} cleanup={['title']} />
          <SvgInline svg={yoroiLoadingLogo} className={yoroiLogoStyles} cleanup={['title']} />
          <SvgInline svg={apiLoadingLogo} className={apiLogoStyles} cleanup={['title']} />
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
