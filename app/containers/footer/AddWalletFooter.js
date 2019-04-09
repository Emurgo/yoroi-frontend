import React, { Component } from 'react';
import FooterItem from '../../components/footer/FooterItem';
import HorizontalFlexContainer from '../../components/layout/HorizontalFlexContainer';

import buyTrezorSvg from '../../assets/images/footer/buy-trezor.inline.svg';
import howCreateWalletSvg from '../../assets/images/footer/how-to-create-wallet.inline.svg';
import howRestoreWalletSvg from '../../assets/images/footer/how-to-restore-wallet.inline.svg';

import { defineMessages } from 'react-intl';

const messages = defineMessages({
  buyTrezorHardwareWallet: {
    id: 'wallet.footer.buyTrezorHardwareWallet.text',
    defaultMessage: '!!!Buy a Trezor hardware wallet.',
  },
  buyLedgerHardwareWallet: {
    id: 'wallet.footer.buyLedgerHardwareWallet.text',
    defaultMessage: '!!!Buy a Ledger hardware wallet.',
  },
  howToCreateWallet: {
    id: 'wallet.footer.howToCreateWallet.text',
    defaultMessage: '!!!How to create a wallet.',
  },
  howToRestoreWallet: {
    id: 'wallet.footer.howToRestoreWallet.text',
    defaultMessage: '!!!How to restore a wallet.',
  },
  /* Temporarily disable
   * re-enable when new design is ready and if it's still needed
   * if it's not needed in new design,
   * then delete this as well as it's assets and translations */
  // whatIsHardwareWallet: {
  //   id: 'wallet.footer.whatIsHardwareWallet.text',
  //   defaultMessage: '!!!What is a hardware wallet',
  // },
  // howToConnectTrezor: {
  //   id: 'wallet.footer.howToConnectTrezor.text',
  //   defaultMessage: '!!!How to connect a Trezor.',
  // },
});

export default class AddWalletFooter extends Component {

  render() {
    return (
      <HorizontalFlexContainer>
        <FooterItem
          url="https://yoroi-wallet.com/get-trezor"
          svg={buyTrezorSvg}
          message={messages.buyTrezorHardwareWallet}
        />
        <FooterItem
          url="https://yoroi-wallet.com/get-ledger"
          svg={buyTrezorSvg}
          message={messages.buyLedgerHardwareWallet}
        />
        <FooterItem
          url="https://youtu.be/9jg8lsreIQ8?t=56"
          svg={howCreateWalletSvg}
          message={messages.howToCreateWallet}
        />
        <FooterItem
          url="https://youtu.be/PKKWgTNKSks?t=14"
          svg={howRestoreWalletSvg}
          message={messages.howToRestoreWallet}
        />
        {
          /* Temporarily disable
           * re-enable when new design is ready and if it's still needed
           * if it's not needed in new design,
           * then delete this as well as it's assets and translations */
        }
        {/* <FooterItem
          url="https://medium.com/@emurgo_io/whats-a-hardware-wallet-b3605a026008"
          svg={whatIsHardwareWalletSvg}
          message={messages.whatIsHardwareWallet}
        /> */}
        {/* <FooterItem
          url="https://youtu.be/Dp0wXwtToX0"
          svg={howConnetTrezorSvg}
          message={messages.howToConnectTrezor}
        /> */}
      </HorizontalFlexContainer>
    );
  }
}
