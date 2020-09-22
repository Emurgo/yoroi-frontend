// @flow

import { create, bodyParser, defaults } from 'json-server';
import type {
  AddressUtxoRequest, AddressUtxoResponse,
  UtxoSumRequest, UtxoSumResponse,
  HistoryRequest, HistoryResponse,
  BestBlockRequest, BestBlockResponse,
  SignedResponse,
} from '../../app/api/ergo/lib/state-fetch/types';
import type {
  FilterUsedRequest, FilterUsedResponse,
} from '../../app/api/common/lib/state-fetch/currencySpecificTypes';
import type {
  ServerStatusResponse,
} from '../../app/api/common/lib/state-fetch/types';
import chai from 'chai';
import mockImporter from './mockErgoImporter';

import { Ports } from '../../scripts/connections';

// MockData should always be consistent with the following values
const addressesLimit = 50;
const txsLimit = 20;

function _validateAddressesReq(
  { addresses }: { addresses: Array<string>, ... } = {}
): boolean {
  if (!addresses || addresses.length > addressesLimit || addresses.length === 0) {
    throw new Error('Addresses request length should be (0, ' + addressesLimit + ']');
  }
  // TODO: Add address validation
  return true;
}

// function _defaultSignedTransaction(
//   req: { body: SignedRequestInternal, ... },
//   res: { send(arg: SignedResponse): any, ... }
// ): void {
//   const response = mockImporter.sendTx(req.body);
//   res.send(response);
// }

const expectedTxBase64 = [];

export function setExpectedTx(signedTx: void | string): void {
  if (signedTx == null) {
    // remove all elements from the array
    expectedTxBase64.splice(0, expectedTxBase64.length);
  } else {
    expectedTxBase64[0] = signedTx;
  }
}

// TODO: no type from json-server
let MockServer: null | any = null;

export function getMockServer(
  settings: {
    // signedTransaction?: (
    //   req: { body: SignedRequestInternal, ... },
    //   res: {
    //     send(arg: SignedResponse): any,
    //     status: Function,
    //     ...
    //   }
    // ) => void,
    // Whether to output request logs. Defaults to false.
    outputLog?: boolean,
    ...
  }
): typeof MockServer {
  if (!MockServer) {
    const middlewares = [...defaults({ logger: !!settings.outputLog }), bodyParser];

    const server = create();

    server.use(middlewares);

    // server.post('/api/txs/utxoForAddresses', async (
    //   req: { body: AddressUtxoRequest, ... },
    //   res: { send(arg: AddressUtxoResponse): any, ... }
    // ): Promise<void> => {
    //   chai.assert.isTrue(_validateAddressesReq(req.body));
    //   const utxoForAddresses = await mockImporter.utxoForAddresses(req.body);
    //   res.send(utxoForAddresses);
    // });

    // server.post('/api/txs/utxoSumForAddresses', async (
    //   req: { body: UtxoSumRequest, ... },
    //   res: { send(arg: UtxoSumResponse): any, ... }
    // ): Promise<void> => {
    //   chai.assert.isTrue(_validateAddressesReq(req.body));
    //   const utxoSumForAddresses = await mockImporter.utxoSumForAddresses(req.body);
    //   res.send(utxoSumForAddresses);
    // });

    server.post('/api/v2/txs/history', async (
      req: { body: HistoryRequest, ... },
      res: { send(arg: HistoryResponse): any, ... }
    ): Promise<void> => {
      // chai.assert.isTrue(_validateAddressesReq(req.body));

      // const history = await mockImporter.history(req.body);
      // // Returns a chunk of txs
      // res.send(history.slice(0, txsLimit));
      res.send([]);
    });

    server.get('/api/v2/bestblock', async (
      req: { body: BestBlockRequest, ... },
      res: { send(arg: BestBlockResponse): any, ... }
    ): Promise<void> => {
      // const bestBlock = await mockImporter.getBestBlock(req.body);
      // res.send(bestBlock);
      res.send({
        hash: '52f9dceef506a2fcd5bbe2c0db31f9267f970e237c8f99cee96d8e668615d9c2',
        height: 0,
        epoch: 0,
        slot: 0,
      });
    });

    // server.post('/api/txs/signed', (
    //   req: { body: SignedRequestInternal, ... },
    //   res: {
    //     send(arg: SignedResponse): any,
    //     status: Function,
    //     ...
    //   }
    // ): void => {
    //   // note: don't use this in practice because ttl makes the tx hash computer-time-sensitive
    //   if (expectedTxBase64.length !== 0 && expectedTxBase64[0] !== req.body.signedTx) {
    //     throw new Error(`Wrong transaction payload. Expected ${expectedTxBase64[0]} and found ${req.body.signedTx}`);
    //   }
    //   if (settings.signedTransaction) {
    //     settings.signedTransaction(req, res);
    //   } else {
    //     _defaultSignedTransaction(req, res);
    //   }
    // });

    server.post('/api/v2/addresses/filterUsed', async (
      req: { body: FilterUsedRequest, ... },
      res: { send(arg: FilterUsedResponse): any, ... }
    ): Promise<void> => {
      // const response = await mockImporter.usedAddresses(req.body);
      // res.send(response);
      res.send([]);
    });

    // server.get('/api/status', (
    //   req,
    //   res: { send(arg: ServerStatusResponse): any, ... }
    // ): void => {
    //   const status = mockImporter.getApiStatus();
    //   res.send(status);
    // });

    MockServer = server.listen(Ports.ErgoMockServer, () => {
      // eslint-disable-next-line no-console
      console.log(`JSON Server is running at ${Ports.ErgoMockServer}`);
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
