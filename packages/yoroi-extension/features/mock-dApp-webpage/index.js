// @flow

import { WebDriver } from 'selenium-webdriver';
import * as CardanoWasm from '@emurgo/cardano-serialization-lib-nodejs';
import { bytesToHex, getTtl, hexToBytes } from '../support/helpers/dapp-helpers';
import { MultiAsset, TransactionBuilder } from '@emurgo/cardano-serialization-lib-nodejs';
import type { DAppConnectorResponse } from '../support/helpers/dapp-helpers';

class MockDAppWebpageError extends Error {}

type ReducedAsset = {|
  policyId: any | string,
  name: any | string,
  amount: string,
  assetId: string,
|};

type Utxo = {|
  utxo_id: string, // concat tx_hash and tx_index
  tx_hash: string,
  tx_index: number,
  block_num?: number, // NOTE: not slot_no
  receiver: string,
  amount: string,
  dataHash?: string,
  assets: Array<ReducedAsset | any>,
|};

export class MockDAppWebpage {
  driver: WebDriver;
  logger: Object;

  constructor(driver: WebDriver, logger: Object) {
    this.driver = driver;
    this.logger = logger;
  }

  _transactionBuilder(): TransactionBuilder {
    this.logger.info('MockDApp: Calling the transaction builder');
    const transactionBuilder = CardanoWasm.TransactionBuilder.new(
      CardanoWasm.TransactionBuilderConfigBuilder.new()
        // all of these are taken from the mainnet genesis settings
        // linear fee parameters (a*size + b)
        .fee_algo(
          CardanoWasm.LinearFee.new(
            CardanoWasm.BigNum.from_str('44'),
            CardanoWasm.BigNum.from_str('155381')
          )
        )
        .coins_per_utxo_word(CardanoWasm.BigNum.from_str('34482'))
        .pool_deposit(CardanoWasm.BigNum.from_str('500000000'))
        .key_deposit(CardanoWasm.BigNum.from_str('2000000'))
        .max_value_size(5000)
        .max_tx_size(16384)
        .build()
    );
    this.logger.info('MockDApp: -> The transaction builder is created');
    return transactionBuilder;
  }

  async _requestAccess(auth: boolean = false) {
    this.logger.info(`MockDApp: Requesting the access ${auth ? 'with' : 'without'} authentication`);
    const scriptString = `window.accessRequestPromise = cardano.yoroi.enable(${
      auth ? '{requestIdentification: true}' : ''
    })`;
    await this.driver.executeScript(scriptString);
  }

  _addressToCbor(address: string): string {
    return bytesToHex(CardanoWasm.Address.from_bech32(address).to_bytes());
  }

  _addressesFromCborIfNeeded(addresses: Array<string>): Array<string> {
    this.logger.info(`MockDApp: Converting the addresses "${JSON.stringify(addresses)}" from CBOR`);
    const resultOfConverting = addresses.map(a =>
      CardanoWasm.Address.from_bytes(hexToBytes(a)).to_bech32()
    );
    this.logger.info(`MockDApp: -> Result of converting ${JSON.stringify(resultOfConverting)}`);
    return resultOfConverting;
  }

  _reduceWasmMultiAsset(
    multiAsset: MultiAsset | void,
    reducer: any,
    initValue: Array<any>
  ): Array<ReducedAsset | any> {
    this.logger.info(`MockDApp: Reduce multiAsset`);
    let result = initValue;
    if (multiAsset) {
      const policyIds = multiAsset.keys();
      for (let i = 0; i < policyIds.len(); i++) {
        const policyId = policyIds.get(i);
        const assets = multiAsset.get(policyId);
        if (assets) {
          const assetNames = assets.keys();
          for (let j = 0; j < assetNames.len(); j++) {
            const name = assetNames.get(j);
            const amount = assets.get(name);
            const policyIdHex = bytesToHex(policyId.to_bytes());
            const encodedName = bytesToHex(name.name());
            result = reducer(result, {
              policyId: policyIdHex,
              name: encodedName,
              amount: amount?.to_str(),
              assetId: `${policyIdHex}.${encodedName}`,
            });
          }
        }
      }
    }
    this.logger.info(`MockDApp: -> Reduced multiAsset ${JSON.stringify(result)}`);
    return result;
  }

