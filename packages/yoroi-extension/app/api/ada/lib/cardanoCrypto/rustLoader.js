// @flow

import typeof * as WasmV2 from 'cardano-wallet-browser';
import typeof * as WasmV3 from '@emurgo/js-chain-libs/js_chain_libs';
import type {
  BigNum,
  LinearFee,
  TransactionBuilder
} from '@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib';
import typeof * as WasmV4 from '@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib';
import typeof * as SigmaRust from 'ergo-lib-wasm-browser';
import typeof * as WasmMessageSigning from '@emurgo/cardano-message-signing-browser/cardano_message_signing';

// TODO: unmagic the constants
const MAX_VALUE_BYTES = 5000;
const MAX_TX_BYTES = 16384;

type RustModuleLoadFlags = 'dontLoadMessagesSigning';

function isWasmPointer(o: ?any): boolean {
  return o != null && o.ptr != null && o.free != null;
}

class Module {
  _wasmv2: WasmV2;
  _wasmv3: WasmV3;
  _wasmv4: WasmV4;
  _ergo: SigmaRust;
  _messageSigning: WasmMessageSigning;

  async load(flags: Array<RustModuleLoadFlags> = []): Promise<void> {
    if (
      this._wasmv2 != null
        || this._wasmv3 != null
        || this._wasmv4 != null
        || this._messageSigning != null
    ) return;
    this._wasmv2 = await import('cardano-wallet-browser');
    // this is used only by the now defunct jormungandr wallet
    this._wasmv3 = ((null: any): WasmV3);
    this._wasmv4 = await import('@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib');
    this._ergo = await import('ergo-lib-wasm-browser');
    if (flags.includes('dontLoadMessagesSigning')) {
      this._messageSigning = ((null: any): WasmMessageSigning);
    } else {
      this._messageSigning = await import('@emurgo/cardano-message-signing-browser/cardano_message_signing');
    }
  }

  /**
   * The argument to this function is an async callback.
   * The callback will receive a link to the `RustModule` class.
   * Any wasm pointer created within the callback will be automatically destroyed
   * after the callback ends, but only if it was created using the passed module.
   *
   * NOTE: If you use an external module reference to create wasm objects within the callback,
   * then they will not be able to get intercepted and removed.
   *
   * NOTE: The return from the callback will be returned from this function call,
   * BUT the result cannot be a wasm object as all pointers are getting destroyed
   * before this function returns. If the result will be detected to be a wasm pointer,
   * an exception will be raised.
   */
  async WasmScope<T>(callback: Module => Promise<T>): Promise<T> {
    /*
       * The main idea here is that we create a proxy of some root object (module itself)
       * and then we intercept every single field-getting access, including all functions,
       * and we check if the result of the function call is a Wasm pointer object.
       * If we detect a pointer - we add it into the tracked scope and free at the end of the call.
       * This way ANY wasm pointer produced within the callback will be automatically destroyed,
       * but only as long as it's created using the injected proxied module reference.
       */
    const scope = [];
    const proxyHandler: Proxy$traps<E> = {
      // We are intercepting when any field is trying to be accessed on the original object
      get(target: E, name: string, receiver: Proxy<E>): any {
        if (name === '____is_wasm_proxy') {
          return true;
        }
        // Get the actual field value from the original object
        const realValue = Reflect.get(target, name, receiver);
        if (name === 'prototype') {
          return realValue;
        }
        /* If the real value of the field is not a function,
         * then we just want to recursively wrap it in a same proxy.
         */
        if (typeof realValue !== 'function' || realValue.prototype != null) {
          return recursiveProxy(realValue);
        }
        return function(...args: any[]): any {
          const res = realValue.bind(target)(...args);
          if (isWasmPointer(res)) {
            scope.push(res);
          }
          return recursiveProxy(res);
        }
      }
    };
    function recursiveProxy<E>(originalObject: E): E {
      // Make sure the original object is not already a proxy
      if (originalObject.____is_wasm_proxy !== true) {
        // We only proxy objects and functions, the check is mostly for primitive values
        if (typeof originalObject === 'object' || typeof originalObject === 'function') {
          return new Proxy(originalObject, proxyHandler);
        }
      }
      return originalObject;
    }
    // We are proxying the `RustModule` itself to pass it into the callback.
    // Note that we create a new proxy every time, because each proxy instance
    // is linked to the specific scope that will be destroyed.
    const result = await callback(recursiveProxy(RustModule));
    scope.forEach(x => x.free());
    if (isWasmPointer(result)) {
      throw new Error('A wasm object cannot be returned from wasm scope, all pointers are destroyed.');
    }
    return result;
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
