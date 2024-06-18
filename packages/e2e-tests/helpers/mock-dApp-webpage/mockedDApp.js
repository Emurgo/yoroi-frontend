import { buildSimpleTx } from './dAppHelper.js';
import {
  addressToCbor,
  addressesFromCborIfNeeded,
  getAmountInHex,
  getCSLPubKeyHash,
  getCslValue,
  getDRepIDHexAndBechFromHex,
  mapCborUtxos,
} from './dAppTxHelper.js';

class MockDAppWebpageError extends Error {}
/**
 * Controller of the mocked dApp
 * @constructor
 * @param {ThenableWebDriver} driver - The created selenium driver for a browser
 * @param {Logger} logger - A simple logger for logging
 */
export class MockDAppWebpage {
  constructor(driver, logger) {
    this.driver = driver;
    this.logger = logger;
  }

  async _requestAccess(auth = false) {
    this.logger.info(
      `MockDApp::_requestAccess Requesting the access ${auth ? 'with' : 'without'} authentication`
    );
    const scriptString = `window.accessRequestPromise = cardano.yoroi.enable(${
      auth ? '{requestIdentification: true}' : ''
    })`;
    await this.driver.executeScript(scriptString);
  }

  async getYoroiObject() {
    this.logger.info(`MockDApp::getYoroiObject Getting the yoroi object from the cardano object`);
    const yoroiObjResponse = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      const response = window.cardano.yoroi;
      if (response) {
        callback({ success: true, retValue: response, errMsg: null });
      } else {
        callback({ success: false, retValue: response, errMsg: null });
      }
    });
    this.logger.info(
      `MockDApp::getYoroiObject The response is ${JSON.stringify(yoroiObjResponse, null, 2)}`
    );
    return yoroiObjResponse;
  }

  async getChangeAddress() {
    this.logger.info(`MockDApp::getChangeAddress Getting the change address`);
    const changeAddressResponse = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.api
        .getChangeAddress()
        .then(addresses => {
          if (addresses.length === 0) {
            callback({ success: false, retValue: null, errMsg: 'No change addresses' });
          }
          callback({ success: true, retValue: addresses, errMsg: null });
        })
        .catch(error => {
          callback({ success: false, retValue: null, errMsg: error });
        });
    });
    this.logger.info(
      `MockDApp::getChangeAddress The response is ${JSON.stringify(changeAddressResponse, null, 2)}`
    );
    return changeAddressResponse;
  }

  async getRewardAddresses() {
    this.logger.info(`MockDApp::getRewardAddresses Getting the change address`);
    const rewardAddressesResponse = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.api
        .getRewardAddresses()
        .then(addresses => {
          if (addresses.length === 0) {
            callback({ success: false, retValue: null, errMsg: 'No reward addresses' });
          }
          callback({ success: true, retValue: addresses, errMsg: null });
        })
        .catch(error => {
          callback({ success: false, retValue: null, errMsg: error });
        });
    });
    this.logger.info(
      `MockDApp::getRewardAddresses The response is ${JSON.stringify(rewardAddressesResponse, null, 2)}`
    );
    return rewardAddressesResponse;
  }

  async getUTXOs(amount, convert = true) {
    this.logger.info(`MockDApp::getUTXOs Getting UTXOs. Amount: ${amount}`);
    const getUTXOsResponse = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.api
        .getUtxos(args[0])
        .then(utxosResponse => {
          if (utxosResponse === null) {
            callback({ success: true, retValue: null, errMsg: null });
          } else if (utxosResponse.length === 0) {
            callback({ success: true, retValue: utxosResponse, errMsg: 'NO UTXOS' });
          } else {
            callback({ success: true, retValue: utxosResponse, errMsg: null });
          }
        })
        .catch(err => {
          callback({ success: false, retValue: null, errMsg: err });
        });
    }, amount);
    if (getUTXOsResponse.success && convert) {
      const utxos = mapCborUtxos(getUTXOsResponse.retValue);
      getUTXOsResponse.retValue = utxos;
    }
    this.logger.info(
      `MockDApp::getUTXOs The walletUTXOsResponse: ${JSON.stringify(getUTXOsResponse, null, 2)}`
    );
    return getUTXOsResponse;
  }

  async requestUsedAddresses(page = 0, limit = 5) {
    this.logger.info(`MockDApp::requestUsedAddresses Getting used addresses`);
    await this.driver.executeScript(
      (...args) => {
        window.addressesPromise = window.api.getUsedAddresses({ page: args[0], limit: args[1] });
      },
      page,
      limit
    );
  }

  async requestUnusedAddresses() {
    this.logger.info(`MockDApp::requestUnusedAddresses Getting unused addresses`);
    await this.driver.executeScript(() => {
      window.addressesPromise = window.api.getUnusedAddresses();
    });
  }

  async getAddresses() {
    this.logger.info(`MockDApp::getAddresses Getting a result from window.addressesPromise`);
    const addressesResult = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.addressesPromise
        .then(
          // eslint-disable-next-line promise/always-return
          onSuccess => {
            callback({ success: true, retValue: onSuccess, errMsg: null });
          },
          onReject => {
            callback({ success: false, retValue: null, errMsg: onReject });
          }
        )
        .catch(err => {
          callback({ success: false, retValue: null, errMsg: err });
        });
    });
    if (addressesResult.success) {
      addressesResult.retValue = addressesFromCborIfNeeded(addressesResult.retValue);
    }
    this.logger.info(`MockDApp::getAddresses Result: ${JSON.stringify(addressesResult, null, 2)}`);
    return addressesResult;
  }

  async requestNonAuthAccess() {
    await this._requestAccess();
  }

  async requestAuthAccess() {
    await this._requestAccess(true);
  }

  async checkAccessRequest() {
    this.logger.info(`MockDApp::checkAccessRequest Checking the access request`);
    const accessResponse = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.accessRequestPromise
        .then(
          // eslint-disable-next-line promise/always-return
          api => {
            window.api = api;
            callback({ success: true, retValue: null, errMsg: null });
          },
          error => {
            callback({ success: false, retValue: null, errMsg: error });
          }
        )
        .catch(error => {
          callback({ success: false, retValue: null, errMsg: error });
        });
    });
    this.logger.info(
      `MockDApp::checkAccessRequest The access response: ${JSON.stringify(accessResponse, null, 2)}`
    );

    await this.driver.executeScript(accResp => {
      if (accResp.success) {
        window.walletConnected = true;
      } else {
        window.walletConnected = null;
      }
    }, accessResponse);

    if (accessResponse.success) {
      this.logger.info(`MockDApp::checkAccessRequest window.walletConnected = true is set`);
    } else {
      this.logger.info(`MockDApp::checkAccessRequest window.walletConnected = null is set`);
    }

    return accessResponse;
  }

  async addOnDisconnect() {
    this.logger.info(`MockDApp::addOnDisconnect Setting the onDisconnect hook`);
    await this.driver.executeScript(() => {
      window.api.experimental.onDisconnect(() => {
        window.walletConnected = false;
      });
    });
    this.logger.info(`MockDApp::addOnDisconnect onDisconnect hook is set`);
  }

  async isEnabled() {
    await this.driver.sleep(100);
    this.logger.info(`MockDApp::isEnabled Checking is a wallet enabled`);
    const isEnabledResponse = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.cardano.yoroi
        .isEnabled()
        .then(
          onSuccess => {
            callback({ success: true, retValue: onSuccess, errMsg: null });
          },
          onReject => {
            callback({ success: false, retValue: null, errMsg: onReject });
          }
        )
        .catch(error => {
          callback({ success: false, retValue: null, errMsg: error });
        });
    });
    this.logger.info(
      `MockDApp::isEnabled The wallet isEnabled response: ${JSON.stringify(isEnabledResponse, null, 2)}`
    );
    return isEnabledResponse;
  }

  async getConnectionState() {
    const states = [];
    this.logger.info(`MockDApp::getConnectionState Getting the connection state`);
    for (let i = 0; i < 10; i++) {
      this.logger.info(`MockDApp::getConnectionState Try ${i + 1} to get the connection state`);
      await this.driver.sleep(100);
      const walletConnectedState = await this.driver.executeScript(`return window.walletConnected`);
      this.logger.info(
        `MockDApp::getConnectionState Try ${i + 1} the connection state is ${JSON.stringify(walletConnectedState)}`
      );
      states.push(walletConnectedState);
    }
    const resultConnectionState = states.every(walletState => walletState === true);
    this.logger.info(
      `MockDApp::getConnectionState The connection state is ${JSON.stringify(resultConnectionState)}`
    );
    return resultConnectionState;
  }

  async getBalance() {
    this.logger.info(`MockDApp::getBalance Getting the balance`);
    const balanceResponse = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.api
        .getBalance()
        // eslint-disable-next-line promise/always-return
        .then(balanceCborHex => {
          callback({ success: true, retValue: balanceCborHex, errMsg: null });
        })
        .catch(err => {
          callback({ success: false, retValue: null, errMsg: err });
        });
    });
    this.logger.info(
      `MockDApp::getBalance The response is ${JSON.stringify(balanceResponse, null, 2)}`
    );
    if (balanceResponse.success) {
      const value = getCslValue(balanceResponse.retValue);
      const valueStr = value.coin().to_str();
      this.logger.info(`MockDApp::getBalance The balance is ${valueStr}`);
      balanceResponse.retValue = valueStr;
    }
    return balanceResponse;
  }

  async requestSigningTxHex(unsignedTxHex) {
    this.logger.info(
      `MockDApp::requestSigningTxHex Requesting signing the unsigned transaction "${unsignedTxHex}"`
    );
    this.driver.executeScript(uTxHex => {
      window.signTxPromise = window.api.signTx({ tx: uTxHex });
    }, unsignedTxHex);
  }

  async requestSigningTx(amount, toAddress) {
    this.logger.info(
      `MockDApp::requestSigningTx Requesting signing the transaction: amount="${amount}", toAddress="${toAddress}"`
    );

    const UTXOsreposne = await this.getUTXOs(amount, false);
    this.logger.info(
      `MockDApp::requestSigningTx The UTXOsreposne: ${JSON.stringify(UTXOsreposne, null, 2)}`
    );
    if (!UTXOsreposne.success || UTXOsreposne.retValue.length === 0) {
      this.logger.error(
        `MockDApp::requestSigningTx The error is received in UTXOsreposne: ${UTXOsreposne.errMsg}`
      );
      throw new MockDAppWebpageError(UTXOsreposne.errMsg);
    }

    const changeAddressResponse = await this.getChangeAddress();
    if (!changeAddressResponse.success) {
      this.logger.error(
        `MockDApp::requestSigningTx The error is received: ${changeAddressResponse.errMsg}`
      );
      throw new MockDAppWebpageError(changeAddressResponse.errMsg);
    }
    const changeAddressHex = changeAddressResponse.retValue;
    const { uTxHex, txFee } = buildSimpleTx(
      toAddress,
      amount,
      changeAddressHex,
      UTXOsreposne.retValue
    );

    await this.requestSigningTxHex(uTxHex);

    return { uTxHex, txFee };
  }

  async getSigningTxResult() {
    this.logger.info(`MockDApp::getSigningTxResult Getting signing result`);
    const signingResult = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.signTxPromise
        .then(
          // eslint-disable-next-line promise/always-return
          onSuccess => {
            callback({ success: true, retValue: onSuccess, errMsg: null });
          },
          onReject => {
            callback({ success: false, retValue: null, errMsg: onReject });
          }
        )
        .catch(err => {
          callback({ success: false, retValue: null, errMsg: err });
        });
    });
    this.logger.info(
      `MockDApp::getSigningTxResult Signing result: ${JSON.stringify(signingResult, null, 2)}`
    );
    return signingResult;
  }

  async requestSigningData(payload) {
    this.logger.info(`MockDApp::requestSigningData Requesting signing the data: data="${payload}"`);

    const addressesResponse = await this.getAddresses();

    let address;
    if (addressesResponse.retValue && addressesResponse.retValue.length > 0) {
      address = addressesResponse.retValue[0];
      this.logger.info(`MockDApp::requestSigningData Using the address ${address}`);
    } else {
      this.logger.error(
        `MockDApp::requestSigningData The error is received: No used or unused addresses`
      );
      throw new MockDAppWebpageError('There are no addresses to proceed');
    }

    address = addressToCbor(address);

    this.logger.info(`MockDApp::requestSigningData Signing address: ${address}`);

    let payloadHex;
    if (payload.startsWith('0x')) {
      payloadHex = Buffer.from(payload.replace('^0x', ''), 'hex').toString('hex');
    } else {
      payloadHex = Buffer.from(payload, 'utf8').toString('hex');
    }
    this.logger.info(`MockDApp::requestSigningData Payload HEX: ${payloadHex}`);

    const scriptString = `window.signDataPromise = window.api.signData(${JSON.stringify(address)}, ${JSON.stringify(
      payloadHex
    )});`;

    this.driver.executeScript(scriptString);
  }

  async getSigningDataResult() {
    this.logger.info(`MockDApp::getSigningDataResult Getting signing data result`);
    const signingResult = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.signDataPromise
        .then(
          onSuccess => {
            return callback({ success: true, retValue: onSuccess, errMsg: null });
          },
          onReject => {
            callback({ success: false, retValue: null, errMsg: onReject });
          }
        )
        .catch(err => {
          callback({ success: false, retValue: null, errMsg: err });
        });
    });
    this.logger.info(
      `MockDApp::getSigningDataResult Signing data result: ${JSON.stringify(signingResult, null, 2)}`
    );
    return signingResult;
  }

  async getCollateral(amount) {
    this.logger.info(`MockDApp::getCollateral Getting Collateral Utxos`);

    let convertedAmount = '';
    if (amount) {
      convertedAmount = getAmountInHex(amount);
    }

    const collateralResponse = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];

      window.api
        .getCollateral(args[0])
        .then(utxosResponse => {
          return callback({ success: true, retValue: utxosResponse, errMsg: null });
        })
        .catch(err => {
          callback({ success: false, retValue: null, errMsg: err });
        });
    }, convertedAmount);
    if (
      collateralResponse.success &&
      collateralResponse.retValue != null &&
      collateralResponse.retValue.length !== 0
    ) {
      const utxos = mapCborUtxos(collateralResponse.retValue);
      collateralResponse.retValue = utxos;
      this.logger.info(
        `MockDApp::getCollateral response: ${JSON.stringify(collateralResponse, null, 2)}`
      );
      return collateralResponse;
    }
    this.logger.error(
      `MockDApp::getCollateral Something went wrong: ${JSON.stringify(collateralResponse.errMsg, null, 2)}`
    );
    return collateralResponse;
  }

  async requestCollateral(amount) {
    this.logger.info(`MockDApp::requestCollateral Requesting collateral: data="${amount}"`);
    const scriptString = `window.collateralPromise = window.api.getCollateral(${amount});`;
    await this.driver.executeScript(scriptString);
  }

  async getCollateralResult() {
    this.logger.info(`MockDApp::getCollateralResult Getting collateral data result`);
    const collateralResult = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.collateralPromise
        .then(utxosResponse => {
          return callback({ success: true, retValue: utxosResponse, errMsg: null });
        })
        .catch(error => {
          return callback({ success: false, retValue: null, errMsg: error });
        });
    });
    if (
      collateralResult.success &&
      collateralResult.retValue != null &&
      collateralResult.retValue.length !== 0
    ) {
      const utxos = mapCborUtxos(collateralResult.retValue);
      return { success: true, retValue: utxos, errMsg: null };
    }
    this.logger.error(
      `MockDApp::getCollateralResult Something went wrong: ${JSON.stringify(collateralResult)}`
    );
    return collateralResult;
  }

  async submitTx(signedTxHex) {
    this.logger.info(`MockDApp::submitTx Submitting Tx "${signedTxHex}"`);
    const submitResponse = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      const sigTxHex = args[0];
      window.api
        .submitTx(sigTxHex)
        .then(transactionId => {
          callback({ success: true, retValue: transactionId, errMsg: null });
        })
        .catch(err => {
          callback({ success: false, retValue: null, errMsg: err });
        });
    }, signedTxHex);
    this.logger.info(
      `MockDApp::getBalance The response is ${JSON.stringify(submitResponse, null, 2)}`
    );
    return submitResponse;
  }

  async getNetworkId() {
    this.logger.info(`MockDApp::getNetworkId Getting the network Id`);
    const networkIdResponse = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.api
        .getNetworkId()
        .then(networkId => {
          callback({ success: true, retValue: networkId, errMsg: null });
        })
        .catch(err => {
          callback({ success: false, retValue: null, errMsg: err });
        });
    });
    this.logger.info(
      `MockDApp::getNetworkId The response is ${JSON.stringify(networkIdResponse, null, 2)}`
    );
    return networkIdResponse;
  }

  async getExtensions() {
    this.logger.info(`MockDApp::getExtensions Getting the network Id`);
    const extensionsResponse = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.api
        .getExtensions()
        .then(extensions => {
          callback({ success: true, retValue: extensions, errMsg: null });
        })
        .catch(err => {
          callback({ success: false, retValue: null, errMsg: err });
        });
    });
    this.logger.info(
      `MockDApp::getExtensions The response is ${JSON.stringify(extensionsResponse, null, 2)}`
    );
    return extensionsResponse;
  }

  async getPubDRepKey(convert = false) {
    this.logger.info(`MockDApp::getPubDRepKey Getting the wallet public DRep key`);
    const pubDRepKeyResponse = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.api.cip95
        .getPubDRepKey()
        .then(pubDRepKey => {
          callback({ success: true, retValue: pubDRepKey, errMsg: null });
        })
        .catch(err => {
          callback({ success: false, retValue: null, errMsg: err });
        });
    });
    if (pubDRepKeyResponse.success && convert) {
      pubDRepKeyResponse.retValue = getDRepIDHexAndBechFromHex(pubDRepKeyResponse.retValue);
    }
    this.logger.info(
      `MockDApp::getPubDRepKey The response is ${JSON.stringify(pubDRepKeyResponse, null, 2)}`
    );
    return pubDRepKeyResponse;
  }

  async getRegisteredPubStakeKeys(convert = false) {
    this.logger.info(`MockDApp::getRegisteredPubStakeKeys Getting registered public stake keys`);
    const response = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.api.cip95
        .getRegisteredPubStakeKeys()
        .then(registeredPubStakeKeys => {
          callback({ success: true, retValue: registeredPubStakeKeys, errMsg: null });
        })
        .catch(err => {
          callback({ success: false, retValue: null, errMsg: err });
        });
    });
    if (response.success && response.retValue.length > 0 && convert) {
      const regPubStakeKey = response.retValue[0];
      response.retValue = [getCSLPubKeyHash(regPubStakeKey).to_hex()];
    }
    this.logger.info(
      `MockDApp::getRegisteredPubStakeKeys The response is ${JSON.stringify(response, null, 2)}`
    );
    return response;
  }

  async getUnregisteredPubStakeKeys(convert = false) {
    this.logger.info(
      `MockDApp::getUnregisteredPubStakeKeys Getting unregistered public stake keys`
    );
    const response = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.api.cip95
        .getUnregisteredPubStakeKeys()
        .then(unregisteredPubStakeKeys => {
          callback({ success: true, retValue: unregisteredPubStakeKeys, errMsg: null });
        })
        .catch(err => {
          callback({ success: false, retValue: null, errMsg: err });
        });
    });
    if (response.success && response.retValue.length > 0 && convert) {
      const unregPubStakeKey = response.retValue[0];
      response.retValue = [getCSLPubKeyHash(unregPubStakeKey).to_hex()];
    }
    this.logger.info(
      `MockDApp::getUnregisteredPubStakeKeys The response is ${JSON.stringify(response, null, 2)}`
    );
    return response;
  }

  async requestSigningDataCIP95(address, payload) {
    this.logger.info(`MockDApp::requestSigningDataCIP95 Getting unregistered public stake keys`);
    this.logger.info(`MockDApp::requestSigningDataCIP95 Signing address: ${address}`);

    let payloadHex;
    if (payload.startsWith('0x')) {
      payloadHex = Buffer.from(payload.replace('^0x', ''), 'hex').toString('hex');
    } else {
      payloadHex = Buffer.from(payload, 'utf8').toString('hex');
    }
    this.logger.info(`MockDApp::requestSigningDataCIP95 Payload HEX: ${payloadHex}`);

    const scriptString = `window.signDataCIP95Promise = window.api.cip95.signData(${JSON.stringify(
      address
    )}, ${JSON.stringify(payloadHex)});`;

    this.driver.executeScript(scriptString);
  }

  async getSigningDataCIP95Result() {
    this.logger.info(`MockDApp::getSigningDataResult Getting signing data result`);
    const signingResult = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.signDataCIP95Promise
        .then(
          onSuccess => {
            return callback({ success: true, retValue: onSuccess, errMsg: null });
          },
          onReject => {
            callback({ success: false, retValue: null, errMsg: onReject });
          }
        )
        .catch(err => {
          callback({ success: false, retValue: null, errMsg: err });
        });
    });
    this.logger.info(
      `MockDApp::getSigningDataResult Signing data result: ${JSON.stringify(signingResult, null, 2)}`
    );
    return signingResult;
  }
}
