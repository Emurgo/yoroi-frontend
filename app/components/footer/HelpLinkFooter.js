// @flow
import React, { Component } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import SvgInline from 'react-svg-inline';
import classNames from 'classnames';

import buyTrezorSvg from '../../assets/images/footer/buy-trezor.inline.svg';
import whatIsHardwareWalletSvg from '../../assets/images/footer/what-is-hardware-wallet.inline.svg';
import howConnetTrezorSvg from '../../assets/images/footer/how-to-connect-trezor.inline.svg';
import howCreateWalletSvg from '../../assets/images/footer/how-to-create-wallet.inline.svg';
import howRestoreWalletSvg from '../../assets/images/footer/how-to-restore-wallet.inline.svg';

import styles from './HelpLinkFooter.scss';

const messages = defineMessages({
  buyTrezorHardwareWallet: {
    id: 'wallet.footer.buyTrezorHardwareWallet.text',
    defaultMessage: '!!!Buy a Trezor hardware wallet.',
    description: 'Footer Buy a Trezor hardware wallet link text.'
  },
  whatIsHardwareWallet: {
    id: 'wallet.footer.whatIsHardwareWallet.text',
    defaultMessage: '!!!What is a hardware wallet?',
    description: 'Footer What is a hardware wallet? link text.'
  },
  howToConnectTrezor: {
    id: 'wallet.footer.howToConnectTrezor.text',
    defaultMessage: '!!!How to connect a Trezor.',
    description: 'Footer How to connect a Trezor link text.'
  },
  howToCreateWallet: {
    id: 'wallet.footer.howToCreateWallet.text',
    defaultMessage: '!!!How to create a wallet.',
    description: 'Footer How to create a wallet link text.'
  },
  howToRestoreWallet: {
    id: 'wallet.footer.howToRestoreWallet.text',
    defaultMessage: '!!!How to restore a wallet.',
    description: 'Footer How to restore a wallet link text.'
  },
});

type Props = {
  showBuyTrezorHardwareWallet: boolean,
  showWhatIsHardwareWallet?: boolean,
  showHowToConnectTrezor?: boolean,
  showHowToCreateWallet?: boolean,
  showHowToRestoreWallet?: boolean,
};

export default class HelpLinkFooter extends Component<Props> {
  static defaultProps = {
    showWhatIsHardwareWallet: false,
    showHowToConnectTrezor: false,
    showHowToCreateWallet: false,
    showHowToRestoreWallet: false,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const blockDynamicStyle = { width: `${100 / this._visibleBlockCount}%` };

    return (
      <div className={styles.component}>
        {/* Buy a Trezor Hardware wallet */}
        {this.props.showBuyTrezorHardwareWallet &&
          <a
            href="https://yoroi-wallet.com/get-trezor"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.block}
            style={blockDynamicStyle}
          >
            <div className={styles.icon}>
              <SvgInline svg={buyTrezorSvg} cleanup={['title']} />
            </div>
            <div className={styles.text}>
              {intl.formatMessage(messages.buyTrezorHardwareWallet)}
            </div>
          </a>}
        {/* What is a hardware wallet */}
        {this.props.showWhatIsHardwareWallet &&
          <a
            href="https://medium.com/@emurgo_io/whats-a-hardware-wallet-b3605a026008"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.block}
            style={blockDynamicStyle}
          >
            <div className={styles.icon}>
              <SvgInline svg={whatIsHardwareWalletSvg} cleanup={['title']} />
            </div>
            <div className={styles.text}>
              {intl.formatMessage(messages.whatIsHardwareWallet)}
            </div>
          </a>}
        {/* How to connect a Trezor */}
        {this.props.showHowToConnectTrezor &&
          <a
            href="https://youtu.be/Dp0wXwtToX0"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.block}
            style={blockDynamicStyle}
          >
            <div className={classNames([styles.icon, styles.iconConnectTrezor])}>
              <SvgInline svg={howConnetTrezorSvg} cleanup={['title']} />
            </div>
            <div className={styles.text}>
              {intl.formatMessage(messages.howToConnectTrezor)}
            </div>
          </a>}
        {/* How to create a wallet */}
        {this.props.showHowToCreateWallet &&
          <a
            href="https://youtu.be/9jg8lsreIQ8"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.block}
            style={blockDynamicStyle}
          >
            <div className={styles.icon}>
              <SvgInline svg={howCreateWalletSvg} cleanup={['title']} />
            </div>
            <div className={styles.text}>
              {intl.formatMessage(messages.howToCreateWallet)}
            </div>
          </a>}
        {/* How to restore a wallet */}
        {this.props.showHowToRestoreWallet &&
          <a
            href="https://youtu.be/PKKWgTNKSks"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.block}
            style={blockDynamicStyle}
          >
            <div className={styles.icon}>
              <SvgInline svg={howRestoreWalletSvg} cleanup={['title']} />
            </div>
            <div className={styles.text}>
              {intl.formatMessage(messages.howToRestoreWallet)}
            </div>
          </a>}
      </div>
    );
  }

  get _visibleBlockCount(): number {
    let visibleBlockCount = 0;
    visibleBlockCount += this.props.showBuyTrezorHardwareWallet ? 1 : 0;
    visibleBlockCount += this.props.showWhatIsHardwareWallet ? 1 : 0;
    visibleBlockCount += this.props.showHowToConnectTrezor ? 1 : 0;
    visibleBlockCount += this.props.showHowToCreateWallet ? 1 : 0;
    visibleBlockCount += this.props.showHowToRestoreWallet ? 1 : 0;
    return visibleBlockCount;
  }
}
