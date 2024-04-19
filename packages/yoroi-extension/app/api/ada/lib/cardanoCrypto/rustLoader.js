// @flow

import typeof * as WasmV2 from 'cardano-wallet-browser';
import type {
  BigNum,
  LinearFee,
  TransactionBuilder
} from '@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib';
import typeof * as WasmV4 from '@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib';
import typeof * as WasmMessageSigning from '@emurgo/cardano-message-signing-browser/cardano_message_signing';
import typeof * as CrossCsl from '@emurgo/cross-csl-browser';
import BigNumber from 'bignumber.js';

// TODO: unmagic the constants
const MAX_VALUE_BYTES = 5000;
const MAX_TX_BYTES = 16384;

type RustModuleLoadFlags = 'dontLoadMessagesSigning';

function isWasmPointer(o: ?any): boolean {
  return o != null && (typeof o.__wbg_ptr === 'number') && (typeof o.free === 'function');
}

/*
 * Some classes must not be proxied, as there is no need for it,
 * but also it breaks some other libraries working with that type.
 * For example, `Buffer.from` fails if the `Uint8Array` is proxied.
 */
const NON_PROXY_CLASSES = Object.freeze([Uint8Array]);
function isNonProxyClass(o: any): boolean {
  return NON_PROXY_CLASSES.some(c => o instanceof c);
}

function isProxyCompatibleType(o: any): boolean {
  // We only proxy objects and functions, the check is mostly for primitive values
  return typeof o === 'object' || typeof o === 'function'
}

/* Fake flag name used to identify our own proxies  */
const WASM_PROXY_FAKE_FLAG_NAME = '____is_wasm_proxy';
function isNotAlreadyAProxy(o: any): boolean {
  // Make sure the original object is not already a proxy
  return o[WASM_PROXY_FAKE_FLAG_NAME] !== true
}

function isProxiable(o: ?any): boolean {
  return o != null
    && isProxyCompatibleType(o)
    && !isNonProxyClass(o)
    && isNotAlreadyAProxy(o);
}

/**
 * Creates a new proxied RustModule scope.
 * Return fields:
 * - RustModule - the proxied module
 * - free() - the function that will free all the wasm pointers created within the scope so far.
 */
function createWasmScope(): {|
  RustModule: Module,
  free: () => void,
  size: () => number,
  isFree: () => boolean,
|} {
  /*
   * The main idea here is that we create a proxy of the root object (module itself)
   * and then we recursively intercept every single function call and we check
   * whether the result of the call is a Wasm pointer object. If we detect a pointer,
   * we add it into the tracked scope and free at the end of the execution.
   * This way ANY wasm pointer produced within the callback will be automatically destroyed,
   * but only as long as it's created using the injected proxied module reference.
   */
  const scope: Array<{ __wbg_ptr: number, free: () => void, ... }> = [];
  function recursiveProxy<E>(originalObject: E): E {
    if (!isProxiable(originalObject)) {
      return originalObject;
    }
    const proxyHandler: Proxy$traps<E> = {
      // We are intercepting when any field is trying to be accessed on the original object
      get(target: E, name: string, receiver: Proxy<E>): any {
        // Synthetic flag to identify our own proxies
        if (name === WASM_PROXY_FAKE_FLAG_NAME) {
          return true;
        }
        // Get the actual field value from the original object
        const realValue = Reflect.get(target, name, receiver);
        // Never proxy the prototype field
        if (name === 'prototype') {
          return realValue;
        }
        // In case the real field value is a function, we implement a special wrapper
        if (typeof realValue === 'function' && realValue.prototype == null) {
          /* Note that we're also checking that the function has no prototype.
           * The reason for this is that a field like `RustModule.WalletV4.BigNum`
           * also has a type `function`, because it's a class constructor,
           * but it is never used as a constructor directly, and instead only used
           * to access static fields, including Rust constructor functions like `.new()`.
           * The only thing that distinguishes it from a regular function is that
           * it has a non-null prototype, that's why we check for it and rather wrap
           * classes as regular objects.
           */
          /*
           * A wrapper function is returned instead.
           */
          return function (...args: any[]): any {
            // Call the actual function bound to the original object.
            const res = realValue.bind(target)(...args);
            if (isWasmPointer(res)) {
              /*
               * If the result of the function call is a wasm pointer object,
               * we track it in our hidder scope array so we can free it after
               * the callack is finished. This is pretty much the main point
               * of this entire scope thing.
               */
              scope.push(res);
            }
            // The result of the function call is then also recursively proxied.
            // Whether it's a wasm object or not.
            return recursiveProxy(res);
          }
        }
        /* If the real value of the field ISN'T a function or IS a class,
         * then we just want to recursively wrap it in a similar proxy.
         */
        return recursiveProxy(realValue);
      }
    };
    // $FlowFixMe[incompatible-return]
    return new Proxy<E>(originalObject, proxyHandler);
  }
  // We are proxying the `RustModule` itself to pass it into the callback.
  // Note that we create a new proxy every time, because each proxy instance
  // is linked to the specific scope that will be destroyed.
  return {
    RustModule: recursiveProxy(RustModule),
    free: () => {
      scope.forEach(x => {
        // Checking just to avoid a null-pointer crash
        if (x.__wbg_ptr !== 0) {
          x.free()
        }
      });
    },
    size: () => scope.length,
    isFree: () => scope.every(x => x.__wbg_ptr === 0),
  }
}

