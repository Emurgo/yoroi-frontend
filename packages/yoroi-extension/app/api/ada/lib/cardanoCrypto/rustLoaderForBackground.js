// @flow

// Somehow the dyanmic imports in `rustLoader.js` do not work in the background
// service worker. This module replaces `rustLoader.js` in the background service
// worker with the help of webpack NormalModuleReplacementPlugin.
// Note this won't work even here:
// import * as WasmV2 from 'cardano-wallet-browser';
import type { BigNum, LinearFee, TransactionBuilder } from '@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib';

import * as WasmV4 from '@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib';
import * as SigmaRust from 'ergo-lib-wasm-browser';
import * as WasmMessageSigning from '@emurgo/cardano-message-signing-browser/cardano_message_signing';

// TODO: unmagic the constants
const MAX_VALUE_BYTES = 5000;
const MAX_TX_BYTES = 16384;

class Module {
  async load(_ignored: any): Promise<void> {
    // noop because all the modules are synchronously loaded
  }

  get WalletV4(): typeof WasmV4 {
    return WasmV4;
  }

  get SigmaRust(): typeof SigmaRust {
    return SigmaRust;
  }

  get MessageSigning(): typeof WasmMessageSigning {
    return WasmMessageSigning;
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
    const w4 = this.WalletV4;
    return w4.TransactionBuilder.new(
      w4.TransactionBuilderConfigBuilder.new()
        .fee_algo(linearFee)
        .pool_deposit(poolDeposit)
        .key_deposit(keyDeposit)
        .coins_per_utxo_word(coinsPerUtxoWord)
        .max_value_size(maxValueBytes ?? MAX_VALUE_BYTES)
        .max_tx_size(maxTxBytes ?? MAX_TX_BYTES)
        .ex_unit_prices(w4.ExUnitPrices.new(
          w4.UnitInterval.new(
            w4.BigNum.from_str('577'),
            w4.BigNum.from_str('10000'),
          ),
          w4.UnitInterval.new(
            w4.BigNum.from_str('721'),
            w4.BigNum.from_str('10000000'),
          ),
        ))
        .prefer_pure_change(true)
        .build()
    );
  }
}

export const RustModule: Module = new Module();
