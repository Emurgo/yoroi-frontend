// @flow

import { create, bodyParser, defaults } from 'json-server';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import type {
  AddressUtxoRequest, AddressUtxoResponse,
  UtxoSumRequest, UtxoSumResponse,
  HistoryRequest, HistoryResponse,
  SignedRequest, SignedResponse,
  FilterUsedRequest, FilterUsedResponse
} from '../../app/api/ada/lib/state-fetch/types';
import chai from 'chai';
import mockImporter from './mockImporter';

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
    body: SignedRequest
  },
  res: { send(arg: SignedResponse): any }
): void {
  res.send({ txId: 'id' });
}

let MockServer = null;

export function getMockServer(
  settings: {
    signedTransaction?: (
      req: {
        body: SignedRequest
      },
      res: {
        send(arg: SignedResponse): any,
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
        body: AddressUtxoRequest
      },
      res: { send(arg: AddressUtxoResponse): any }
    ): void => {
      chai.assert.isTrue(_validateAddressesReq(req.body));
      const filteredUtxos = Object.keys(mockImporter.utxoForAddresses)
        .filter(addr => req.body.addresses.includes(addr))
        .map(addr => mockImporter.utxoForAddresses[addr])
        .reduce((utxos, arr) => {
          utxos.push(...arr);
          return utxos;
        }, []);
      res.send(filteredUtxos);
    });

    server.post('/api/txs/utxoSumForAddresses', (
      req: {
        body: UtxoSumRequest
      },
      res: { send(arg: UtxoSumResponse): any }
    ): void => {
      chai.assert.isTrue(_validateAddressesReq(req.body));
      const sumUtxos = Object.keys(mockImporter.utxoSumForAddresses)
        .filter(addr => req.body.addresses.includes(addr))
        .map(addr => mockImporter.utxoSumForAddresses[addr])
        .map(val => (val ? new BigNumber(val) : new BigNumber(0)))
        .reduce((sum, value) => value.plus(sum), new BigNumber(0));
      const result = sumUtxos.isZero() ? null : sumUtxos.toString();
      res.send({ sum: result });
    });

    server.post('/api/txs/history', (
      req: {
        body: HistoryRequest
      },
      res: { send(arg: HistoryResponse): any }
    ): void => {
      chai.assert.isTrue(_validateAddressesReq(req.body));
      chai.assert.isTrue(_validateDatetimeReq(req.body));

      const addressSet = new Set(req.body.addresses);
      const filteredTxs = mockImporter.history.filter(tx => {
        if (moment(tx.last_update) < moment(req.body.dateFrom)) {
          return false;
        }
        const includesAddress = tx.inputs_address.some(elem => addressSet.has(elem))
          || tx.outputs_address.some(elem => addressSet.has(elem));
        return includesAddress;
      });
      // Returns a chunk of txs
      res.send(filteredTxs.slice(0, txsLimit));
    });

    server.post('/api/txs/signed', settings.signedTransaction ?
      settings.signedTransaction : _defaultSignedTransaction);

    server.post('/api/addresses/filterUsed', (
      req: {
        body: FilterUsedRequest
      },
      res: { send(arg: FilterUsedResponse): any }
    ): void => {
      const filteredAddresses = req.body.addresses
        .filter((address) => mockImporter.usedAddresses.has(address));
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
