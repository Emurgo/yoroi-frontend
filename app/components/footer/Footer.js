// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { intlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import styles from './Footer.scss';

@observer
export default class Footer extends Component<{}> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    return (
      <footer className={styles.footer}>
        <a href="/" className={styles.link}>
          <div className={classnames([styles.footerIcon, styles.buyIcon])} />
          <span>{intl.formatMessage(globalMessages.buyTrezorMessage)}</span>
          {/* <span>Byu Trezor</span> */}
        </a>

        <a href="/" className={styles.link}>
          <div className={classnames([styles.footerIcon, styles.hardwareWalletIcon])} />
          <span>{intl.formatMessage(globalMessages.whatIsAHarwareWalletMessage)}</span>
          {/* <span>What is the hardware wallet?</span> */}
        </a>
      </footer>
    );
  }
}
