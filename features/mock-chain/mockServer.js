// @flow

import { create, bodyParser, defaults } from 'json-server';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import type {
  AddressUtxoRequest, AddressUtxoResponse,
  UtxoSumRequest, UtxoSumResponse,
  HistoryRequest, HistoryResponse,
  SignedRequest, SignedResponse,
  FilterUsedRequest, FilterUsedResponse,
  ServerStatusResponse
} from '../../app/api/ada/lib/state-fetch/types';
import chai from 'chai';
import mockImporter from './mockImporter';

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

export const signedTransactionHandler = [];
export const utxoForAddressesHook = [];

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
    ) => void,
    // Whether to output request logs. Defaults to false.
    outputLog?: boolean
  }
) {
  if (!MockServer) {
    const middlewares = [...defaults({ logger: !!settings.outputLog }), bodyParser];

    const server = create();

    server.use(middlewares);

    server.post('/api/txs/utxoForAddresses', (
      req: {
        body: AddressUtxoRequest
      },
      res: { send(arg: AddressUtxoResponse): any }
    ): void => {
      chai.assert.isTrue(_validateAddressesReq(req.body));
      const utxoForAddresses = mockImporter.utxoForAddresses();
      let filteredUtxos = Object.keys(utxoForAddresses)
        .filter(addr => req.body.addresses.includes(addr))
        .map(addr => utxoForAddresses[addr])
        .reduce((utxos, arr) => {
          utxos.push(...arr);
          return utxos;
        }, []);
      if (utxoForAddressesHook.length) {
        filteredUtxos = utxoForAddressesHook.pop()(filteredUtxos);
      }
      res.send(filteredUtxos);
    });

    server.post('/api/txs/utxoSumForAddresses', (
      req: {
        body: UtxoSumRequest
      },
      res: { send(arg: UtxoSumResponse): any }
    ): void => {
      chai.assert.isTrue(_validateAddressesReq(req.body));
      const utxoSumForAddresses = mockImporter.utxoSumForAddresses();
      const sumUtxos = Object.keys(utxoSumForAddresses)
        .filter(addr => req.body.addresses.includes(addr))
        .map(addr => utxoSumForAddresses[addr])
        .map(val => (val != null ? new BigNumber(val) : new BigNumber(0)))
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
      const history = mockImporter.history();
      const filteredTxs = history.filter(tx => {
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

    server.post('/api/txs/signed', (
      req: {
        body: SignedRequest
      },
      res: { send(arg: SignedResponse): any, status: Function }
    ): void => {
      if (signedTransactionHandler.length) {
        signedTransactionHandler.pop()(req, res);
      } else if (settings.signedTransaction) {
        settings.signedTransaction(req, res);
      } else {
        _defaultSignedTransaction(req, res);
      }
    });

    server.post('/api/addresses/filterUsed', (
      req: {
        body: FilterUsedRequest
      },
      res: { send(arg: FilterUsedResponse): any }
    ): void => {
      const usedAddresses = mockImporter.usedAddresses();
      const filteredAddresses = req.body.addresses
        .filter((address) => usedAddresses.has(address));
      res.send(filteredAddresses);
    });

    server.get('/api/status', (
      req,
      res: { send(arg: ServerStatusResponse): any }
    ): void => {
      const isServerOk = mockImporter.getApiStatus();
      res.send({ isServerOk });
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
