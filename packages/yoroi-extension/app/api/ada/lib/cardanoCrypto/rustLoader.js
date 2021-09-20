// @flow

import typeof * as WasmV2 from 'cardano-wallet-browser';
import typeof * as WasmV3 from '@emurgo/js-chain-libs/js_chain_libs';
import typeof * as WasmV4 from '@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib';
import type { BigNum, LinearFee, TransactionBuilder } from '@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib';
import typeof * as SigmaRust from 'ergo-lib-wasm-browser';

// TODO: unmagic the constants
const MAX_VALUE_BYTES = 5000;
const MAX_TX_BYTES = 16384;

class Module {
  _wasmv2: WasmV2;
  _wasmv3: WasmV3;
  _wasmv4: WasmV4;
  _ergo: SigmaRust;

  async load(): Promise<void> {
    if (this._wasmv2 != null || this._wasmv3 != null || this._wasmv4 != null) return;
    this._wasmv2 = await import('cardano-wallet-browser');
    this._wasmv3 = await import('@emurgo/js-chain-libs/js_chain_libs');
    this._wasmv4 = await import('@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib');
    this._ergo = await import('ergo-lib-wasm-browser');
  }

  // Need to expose through a getter to get Flow to detect the type correctly
  get WalletV2(): WasmV2 {
    return this._wasmv2;
  }
  // Need to expose through a getter to get Flow to detect the type correctly
  get WalletV3(): WasmV3 {
    return this._wasmv3;
  }
  // Need to expose through a getter to get Flow to detect the type correctly
  get WalletV4(): WasmV4 {
    return this._wasmv4;
  }
  // Need to expose through a getter to get Flow to detect the type correctly
  WalletV4TxBuilder(
    linearFee: LinearFee,
    minimumUtxoVal: BigNum,
    poolDeposit: BigNum,
    keyDeposit: BigNum,
    maxValueBytes: number = MAX_VALUE_BYTES,
    maxTxBytes: number = MAX_TX_BYTES,
  ): TransactionBuilder {
    return this.WalletV4.TransactionBuilder.new(
      linearFee,
      minimumUtxoVal,
      poolDeposit,
      keyDeposit,
      maxValueBytes,
      maxTxBytes,
    );
  }
  // Need to expose through a getter to get Flow to detect the type correctly
  get SigmaRust(): SigmaRust {
    return this._ergo;
  }
}

// need this otherwise Wallet's flow type isn't properly exported
export const RustModule: Module = new Module();
