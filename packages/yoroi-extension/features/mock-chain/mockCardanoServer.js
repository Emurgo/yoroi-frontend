// @flow

import { create, bodyParser, defaults } from 'json-server';
import type {
  AddressUtxoRequest,
  AddressUtxoResponse,
  UtxoSumRequest,
  UtxoSumResponse,
  HistoryRequest,
  HistoryResponse,
  AccountStateRequest,
  AccountStateResponse,
  PoolInfoRequest,
  PoolInfoResponse,
  RewardHistoryRequest,
  RewardHistoryResponse,
  BestBlockRequest,
  BestBlockResponse,
  SignedResponse,
  SignedRequestInternal,
} from '../../app/api/ada/lib/state-fetch/types';
import type {
  FilterUsedRequest,
  FilterUsedResponse,
} from '../../app/api/common/lib/state-fetch/currencySpecificTypes';
import type { ServerStatusResponse } from '../../app/api/common/lib/state-fetch/types';
import chai from 'chai';
import mockImporter from './mockCardanoImporter';
import { installCoinPriceRequestHandlers } from './coinPriceRequestHandler';

import { Ports } from '../../scripts/connections';

import { getCircularReplacer, getLogDate } from '../support/helpers/helpers';
import { testRunsDataDir } from '../support/helpers/common-constants';

const simpleNodeLogger = require('simple-node-logger');
const fs = require('fs');

// MockData should always be consistent with the following values
const addressesLimit = 50;
const txsLimit = 20;

let logger;

function _validateAddressesReq({ addresses }: { addresses: Array<string>, ... } = {}): boolean {
  logger.info(`mockCardanoServer: Validate Addresses request`);
  if (!addresses || addresses.length > addressesLimit || addresses.length === 0) {
    throw new Error('Addresses request length should be (0, ' + addressesLimit + ']');
  }
  // TODO: Add address validation
  return true;
}

function _defaultSignedTransaction(
  req: { body: SignedRequestInternal, ... },
  res: { send(arg: SignedResponse): any, ... }
): void {
  logger.info(`mockCardanoServer: Default Signed Transaction`);
  logger.info(`mockCardanoServer: mockImporter.sendTx -> request`);
  logger.info(JSON.stringify(req.body));
  const response = mockImporter.sendTx(req.body);
  logger.info(`mockCardanoServer: mockImporter.sendTx -> response`);
  logger.info(JSON.stringify(response));
  res.send(response);
}

const expectedTxBase64 = [];

export function setExpectedTx(signedTx: void | string): void {
  logger.info(`mockCardanoServer: Set expected transaction`);
  if (signedTx == null) {
    // remove all elements from the array
    expectedTxBase64.splice(0, expectedTxBase64.length);
  } else {
    expectedTxBase64[0] = signedTx;
  }
}

// TODO: no type from json-server
let MockServer: null | any = null;

