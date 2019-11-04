// @flow

// eslint-disable-next-line
import typeof * as WasmV2 from 'cardano-wallet-browser';
// eslint-disable-next-line
import typeof * as WasmV3 from 'js-chain-libs';

class Module {
  _wasmv2: WasmV2;
  _wasmv3: WasmV3;

  async load() {
    this._wasmv2 = await import('cardano-wallet-browser'); // eslint-disable-line
    this._wasmv3 = await import('js-chain-libs'); // eslint-disable-line
  }

  // Need to expose through a getter to get Flow to detect the type correctly
  get WalletV2(): WasmV2 {
    return this._wasmv2;
  }
  // Need to expose through a getter to get Flow to detect the type correctly
  get WalletV3(): WasmV3 {
    return this._wasmv3;
  }
}

// need this otherwise Wallet's flow type isn't properly exported
export const RustModule = new Module();
