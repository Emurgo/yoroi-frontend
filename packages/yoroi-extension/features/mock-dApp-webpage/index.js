// @flow

import { WebDriver } from 'selenium-webdriver';
import * as CardanoWasm from '@emurgo/cardano-serialization-lib-browser';
// // eslint-disable-next-line import/named
import { bytesToHex, getTtl, hexToBytes } from '../support/helpers/dapp-helpers';

const AMOUNT_TO_SEND = '1000000';
const SEND_TO_ADDRESS =
  'addr_test1qz8xh9w6f2vdnp89xzqlxnusldhz6kdm4rp970gl8swwjjkr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0q4lztj0';

class MockDAppWebpageError extends Error {}

type AccessCallBack = {|
  success: boolean,
  errMsg?: string,
|};

export class MockDAppWebpage {
  driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  _transactionBuilder() {
    return CardanoWasm.TransactionBuilder.new(
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
  }

  async _requestAccess(auth: boolean = false) {
    const scriptString = `window.accessRequestPromise = cardano.yoroi.enable(${
      auth ? '{requestIdentification: true}' : ''
    })`;
    await this.driver.executeScript(scriptString);
  }

  _addressesFromCborIfNeeded(addresses) {
    return addresses.map(a => CardanoWasm.Address.from_bytes(hexToBytes(a)).to_bech32());
  }

  _reduceWasmMultiasset(multiasset, reducer, initValue) {
    let result = initValue;
    if (multiasset) {
      const policyIds = multiasset.keys();
      for (let i = 0; i < policyIds.len(); i++) {
        const policyId = policyIds.get(i);
        const assets = multiasset.get(policyId);
        const assetNames = assets.keys();
        for (let j = 0; j < assetNames.len(); j++) {
          const name = assetNames.get(j);
          const amount = assets.get(name);
          const policyIdHex = bytesToHex(policyId.to_bytes());
          const encodedName = bytesToHex(name.name());
          result = reducer(result, {
            policyId: policyIdHex,
            name: encodedName,
            amount: amount.to_str(),
            assetId: `${policyIdHex}.${encodedName}`,
          });
        }
      }
    }
    return result;
  }

  _mapCborUtxos(cborUtxos) {
    return cborUtxos.map(hex => {
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
        assets: this._reduceWasmMultiasset(
          value.multiasset(),
          (res, asset) => {
            res.push(asset);
            return res;
          },
          []
        ),
      };
    });
  }

  async _getChangeAddress() {
    const changeAddresses = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.api
        .getChangeAddress()
        .then(addresses => {
          // eslint-disable-next-line promise/always-return
          if (addresses.length === 0) {
            throw new MockDAppWebpageError('No change addresses');
          }
          callback(addresses);
        })
        .catch(error => {
          throw new MockDAppWebpageError(JSON.stringify(error));
        });
    });
    return this._addressesFromCborIfNeeded([changeAddresses])[0];
  }

  async _getUTXOs() {
    const walletUTXOsResponse = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.api
        .getUtxos()
        .then(utxosResponse => {
          // eslint-disable-next-line promise/always-return
          if (utxosResponse.length === 0) {
            throw new MockDAppWebpageError('NO UTXOS');
          } else {
            callback(utxosResponse);
          }
        })
        .catch(error => {
          throw new MockDAppWebpageError(JSON.stringify(error));
        });
    });
    return this._mapCborUtxos(walletUTXOsResponse);
  }

  async requestNonAuthAccess() {
    await this._requestAccess();
  }

  async requestAuthAccess() {
    await this._requestAccess(true);
  }

  async checkAccessRequest(): Promise<AccessCallBack> {
    return await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.accessRequestPromise
        // eslint-disable-next-line promise/always-return
        .then(api => {
          window.api = api;
          callback({ success: true });
        })
        .catch(error => {
          callback({ success: false, errMsg: error.message });
        });
    });
  }

  async getBalance(): Promise<string> {
    const balanceCborHex = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.api
        .getBalance()
        // eslint-disable-next-line promise/always-return
        .then(balance => {
          callback(balance);
        })
        .catch(error => {
          throw new MockDAppWebpageError(JSON.stringify(error));
        });
    });

    const value = CardanoWasm.Value.from_bytes(Buffer.from(balanceCborHex, 'hex'));
    return value.coin().to_str();
  }

  async signTx() {
    const UTXOs = await this._getUTXOs();
    const changeAddress = await this._getChangeAddress();
    const txBuilder = this._transactionBuilder();
    const utxo = UTXOs[0];

    const addr = CardanoWasm.Address.from_bech32(utxo.receiver);
    const baseAddr = CardanoWasm.BaseAddress.from_address(addr);
    const keyHash = baseAddr.payment_cred().to_keyhash();

    txBuilder.add_key_input(
      keyHash,
      CardanoWasm.TransactionInput.new(
        CardanoWasm.TransactionHash.from_bytes(hexToBytes(utxo.tx_hash)), // tx hash
        utxo.tx_index // index
      ),
      CardanoWasm.Value.new(CardanoWasm.BigNum.from_str(utxo.amount))
    );

    const shelleyOutputAddress = CardanoWasm.Address.from_bech32(SEND_TO_ADDRESS);
    // error is here
    const shelleyChangeAddress = CardanoWasm.Address.from_bech32(changeAddress);

    // add output to the tx
    txBuilder.add_output(
      CardanoWasm.TransactionOutput.new(
        shelleyOutputAddress,
        CardanoWasm.Value.new(CardanoWasm.BigNum.from_str(AMOUNT_TO_SEND))
      )
    );
    const ttl = getTtl();
    txBuilder.set_ttl(ttl);
    // calculate the min fee required and send any change to an address
    txBuilder.add_change_if_needed(shelleyChangeAddress);

    const unsignedTransactionHex = bytesToHex(txBuilder.build_tx().to_bytes());

    await this.driver.executeAsyncScript((unsignedTxHex, ...args) => {
      const callback = args[args.length - 1];
      window.api
        .signTx({ tx: unsignedTxHex })
        // eslint-disable-next-line promise/always-return
        .then(responseHex => {
          callback(responseHex);
        })
        .catch(error => {
          throw new MockDAppWebpageError(JSON.stringify(error));
        });
    }, unsignedTransactionHex);
  }
}
