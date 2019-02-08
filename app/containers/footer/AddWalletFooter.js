import React, { Component } from 'react';
import FooterItem from '../../components/footer/FooterItem';
import HorizontalFlexContainer from '../../components/layout/HorizontalFlexContainer';

import buyTrezorSvg from '../../assets/images/footer/buy-trezor.inline.svg';
import whatIsHardwareWalletSvg from '../../assets/images/footer/what-is-hardware-wallet.inline.svg';
import howCreateWalletSvg from '../../assets/images/footer/how-to-create-wallet.inline.svg';
import howConnetTrezorSvg from '../../assets/images/footer/how-to-connect-trezor.inline.svg';
import howRestoreWalletSvg from '../../assets/images/footer/how-to-restore-wallet.inline.svg';

import { defineMessages } from 'react-intl';

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
          url="https://medium.com/@emurgo_io/whats-a-hardware-wallet-b3605a026008"
          svg={whatIsHardwareWalletSvg}
          message={messages.whatIsHardwareWallet}
        />
        <FooterItem
          url="https://youtu.be/Dp0wXwtToX0"
          svg={howConnetTrezorSvg}
          message={messages.howToConnectTrezor}
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
      </HorizontalFlexContainer>
    );
  }
}
