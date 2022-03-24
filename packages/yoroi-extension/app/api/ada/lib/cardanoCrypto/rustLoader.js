// @flow

import typeof * as WasmV2 from 'cardano-wallet-browser';
import typeof * as WasmV3 from '@emurgo/js-chain-libs/js_chain_libs';
import typeof * as WasmV4 from '@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib';
import type { BigNum, LinearFee, TransactionBuilder } from '@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib';
import typeof * as SigmaRust from 'ergo-lib-wasm-browser';
import typeof * as WasmMessageSigning from '@emurgo/cardano-message-signing-browser/cardano_message_signing';

// TODO: unmagic the constants
const MAX_VALUE_BYTES = 5000;
const MAX_TX_BYTES = 16384;

class Module {
  _wasmv2: WasmV2;
  _wasmv3: WasmV3;
  _wasmv4: WasmV4;
  _ergo: SigmaRust;
  _messageSigning: WasmMessageSigning;

  async load(): Promise<void> {
    if (
      this._wasmv2 != null
        || this._wasmv3 != null
        || this._wasmv4 != null
        || this._messageSigning != null
    ) return;
    this._wasmv2 = await import('cardano-wallet-browser');
    this._wasmv3 = await import('@emurgo/js-chain-libs/js_chain_libs');
    this._wasmv4 = await import('@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib');
    this._ergo = await import('ergo-lib-wasm-browser');
    this._messageSigning = await import('@emurgo/cardano-message-signing-browser/cardano_message_signing');
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
  WalletV4TxBuilderFromConfig(config: {
    +LinearFee: {|
      +coefficient: string,
      +constant: string,
    |};
    +CoinsPerUtxoWord: string,
    +PoolDeposit: string,
    +KeyDeposit: string,
    ...
  }): TransactionBuilder {
    return this.WalletV4TxBuilder({
      linearFee: RustModule.WalletV4.LinearFee.new(
        RustModule.WalletV4.BigNum.from_str(config.LinearFee.coefficient),
        RustModule.WalletV4.BigNum.from_str(config.LinearFee.constant),
      ),
      coinsPerUtxoWord: RustModule.WalletV4.BigNum.from_str(config.CoinsPerUtxoWord),
      poolDeposit: RustModule.WalletV4.BigNum.from_str(config.PoolDeposit),
      keyDeposit: RustModule.WalletV4.BigNum.from_str(config.KeyDeposit),
    });
  }
  // Need to expose through a getter to get Flow to detect the type correctly
  WalletV4TxBuilder(params: {
    linearFee: LinearFee,
    coinsPerUtxoWord: BigNum,
    poolDeposit: BigNum,
    keyDeposit: BigNum,
    maxValueBytes: ?number,
    maxTxBytes: ?number,
    ...
  } | {
    linearFee: LinearFee,
    coinsPerUtxoWord: BigNum,
    poolDeposit: BigNum,
    keyDeposit: BigNum,
    ...
  }): TransactionBuilder {
    const {
      linearFee,
      coinsPerUtxoWord,
      poolDeposit,
      keyDeposit,
      // $FlowFixMe[prop-missing]
      maxValueBytes,
      // $FlowFixMe[prop-missing]
      maxTxBytes,
    } = params;
    return this.WalletV4.TransactionBuilder.new(
      this.WalletV4.TransactionBuilderConfigBuilder.new()
        .fee_algo(linearFee)
        .pool_deposit(poolDeposit)
        .key_deposit(keyDeposit)
        .coins_per_utxo_word(coinsPerUtxoWord)
        .max_value_size(maxValueBytes ?? MAX_VALUE_BYTES)
        .max_tx_size(maxTxBytes ?? MAX_TX_BYTES)
        .prefer_pure_change(true)
        .build()
    );
  }
  // Need to expose through a getter to get Flow to detect the type correctly
  get SigmaRust(): SigmaRust {
    return this._ergo;
  }
  get MessageSigning(): WasmMessageSigning {
    return this._messageSigning;
  }
}

// need this otherwise Wallet's flow type isn't properly exported
export const RustModule: Module = new Module();