class Module {
  _wasmv2: WasmV2;
  _wasmv4: WasmV4;
  _messageSigning: WasmMessageSigning;
  _crossCsl: CrossCsl;

  async load(flags: Array<RustModuleLoadFlags> = []): Promise<void> {
    if (
      this._wasmv2 != null
        || this._wasmv4 != null
        || this._messageSigning != null
        || this._crossCsl != null
    ) return;
    this._wasmv2 = await import('cardano-wallet-browser');
    this._wasmv4 = await import('@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib');
    if (flags.includes('dontLoadMessagesSigning')) {
      this._messageSigning = ((null: any): WasmMessageSigning);
    } else {
      this._messageSigning = await import('@emurgo/cardano-message-signing-browser/cardano_message_signing');
    }
    this._crossCsl = await import('@emurgo/cross-csl-browser');
  }

  __WasmScopeInternal<T>(callback: Module => T): {|
    result: T,
    scopeSize: number,
    scopeIsFree: boolean,
  |} {
    const scope = createWasmScope();
    function onSuccess(result: T): {|
      result: T,
      scopeSize: number,
      scopeIsFree: boolean,
    |} {
      scope.free();
      if (isWasmPointer(result)) {
        throw new Error('A wasm object cannot be returned from wasm scope, all pointers are destroyed.');
      }
      return {
        result,
        scopeSize: scope.size(),
        scopeIsFree: scope.isFree(),
      };
    }
    function onFailure(err: Error): void {
      scope.free();
      throw err;
    }
    let result;
    try {
      result = callback(scope.RustModule);
    } catch (e) { onFailure(e); throw e; }
    return (result instanceof Promise)
      // $FlowFixMe[incompatible-exact]
      ? result.then(onSuccess, onFailure)
      : onSuccess(result);
  }

  /**
   * The argument to this function is a callback.
   * The callback will receive a link to a `RustModule` instance.
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
   *
   * NOTE: the callback can be an async function or any function that returns a promise.
   * In that case the return of this function will also be a promise that will resolve
   * to the same result from the callback. The wasm pointers will be destroyed once the
   * callback promise resolves.
   */
  WasmScope<T>(callback: Module => T): T {
    const scopedResult =  this.__WasmScopeInternal(callback);
    if (scopedResult instanceof Promise) {
      return scopedResult.then(r => r.result);
    }
    return scopedResult.result;
  }

  ScopeMonad<T>(callback: Module => T): WasmMonad<T> {
    const WS = this.WasmScope.bind(this);
    function InternalMonad<K>(mapper: Module => K): WasmMonad<K> {
      return {
        // $FlowIgnore[escaped-generic]
        wasmMap: f => InternalMonad(M => f(mapper(M), M)),
        // $FlowIgnore[escaped-generic]
        unwrap: f => WS(M => f(mapper(M), M)),
      }
    }
    return InternalMonad<T>(callback);
  }

  // Need to expose through a getter to get Flow to detect the type correctly
  get WalletV2(): WasmV2 {
    return this._wasmv2;
  }
  // Need to expose through a getter to get Flow to detect the type correctly
  get WalletV4(): WasmV4 {
    return this._wasmv4;
  }
  get CrossCsl(): CrossCsl {
    return this._crossCsl;
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

    // Inlined to avoid dependency cycles
    // <TODO:PENDING_REMOVAL> LEGACY
    const coinsPerUtxoByte = w4.BigNum.from_str(
      new BigNumber(coinsPerUtxoWord.to_str())
        .div(8)
        .integerValue(BigNumber.ROUND_FLOOR)
        .toString(),
    );

    return w4.TransactionBuilder.new(
      w4.TransactionBuilderConfigBuilder.new()
        .fee_algo(linearFee)
        .pool_deposit(poolDeposit)
        .key_deposit(keyDeposit)
        .coins_per_utxo_byte(coinsPerUtxoByte)
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

  get MessageSigning(): WasmMessageSigning {
    return this._messageSigning;
  }
}

export type WasmMonad<T> = {|
  wasmMap<R>(f: (T, Module) => R): WasmMonad<R>;
  unwrap<R>(f: (T, Module) => R): R;
|}

// Need this otherwise Wallet's flow type isn't properly exported
export const RustModule: Module = new Module();
