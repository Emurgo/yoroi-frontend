// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import SvgInline from 'react-svg-inline';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import classNames from 'classnames';
import LoadingSpinner from '../widgets/LoadingSpinner';
import yoroiLogo from '../../assets/images/yoroi-logo-shape-white.inline.svg';
import styles from './Loading.scss';
import type { MessageDescriptor } from 'react-intl';
import environment from '../../environment';
import LocalizableError from '../../i18n/LocalizableError';

type Props = {|
  currencyIcon: string,
  apiIcon: string,
  isLoadingDataForNextScreen: boolean,
  loadingDataForNextScreenMessage: MessageDescriptor,
  hasLoadedCurrentLocale: boolean,
  hasLoadedCurrentTheme: boolean,
  error: ?LocalizableError,
  getErrorMessage: void => Node,
|};

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
          <SvgInline svg={currencyLoadingLogo} className={currencyLogoStyles} />
          <SvgInline svg={yoroiLoadingLogo} className={yoroiLogoStyles} />
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
                  {intl.formatMessage(error)}<br />
                  {this.props.getErrorMessage()}
                </h1>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
