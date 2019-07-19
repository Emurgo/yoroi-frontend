// @flow

// eslint-disable-next-line
import typeof * as WalletType from 'CardanoWallet'

class Module {
  _cardanoWallet: WalletType;

  async load() {
    // $FlowFixMe flow fails on dynamic imports
    this._cardanoWallet = await import('cardano-wallet-browser');  // eslint-disable-line
  }

  // Need to expose through a getter to get Flow to detect the type correctly
  get Wallet(): WalletType {
    return this._cardanoWallet;
  }
}

// need this otherwise Wallet's flow type isn't properly exported
export const RustModule = new Module();
