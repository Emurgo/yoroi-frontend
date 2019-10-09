// @flow

import { create, bodyParser, defaults } from 'json-server';
import BigNumber from 'bignumber.js';
import type {
  AddressUtxoRequest, AddressUtxoResponse,
  UtxoSumRequest, UtxoSumResponse,
  HistoryRequest, HistoryResponse,
  BestBlockRequest, BestBlockResponse,
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

    server.post('/api/v2/txs/history', async (
      req: {
        body: HistoryRequest
      },
      res: { send(arg: HistoryResponse): any }
    ): Promise<void> => {
      chai.assert.isTrue(_validateAddressesReq(req.body));

      const history = await mockImporter.history(req.body);
      // Returns a chunk of txs
      res.send(history.slice(0, txsLimit));
    });

    server.get('/api/v2/bestblock', async (
      req: {
        body: BestBlockRequest
      },
      res: { send(arg: BestBlockResponse): any }
    ): Promise<void> => {
      const bestBlock = await mockImporter.getBestBlock(req.body);
      res.send(bestBlock);
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

    server.post('/api/addresses/filterUsed', async (
      req: {
        body: FilterUsedRequest
      },
      res: { send(arg: FilterUsedResponse): any }
    ): Promise<void> => {
      const response = await mockImporter.usedAddresses(req.body);
      res.send(response);
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