export function getMockServer(settings: {
  signedTransaction?: (
    req: { body: SignedRequestInternal, ... },
    res: {
      send(arg: SignedResponse): any,
      status: Function,
      ...
    }
  ) => void,
  // Whether to output request logs. Defaults to false.
  outputLog?: boolean,
  ...
}): typeof MockServer {
  const dir = `${testRunsDataDir}_cardanoMockServerLogs`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const loggerPath = `${dir}/cardanoMockServerLog_${getLogDate()}.log`;

  logger = simpleNodeLogger.createSimpleFileLogger(loggerPath);
  if (!MockServer) {
    const middlewares = [...defaults({ logger: !!settings.outputLog }), bodyParser];

    const server = create();
    logger.info(`mockCardanoServer: JSON Server Created`);

    server.use(middlewares);

    server.post(
      '/api/txs/utxoForAddresses',
      async (
        req: { body: AddressUtxoRequest, ... },
        res: { send(arg: AddressUtxoResponse): any, ... }
      ): Promise<void> => {
        chai.assert.isTrue(_validateAddressesReq(req.body));
        logger.info(`mockCardanoServer: /api/txs/utxoForAddresses -> request`);
        logger.info(JSON.stringify(req.body));
        const utxoForAddresses = await mockImporter.utxoForAddresses(req.body);
        logger.info(`mockCardanoServer: /api/txs/utxoForAddresses -> response`);
        logger.info(JSON.stringify(utxoForAddresses));
        res.send(utxoForAddresses);
      }
    );

    server.post(
      '/api/txs/utxoSumForAddresses',
      async (
        req: { body: UtxoSumRequest, ... },
        res: { send(arg: UtxoSumResponse): any, ... }
      ): Promise<void> => {
        chai.assert.isTrue(_validateAddressesReq(req.body));
        logger.info(`mockCardanoServer: /api/txs/utxoSumForAddresses -> request`);
        logger.info(JSON.stringify(req.body));
        const utxoSumForAddresses = await mockImporter.utxoSumForAddresses(req.body);
        logger.info(`mockCardanoServer: /api/txs/utxoSumForAddresses -> response`);
        logger.info(JSON.stringify(utxoSumForAddresses));
        res.send(utxoSumForAddresses);
      }
    );

    server.post(
      '/api/v2/txs/history',
      async (
        req: { body: HistoryRequest, ... },
        res: { send(arg: HistoryResponse): any, ... }
      ): Promise<void> => {
        chai.assert.isTrue(_validateAddressesReq(req.body));
        logger.info(`mockCardanoServer: /api/v2/txs/history -> request`);
        logger.info(JSON.stringify(req.body));

        const history = await mockImporter.history(req.body);
        logger.info(`mockCardanoServer: /api/v2/txs/history -> response`);
        logger.info(JSON.stringify(history));
        // Returns a chunk of txs
        res.send(history.slice(0, txsLimit));
      }
    );

    server.get(
      '/api/v2/bestblock',
      async (
        req: { body: BestBlockRequest, ... },
        res: { send(arg: BestBlockResponse): any, ... }
      ): Promise<void> => {
        logger.info(`mockCardanoServer: /api/v2/getblock-> request`);
        logger.info(JSON.stringify(req.body));
        const bestBlock = await mockImporter.getBestBlock(req.body);
        logger.info(`mockCardanoServer: /api/v2/getblock -> response`);
        logger.info(JSON.stringify(bestBlock));
        res.send(bestBlock);
      }
    );

    server.post(
      '/api/txs/signed',
      (
        req: { body: SignedRequestInternal, ... },
        res: {
          send(arg: SignedResponse): any,
          status: Function,
          ...
        }
      ): void => {
        // note: don't use this in practice because ttl makes the tx hash computer-time-sensitive
        if (expectedTxBase64.length !== 0 && expectedTxBase64[0] !== req.body.signedTx) {
          logger.error(
            `mockCardanoServer: Wrong transaction payload. Expected ${expectedTxBase64[0]} and found ${req.body.signedTx}`
          );
          throw new Error(
            `Wrong transaction payload. Expected ${expectedTxBase64[0]} and found ${req.body.signedTx}`
          );
        }

        logger.info(`mockCardanoServer: /api/txs/signed-> request`);
        logger.info(JSON.stringify(req.body));

        if (settings.signedTransaction) {
          settings.signedTransaction(req, res);
        } else {
          _defaultSignedTransaction(req, res);
        }

        logger.info(`mockCardanoServer: /api/txs/signed-> response`);
        logger.info(JSON.stringify(res, getCircularReplacer()));
      }
    );

    server.post(
      '/api/pool/info',
      async (
        req: { body: PoolInfoRequest, ... },
        res: { send(arg: PoolInfoResponse): any, ... }
      ): Promise<void> => {
        logger.info(`mockCardanoServer: /api/pool/info -> request`);
        logger.info(JSON.stringify(req.body));

        const poolsInfo = await mockImporter.getPoolInfo(req.body);
        logger.info(`mockCardanoServer: /api/pool/info -> response`);
        logger.info(JSON.stringify(poolsInfo));
        res.send(poolsInfo);
      }
    );

    server.post(
      '/api/account/rewardHistory',
      async (
        req: { body: RewardHistoryRequest, ... },
        res: { send(arg: RewardHistoryResponse): any, ... }
      ): Promise<void> => {
        logger.info(`mockCardanoServer: /api/account/rewardHistory -> request`);
        logger.info(JSON.stringify(req.body));

        const poolsInfo = await mockImporter.getRewardHistory(req.body);
        logger.info(`mockCardanoServer: /api/account/rewardHistory -> response`);
        logger.info(JSON.stringify(poolsInfo));
        res.send(poolsInfo);
      }
    );

    server.post(
      '/api/account/state',
      async (
        req: { body: AccountStateRequest, ... },
        res: { send(arg: AccountStateResponse): any, ... }
      ): Promise<void> => {
        chai.assert.isTrue(_validateAddressesReq(req.body));
        logger.info(`mockCardanoServer: /api/account/state -> request`);
        logger.info(JSON.stringify(req.body));

        const accountState = await mockImporter.getAccountState(req.body);
        logger.info(`mockCardanoServer: /api/account/state -> response`);
        logger.info(JSON.stringify(accountState));
        res.send(accountState);
      }
    );

    server.post(
      '/api/v2/addresses/filterUsed',
      async (
        req: { body: FilterUsedRequest, ... },
        res: { send(arg: FilterUsedResponse): any, ... }
      ): Promise<void> => {
        logger.info(`mockCardanoServer: /api/v2/addresses/filterUsed -> request`);
        logger.info(JSON.stringify(req.body));
        const response = await mockImporter.usedAddresses(req.body);

        logger.info(`mockCardanoServer: /api/v2/addresses/filterUsed -> response`);
        logger.info(JSON.stringify(response));
        res.send(response);
      }
    );

    server.get('/api/status', (req, res: { send(arg: ServerStatusResponse): any, ... }): void => {
      const status = mockImporter.getApiStatus();
      logger.info(`mockCardanoServer: GET: /api/status`);
      logger.info(JSON.stringify(status));
      res.send(status);
    });

    // To test the dApp connector, we need a no-op mock dApp.
    server.get('/mock-dapp', (req, res: { send(arg: ServerStatusResponse): any, ... }): void => {
      // $FlowFixMe[prop-missing]
      res.header('content-type', 'text/html');
      // $FlowFixMe[incompatible-call]
      res.send(`
               <!doctype html>
               <html lang="en">
                 <head>
                   <title>MockDApp</title>
                 </head>
                 <body>
                 </body>
               </html>
               `);
    });

    server.get('/api/txs/io/:txHash/o/:txIndex', (req, res) => {
      logger.info(`mockCardanoServer: /api/txs/io/:txHash/o/:txIndex -> request`);
      logger.info(JSON.stringify(req.body));

      const result = mockImporter.getUtxoData(req.params.txHash, Number(req.params.txIndex));
      logger.info(`mockCardanoServer: /api/txs/io/:txHash/o/:txIndex -> response`);
      logger.info(JSON.stringify(result));
      if (result) {
        res.send(result);
        return;
      }
      res.status(404);
      res.send('Transaction not found');
    });

    installCoinPriceRequestHandlers(server);

    MockServer = server.listen(Ports.DevBackendServe, () => {
      // eslint-disable-next-line no-console
      console.log(`JSON Server is running at ${Ports.DevBackendServe}`);
      logger.info(`mockCardanoServer: JSON Server is running at ${Ports.DevBackendServe}`);
    });
  }
  return MockServer;
}

export function closeMockServer() {
  if (MockServer) {
    MockServer.close();
    MockServer = null;
    logger.info(`mockCardanoServer: JSON Server closed`);
  }
}
