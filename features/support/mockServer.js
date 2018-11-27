// @flow

import { create, bodyParser, defaults } from 'json-server';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import { getFeatureData, getTxsMapList } from './mockDataBuilder';
import type {
  txsUtxoForAddressesInput, txsUtxoForAddressesOutput,
  txsUtxoSumForAddressessInput, txsUtxoSumForAddressesOutput,
  txsHistoryInput, txsHistoryOutput,
  txsSignedInput, txsSignedOutput,
  addressesFilterUsedInput, addressesFilterUsedOutput
} from '../../app/api/ada/lib/yoroi-backend-api';

const middlewares = [...defaults(), bodyParser];

const port = 8080;

// MockData should always be consistent with the following values
const addressesLimit = 50;
const txsLimit = 20;

function _validateAddressesReq(
  { addresses }: { addresses: Array<string> } = {}
): boolean {
  if (!addresses || addresses.length > addressesLimit || addresses.length === 0) {
    throw new Error('Addresses request length should be (0, ' + addressesLimit + ']');
  }
  // TODO: Add address validation
  return true;
}

function _validateDatetimeReq(
  { dateFrom }: { dateFrom: Date } = {}
): boolean {
  if (!dateFrom || !moment(dateFrom).isValid()) {
    throw new Error('DateFrom should be a valid datetime');
  }
  return true;
}

function _defaultSignedTransaction(
  req: {
    body: txsSignedInput
  },
  res: { send(arg: txsSignedOutput): Response }
): void {
  res.send([]);
}

let MockServer = null;

export function getMockServer(
  settings: {
    signedTransaction?: (
      req: {
        body: txsSignedInput
      },
      res: {
        send(arg: txsSignedOutput): any,
        status: Function
      }
    ) => void
  }
) {
  if (!MockServer) {
    const server = create();

    server.use(middlewares);

    server.post('/api/txs/utxoForAddresses', (
      req: {
        body: txsUtxoForAddressesInput
      },
      res: { send(arg: txsUtxoForAddressesOutput): any }
    ): void => {
      const { utxos } = getFeatureData();
      const filteredUtxos = utxos
        ? utxos.filter(utxo => req.body.addresses.includes(utxo.receiver))
        : [];
      res.send(filteredUtxos);
    });

    server.post('/api/txs/utxoSumForAddresses', (
      req: {
        body: txsUtxoSumForAddressessInput
      },
      res: { send(arg: txsUtxoSumForAddressesOutput): any }
    ): void => {
      _validateAddressesReq(req.body);
      const utxos = getFeatureData().utxos;
      const sumUtxos = !utxos ? 0 : utxos.reduce((sum, utxo) => {
        if (req.body.addresses.includes(utxo.receiver)) {
          return new BigNumber(utxo.amount).plus(sum);
        }
        return sum;
      }, new BigNumber(0));
      res.send({ sum: sumUtxos.toString() });
    });

    server.post('/api/txs/history', (
      req: {
        body: txsHistoryInput
      },
      res: { send(arg: txsHistoryOutput): any }
    ): void => {
      _validateAddressesReq(req.body);
      _validateDatetimeReq(req.body);
      const txsMapList = getTxsMapList(req.body.addresses);
      // Filters all txs according to hash and date
      const filteredTxs = txsMapList.filter(txMap => (
        req.body.addresses.includes(txMap.address) &&
          moment(txMap.tx.last_update) > moment(req.body.dateFrom)
      )).map(txMap => txMap.tx);
      // Returns a chunk of txs
      res.send(filteredTxs.slice(0, txsLimit));
    });

    server.post('/api/txs/signed', settings.signedTransaction ?
      settings.signedTransaction : _defaultSignedTransaction);

    server.post('/api/addresses/filterUsed', (
      req: {
        body: addressesFilterUsedInput
      },
      res: { send(arg: addressesFilterUsedOutput): any }
    ): void => {
      const usedAddresses = getFeatureData().usedAddresses;
      const filteredAddresses = usedAddresses
        ? usedAddresses.filter((address) => (
          req.body.addresses.includes(address)
        ))
        : [];
      res.send(filteredAddresses);
    });

    MockServer = server.listen(port, () => {
      console.log(`JSON Server is running at ${port}`);
    });
  }
  return MockServer;
}

export function closeMockServer() {
  if (MockServer) {
    MockServer.close();
    MockServer = null;
  }
}
