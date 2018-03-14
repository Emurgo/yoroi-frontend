import React, { Component } from 'react';
import { HdWallet } from 'rust-cardano-crypto';
import { mnemonicToSeedImpl } from '../crypto/BIP39';
import WalletStorage from '../state/WalletStorage';
import ImportWalletForm from '../components/ImportWalletForm';
import WalletInfo from '../components/WalletInfo';

class Wallet extends Component {
  constructor(props) {
    super(props);
    WalletStorage.initWallet();
    this.state = {
      hasWallet: WalletStorage.hasWallet(),
      wallet: WalletStorage.getWallet()
    };
  }

  importWallet = (secretWords) => {
    console.log('importWallet-secretWords:', secretWords);
    const seed = mnemonicToSeedImpl(secretWords);
    const wallet = HdWallet.fromSeed(seed);
    WalletStorage.setWallet(wallet);
    this.setState({
      hasWallet: WalletStorage.hasWallet(),
      wallet: WalletStorage.getWallet()
    });
  }

  render() {
    if (this.state.hasWallet) {
      return (<WalletInfo wallet={this.state.wallet} />);
    }
    return (
      <ImportWalletForm
        onSubmit={this.importWallet}
      />
    );
  }
}

export default Wallet;