  _mapCborUtxos(cborUtxos: Array<string>): Array<Utxo> {
    this.logger.info(`MockDApp: Mapping cborUTXOs "${JSON.stringify(cborUtxos)}" to UTXOs`);
    const mappedUtxos = cborUtxos.map(hex => {
      const u = CardanoWasm.TransactionUnspentOutput.from_bytes(hexToBytes(hex));
      const input = u.input();
      const output = u.output();
      const txHash = bytesToHex(input.transaction_id().to_bytes());
      const txIndex = input.index();
      const value = output.amount();
      return {
        utxo_id: `${txHash}${txIndex}`,
        tx_hash: txHash,
        tx_index: txIndex,
        receiver: output.address().to_bech32(),
        amount: value.coin().to_str(),
        assets: this._reduceWasmMultiAsset(
          value.multiasset(),
          (res, asset) => {
            res.push(asset);
            return res;
          },
          []
        ),
      };
    });
    this.logger.info(`MockDApp: -> Mapped UTXOs "${JSON.stringify(mappedUtxos)}"`);
    return mappedUtxos;
  }

  async _getChangeAddress(): Promise<string> {
    this.logger.info(`MockDApp: Getting the change address`);
    const changeAddresses = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.api
        .getChangeAddress()
        .then(addresses => {
          // eslint-disable-next-line promise/always-return
          if (addresses.length === 0) {
            callback({ success: false, errMsg: 'No change addresses' });
          }
          callback({ success: true, retValue: addresses });
        })
        .catch(error => {
          callback({ success: false, errMsg: error.message });
        });
    });
    if (changeAddresses.success) {
      const changeAddress = this._addressesFromCborIfNeeded([changeAddresses.retValue])[0];
      this.logger.info(`MockDApp: -> The change address is ${changeAddress}`);
      return changeAddress;
    }
    this.logger.error(`MockDApp: -> The error is received: ${changeAddresses.errMsg}`);
    throw new MockDAppWebpageError(changeAddresses.errMsg);
  }

  async _getUTXOs(amount?: string): Promise<Array<Utxo>> {
    this.logger.info(`MockDApp: Getting UTXOs`);
    const walletUTXOsResponse = (await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.api
        .getUtxos(args[0])
        .then(utxosResponse => {
          // eslint-disable-next-line promise/always-return
          if (utxosResponse.length === 0) {
            callback({ success: false, error: 'NO UTXOS', retValue: null });
          } else {
            callback({ success: true, retValue: utxosResponse, error: null });
          }
        })
        .catch(err => {
          callback({ success: false, error: JSON.stringify(err), retValue: null });
        });
    }, amount): DAppConnectorResponse);
    this.logger.info(
      `MockDApp: -> The walletUTXOsResponse: ${JSON.stringify(walletUTXOsResponse)}`
    );
    if (walletUTXOsResponse.success) {
      return this._mapCborUtxos(walletUTXOsResponse.retValue);
    }
    this.logger.error(`MockDApp: -> The error is received: ${walletUTXOsResponse.error}`);
    throw new MockDAppWebpageError(walletUTXOsResponse.error);
  }

  async requestUsedAddresses() {
    this.logger.info(`MockDApp: Getting used addresses`);
    await this.driver.executeScript(() => {
      window.addressesPromise = window.api.getUsedAddresses({ page: 0, limit: 5 });
    });
  }

  async requestUnusedAddresses() {
    this.logger.info(`MockDApp: Getting unused addresses`);
    await this.driver.executeScript(() => {
      window.addressesPromise = window.api.getUnusedAddresses();
    });
  }

  async requestNonAuthAccess() {
    await this._requestAccess();
  }

  async requestAuthAccess() {
    await this._requestAccess(true);
  }

  async checkAccessRequest(): Promise<DAppConnectorResponse> {
    this.logger.info(`MockDApp: Checking the access request`);
    const accessResponse = (await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.accessRequestPromise
        .then(
          // eslint-disable-next-line promise/always-return
          api => {
            window.api = api;
            callback({ success: true, error: null, retValue: null });
          },
          error => {
            callback({ success: false, error: error.message, retValue: null });
          }
        )
        .catch(error => {
          callback({ success: false, error: error.message, retValue: null });
        });
    }): DAppConnectorResponse);
    this.logger.info(`MockDApp: -> The access response: ${JSON.stringify(accessResponse)}`);

    await this.driver.executeScript(accResp => {
      if (accResp.success) {
        window.walletConnected = true;
      } else {
        window.walletConnected = null;
      }
    }, accessResponse);

    if (accessResponse.success) {
      this.logger.info(`MockDApp: -> window.walletConnected = true is set`);
    } else {
      this.logger.info(`MockDApp: -> window.walletConnected = null is set`);
    }

    return accessResponse;
  }

  async addOnDisconnect() {
    this.logger.info(`MockDApp: Setting the onDisconnect hook`);
    await this.driver.executeScript(() => {
      window.api.experimental.onDisconnect(() => {
        window.walletConnected = false;
      });
    });
    this.logger.info(`MockDApp: -> onDisconnect hook is set`);
  }

  async isEnabled(): Promise<boolean> {
    await this.driver.sleep(100);
    this.logger.info(`MockDApp: Checking is a wallet enabled`);
    const isEnabled = (await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.cardano.yoroi
        .isEnabled()
        .then(
          // eslint-disable-next-line promise/always-return
          onSuccess => {
            callback({ success: true, retValue: onSuccess, error: null });
          },
          onReject => {
            callback({ success: false, error: onReject.message, retValue: null });
          }
        )
        .catch(error => {
          callback({ success: false, error: error.message, retValue: null });
        });
    }): DAppConnectorResponse);
    if (isEnabled.success) {
      this.logger.info(`MockDApp: -> The request cardano.yoroi.isEnabled() is successful`);
      this.logger.info(`MockDApp: -> The wallet is enabled: ${isEnabled.retValue}`);
      return isEnabled.retValue;
    }
    this.logger.error(
      `MockDApp: -> The request cardano.yoroi.isEnabled() is unsuccessful. Error message: ${JSON.stringify(
        isEnabled
      )}`
    );
    throw new MockDAppWebpageError(isEnabled.error);
  }

  async getConnectionState(): Promise<boolean> {
    const states = [];
    this.logger.info(`MockDApp: Getting the connection state`);
    for (let i = 0; i < 10; i++) {
      this.logger.info(`MockDApp: -> Try ${i + 1} to get the connection state`);
      await this.driver.sleep(100);
      const walletConnectedState = await this.driver.executeScript(`return window.walletConnected`);
      this.logger.info(
        `MockDApp: -> Try ${i + 1} the connection state is ${JSON.stringify(walletConnectedState)}`
      );
      states.push(walletConnectedState);
    }
    const resultConnectionState = states.every(walletState => walletState === true);
    this.logger.info(
      `MockDApp: -> The connection state is ${JSON.stringify(resultConnectionState)}`
    );
    return resultConnectionState;
  }

  async getBalance(): Promise<string> {
    this.logger.info(`MockDApp: Getting the balance`);
    const balanceCborHex = (await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.api
        .getBalance()
        // eslint-disable-next-line promise/always-return
        .then(balance => {
          callback({ success: true, retValue: balance, error: null });
        })
        .catch(err => {
          callback({ success: false, error: err.message, retValue: null });
        });
    }): DAppConnectorResponse);
    if (balanceCborHex.success) {
      const value = CardanoWasm.Value.from_bytes(Buffer.from(balanceCborHex.retValue, 'hex'));
      const valueStr = value.coin().to_str();
      this.logger.info(`MockDApp: -> The balance is ${valueStr}`);
      return valueStr;
    }
    this.logger.error(
      `MockDApp: -> The error is received while getting the balance. Error: ${JSON.stringify(
        balanceCborHex
      )}`
    );
    throw new MockDAppWebpageError(balanceCborHex.error);
  }

  async requestSigningTx(amount: string, toAddress: string) {
    this.logger.info(
      `MockDApp: Requesting signing the transaction: amount="${amount}", toAddress="${toAddress}"`
    );
    const UTXOs = await this._getUTXOs(amount);
    const changeAddress = await this._getChangeAddress();
    const txBuilder = this._transactionBuilder();
    const utxo = UTXOs[0];

    const addr = CardanoWasm.Address.from_bech32(utxo.receiver);
    const baseAddr = CardanoWasm.BaseAddress.from_address(addr);
    if (!baseAddr) {
      this.logger.error(`MockDApp: -> The error is received: No baseAddr`);
      throw new MockDAppWebpageError('No baseAddr');
    }
    const keyHash = baseAddr.payment_cred().to_keyhash();
    if (!keyHash) {
      this.logger.error(`MockDApp: -> The error is received: No keyHash`);
      throw new MockDAppWebpageError('No keyHash');
    }

    txBuilder.add_key_input(
      keyHash,
      CardanoWasm.TransactionInput.new(
        CardanoWasm.TransactionHash.from_bytes(hexToBytes(utxo.tx_hash)), // tx hash
        utxo.tx_index // index
      ),
      CardanoWasm.Value.new(CardanoWasm.BigNum.from_str(utxo.amount))
    );

    const shelleyOutputAddress = CardanoWasm.Address.from_bech32(toAddress);
    const shelleyChangeAddress = CardanoWasm.Address.from_bech32(changeAddress);

    // add output to the tx
    txBuilder.add_output(
      CardanoWasm.TransactionOutput.new(
        shelleyOutputAddress,
        CardanoWasm.Value.new(CardanoWasm.BigNum.from_str(amount))
      )
    );
    const ttl = getTtl();
    txBuilder.set_ttl(ttl);
    // calculate the min fee required and send any change to an address
    txBuilder.add_change_if_needed(shelleyChangeAddress);

    const unsignedTransactionHex = bytesToHex(txBuilder.build_tx().to_bytes());
    this.logger.info(`MockDApp: -> unsignedTransactionHex: ${unsignedTransactionHex}`);

    this.driver.executeScript(unsignedTxHex => {
      window.signTxPromise = window.api.signTx({ tx: unsignedTxHex });
    }, unsignedTransactionHex);
  }

  async getSigningTxResult(): Promise<DAppConnectorResponse> {
    this.logger.info(`MockDApp: Getting signing result`);
    const signingResult = (await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.signTxPromise
        .then(
          // eslint-disable-next-line promise/always-return
          onSuccess => {
            callback({ success: true, retValue: onSuccess, error: null });
          },
          onReject => {
            callback({ success: false, retValue: null, error: onReject });
          }
        )
        .catch(err => {
          callback({ success: false, retValue: null, error: err });
        });
    }): DAppConnectorResponse);
    this.logger.info(`MockDApp: -> Signing result: ${JSON.stringify(signingResult)}`);
    return signingResult;
  }

  async requestSigningData(payload: string) {
    this.logger.info(`MockDApp: Requesting signing the data: data="${payload}"`);

    const addressesResponse = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.addressesPromise
        .then(addrs => {
          // eslint-disable-next-line promise/always-return
          if (addrs.length === 0) {
            callback({ success: false, errMsg: 'No addresses found' });
          }
          callback({ success: true, retValue: addrs });
        })
        .catch(error => {
          callback({ success: false, errMsg: error.message });
        });
    });

    let addresses;
    if (addressesResponse.success) {
      addresses = this._addressesFromCborIfNeeded(addressesResponse.retValue);
    }

    let address;
    if (addresses && addresses.length > 0) {
      address = addresses[0];
      this.logger.info(`MockDApp: Using the address ${address}`);
    } else {
      this.logger.error(`MockDApp: -> The error is received: No used or unused Addresses`);
      throw new MockDAppWebpageError('There are no addresses to proceed');
    }

    address = this._addressToCbor(address);

    this.logger.info(`MockDApp: -> Signing address: ${address}`);

    let payloadHex;
    if (payload.startsWith('0x')) {
      payloadHex = Buffer.from(payload.replace('^0x', ''), 'hex').toString('hex');
    } else {
      payloadHex = Buffer.from(payload, 'utf8').toString('hex');
    }
    this.logger.info(`MockDApp: -> Payload HEX: ${payloadHex}`);

    const scriptString = `window.signDataPromise = window.api.signData(${JSON.stringify(
      address
    )}, ${JSON.stringify(payloadHex)});`;

    this.driver.executeScript(scriptString);
  }

  async getSigningDataResult(): Promise<DAppConnectorResponse> {
    this.logger.info(`MockDApp: Getting signing data result`);
    const signingResult = (await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.signDataPromise
        .then(
          onSuccess => {
            return callback({ success: true, retValue: onSuccess, error: null });
          },
          onReject => {
            callback({ success: false, retValue: null, error: onReject });
          }
        )
        .catch(err => {
          callback({ success: false, retValue: null, error: err });
        });
    }): DAppConnectorResponse);
    this.logger.info(`MockDApp: -> Signing result: ${JSON.stringify(signingResult)}`);
    return signingResult;
  }

  async getCollateral(amount: string): Promise<DAppConnectorResponse> {
    this.logger.info(`MockDApp: Getting Collateral Utxos`);

    const convertedAmount = Buffer.from(
      CardanoWasm.Value.new(CardanoWasm.BigNum.from_str(amount)).to_bytes()
    ).toString('hex');

    const collateralResponse = (await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];

      window.api
        .getCollateral(args[0])
        .then(utxosResponse => {
          return callback({ success: true, retValue: utxosResponse, error: null });
        })
        .catch(err => {
          callback({ success: false, error: err, retValue: null });
        });
    }, convertedAmount): DAppConnectorResponse);
    if (
      collateralResponse.success &&
      collateralResponse.retValue != null &&
      collateralResponse.retValue.length !== 0
    ) {
      const utxos = this._mapCborUtxos(collateralResponse.retValue);
      return { success: true, retValue: utxos, error: null };
    }
    this.logger.error(`MockDApp: -> Something went wrong: ${JSON.stringify(collateralResponse.error)}`);
    return collateralResponse;
  }

  async addCollateral(amount: string) {
    this.logger.info(`MockDApp: Requesting collateral: data="${amount}"`);
    const scriptString = `window.collateralPromise = window.api.getCollateral(${amount});`;
    await this.driver.executeScript(scriptString);
  }

  async getCollateralResult(): Promise<DAppConnectorResponse> {
    this.logger.info(`MockDApp: Getting collateral data result`);
    const collateralResult = (await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.collateralPromise
        .then(utxosResponse => {
          return callback({ success: true, retValue: utxosResponse, error: null });
        })
        .catch(error => {
          return callback({ success: false, error, retValue: null });
        });
    }): DAppConnectorResponse);
    if (
      collateralResult.success &&
      collateralResult.retValue != null &&
      collateralResult.retValue.length !== 0
    ) {
      const utxos = this._mapCborUtxos(collateralResult.retValue);
      return { success: true, retValue: utxos, error: null };
    }
    this.logger.error(`MockDApp: -> Something went wrong: ${JSON.stringify(collateralResult)}`);
    return collateralResult;
  }
}
