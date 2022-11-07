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

function _validateAddressesReq(
  { addresses }: { addresses: Array<string>, ... } = {},
  localLogger: LocalLogger
): boolean {
  localLogger.logInfo(`Validate Addresses request`);
  if (!addresses || addresses.length > addressesLimit || addresses.length === 0) {
    localLogger.logError(`Addresses request length should be (0, ${addressesLimit})`);
    throw new Error(`Addresses request length should be (0, ${addressesLimit})`);
  }
  // TODO: Add address validation
  return true;
}

function _defaultSignedTransaction(
  req: { body: SignedRequestInternal, ... },
  res: { send(arg: SignedResponse): any, ... },
  localLogger: LocalLogger
): void {
  localLogger.logInfo(`Default Signed Transaction`);
  localLogger.logInfo(`mockImporter.sendTx <- request\n    ${JSON.stringify(req.body)}`);
  const response = mockImporter.sendTx(req.body);
  localLogger.logInfo(`mockImporter.sendTx -> response\n    ${JSON.stringify(response)}`);
  res.send(response);
}

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

class MethodLogger {
  constructor(localLogger: LocalLogger, method: string, url: string) {
    this.localLogger = localLogger;
    this.method = method;
    this.url = url;
  }

  logRequest = (message?: string) => {
    this.localLogger.logInfo(
      `${this.method}: ${this.url} <- request${message ? `\n    ${message}` : ''}`,
      false
    );
  };

  logResponseSuccess = (message?: string) => {
    this.localLogger.logInfo(
      `${this.method}: ${this.url} -> response${message ? `\n    ${message}` : ''}`,
      false
    );
  };

  logResponseError = (errorMessage: string) => {
    this.localLogger.logError(`${this.method}: ${this.url} ->\n    Error:\n${errorMessage}`, false);
  };
}

class LocalLogger {
  constructor(fileName: string, logPath) {
    this.fileName = fileName;
    this.logger = simpleNodeLogger.createSimpleFileLogger(logPath);
  }

  getMethodLogger = (method: string, url: string) => {
    return new MethodLogger(this, method, url);
  };

  logInfo = (message: string, spaceBefore: boolean = true) => {
    this.logger.info(`${this.fileName}:${spaceBefore ? ' ' : ''}${message}`);
  };

  logError = (message: string, spaceAfter: boolean = true) => {
    this.logger.error(`${this.fileName}:${spaceAfter ? ' ' : ''}${message}`);
  };
}

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
  const logPath = `${dir}/cardanoMockServerLog_${getLogDate()}.log`;
  const localLogger = new LocalLogger('mockCardanoServer', logPath);

  if (!MockServer) {
    const middlewares = [...defaults({ logger: !!settings.outputLog }), bodyParser];

    const server = create();
    localLogger.logInfo(`JSON Server Created`);

    server.use(middlewares);

    server.post(
      '/api/txs/utxoForAddresses',
      async (
        req: { body: AddressUtxoRequest, ... },
        res: { send(arg: AddressUtxoResponse): any, ... }
      ): Promise<void> => {
        const methodLogger = localLogger.getMethodLogger('POST', '/api/txs/utxoForAddresses');
        chai.assert.isTrue(_validateAddressesReq(req.body, localLogger));
        methodLogger.logRequest(JSON.stringify(req.body));
        const utxoForAddresses = await mockImporter.utxoForAddresses(req.body);
        methodLogger.logResponseSuccess(JSON.stringify(utxoForAddresses));
        res.send(utxoForAddresses);
      }
    );

    server.post(
      '/api/txs/utxoSumForAddresses',
      async (
        req: { body: UtxoSumRequest, ... },
        res: { send(arg: UtxoSumResponse): any, ... }
      ): Promise<void> => {
        const methodLogger = localLogger.getMethodLogger('POST', '/api/txs/utxoSumForAddresses');
        chai.assert.isTrue(_validateAddressesReq(req.body, localLogger));
        methodLogger.logRequest(JSON.stringify(req.body));
        const utxoSumForAddresses = await mockImporter.utxoSumForAddresses(req.body);
        methodLogger.logResponseSuccess(JSON.stringify(utxoSumForAddresses));
        res.send(utxoSumForAddresses);
      }
    );

    server.post(
      '/api/v2/txs/history',
      async (
        req: { body: HistoryRequest, ... },
        res: { send(arg: HistoryResponse): any, ... }
      ): Promise<void> => {
        const methodLogger = localLogger.getMethodLogger('POST', '/api/v2/txs/history');
        chai.assert.isTrue(_validateAddressesReq(req.body, localLogger));
        methodLogger.logRequest(JSON.stringify(req.body));
        const history = await mockImporter.history(req.body);
        methodLogger.logResponseSuccess(JSON.stringify(history));
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
        const methodLogger = localLogger.getMethodLogger('POST', '/api/v2/bestblock');
        methodLogger.logRequest(JSON.stringify(req.body));
        const bestBlock = await mockImporter.getBestBlock(req.body);
        methodLogger.logResponseSuccess(JSON.stringify(bestBlock));
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
        const methodLogger = localLogger.getMethodLogger('POST', '/api/txs/signed');
        // note: don't use this in practice because ttl makes the tx hash computer-time-sensitive
        if (expectedTxBase64.length !== 0 && expectedTxBase64[0] !== req.body.signedTx) {
          localLogger.logError(
            `Wrong transaction payload. Expected ${expectedTxBase64[0]} and found ${req.body.signedTx}`
          );
          // throw new Error(
          //   `Wrong transaction payload. Expected ${expectedTxBase64[0]} and found ${req.body.signedTx}`
          // );
        }
        methodLogger.logRequest(JSON.stringify(req.body));

        if (settings.signedTransaction) {
          settings.signedTransaction(req, res);
        } else {
          _defaultSignedTransaction(req, res, localLogger);
        }

        methodLogger.logResponseSuccess(JSON.stringify(res, getCircularReplacer()));
      }
    );

    server.post(
      '/api/pool/info',
      async (
        req: { body: PoolInfoRequest, ... },
        res: { send(arg: PoolInfoResponse): any, ... }
      ): Promise<void> => {
        const methodLogger = localLogger.getMethodLogger('POST', '/api/pool/info');
        methodLogger.logRequest(JSON.stringify(req.body));

        const poolsInfo = await mockImporter.getPoolInfo(req.body);
        methodLogger.logResponseSuccess(JSON.stringify(poolsInfo));
        res.send(poolsInfo);
      }
    );

    server.post(
      '/api/account/rewardHistory',
      async (
        req: { body: RewardHistoryRequest, ... },
        res: { send(arg: RewardHistoryResponse): any, ... }
      ): Promise<void> => {
        const methodLogger = localLogger.getMethodLogger('POST', '/api/account/rewardHistory');
        methodLogger.logRequest(JSON.stringify(req.body));

        const poolsInfo = await mockImporter.getRewardHistory(req.body);
        methodLogger.logResponseSuccess(JSON.stringify(poolsInfo));
        res.send(poolsInfo);
      }
    );

    server.post(
      '/api/account/state',
      async (
        req: { body: AccountStateRequest, ... },
        res: { send(arg: AccountStateResponse): any, ... }
      ): Promise<void> => {
        const methodLogger = localLogger.getMethodLogger('POST', '/api/account/rewardHistory');
        chai.assert.isTrue(_validateAddressesReq(req.body, localLogger));
        methodLogger.logRequest(JSON.stringify(req.body));

        const accountState = await mockImporter.getAccountState(req.body);
        methodLogger.logResponseSuccess(JSON.stringify(accountState));
        res.send(accountState);
      }
    );

    server.post(
      '/api/v2/addresses/filterUsed',
      async (
        req: { body: FilterUsedRequest, ... },
        res: { send(arg: FilterUsedResponse): any, ... }
      ): Promise<void> => {
        const methodLogger = localLogger.getMethodLogger('POST', '/api/v2/addresses/filterUsed');
        methodLogger.logRequest(JSON.stringify(req.body));
        const response = await mockImporter.usedAddresses(req.body);

        methodLogger.logResponseSuccess(JSON.stringify(response));
        res.send(response);
      }
    );

    server.get('/api/status', (req, res: { send(arg: ServerStatusResponse): any, ... }): void => {
      const methodLogger = localLogger.getMethodLogger('GET', '/api/status');
      methodLogger.logRequest();
      const status = mockImporter.getApiStatus();
      methodLogger.logResponseSuccess(JSON.stringify(status));
      res.send(status);
    });

    // To test the dApp connector, we need a no-op mock dApp.
    server.get('/mock-dapp', (req, res: { send(arg: ServerStatusResponse): any, ... }): void => {
      const methodLogger = localLogger.getMethodLogger('GET', '/mock-dapp');
      methodLogger.logRequest();
      // $FlowFixMe[prop-missing]
      res.header('content-type', 'text/html');
      methodLogger.logResponseSuccess();
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
      const methodLogger = localLogger.getMethodLogger('GET', '/api/txs/io/:txHash/o/:txIndex');
      methodLogger.logRequest(JSON.stringify(req.body));

      const result = mockImporter.getUtxoData(req.params.txHash, Number(req.params.txIndex));
      if (result) {
        res.send(result);
        methodLogger.logResponseSuccess(JSON.stringify(result));
        return;
      }
      methodLogger.logResponseError(`404 Transaction not found`);
      res.status(404);
      res.send('Transaction not found');
    });

    server.get('/api/v2/tipStatus', async (req, res) => {
      const methodLogger = localLogger.getMethodLogger('GET', '/api/v2/tipStatus');
      methodLogger.logRequest();
      const bestBlockHash = await mockImporter.mockUtxoApi.getBestBlock();
      const safeBlockHash = await mockImporter.mockUtxoApi.getSafeBlock();
      const response = {
        safeBlock: { hash: safeBlockHash },
        bestBlock: { hash: bestBlockHash },
      };
      methodLogger.logResponseSuccess(JSON.stringify(response));
      res.send(response);
    });

    server.post('/api/v2/tipStatus', async (req, res) => {
      const methodLogger = localLogger.getMethodLogger('POST', '/api/v2/tipStatus');
      methodLogger.logRequest(JSON.stringify(req.body));
      const { bestBlocks } = req.body.reference;
      const tipStatus = await mockImporter.mockUtxoApi.getTipStatusWithReference(bestBlocks);
      if (tipStatus.result !== 'SUCCESS') {
        methodLogger.logResponseError('500 REFERENCE_POINT_BLOCK_NOT_FOUND');
        res.status(500);
        res.send({ error: { response: 'REFERENCE_POINT_BLOCK_NOT_FOUND' } });
      } else {
        const value = tipStatus.value;
        if (!value) {
          methodLogger.logResponseError('unexpected null value');
          throw new Error('unexpected null value');
        }
        const bestBlockHash = await mockImporter.mockUtxoApi.getBestBlock();
        const safeBlockHash = await mockImporter.mockUtxoApi.getSafeBlock();
        const response = {
          safeBlock: safeBlockHash,
          bestBlock: bestBlockHash,
          reference: value.reference,
        };
        methodLogger.logResponseSuccess(JSON.stringify(response));
        res.send(response);
      }
    });

    server.post('/api/v2/txs/utxoAtPoint', async (req, res) => {
      const methodLogger = localLogger.getMethodLogger('POST', '/api/v2/txs/utxoAtPoint');
      methodLogger.logRequest(JSON.stringify(req.body));
      const { addresses, referenceBlockHash, page, pageSize } = req.body;
      const { value } = await mockImporter.mockUtxoApi.getUtxoAtPoint(
        { addresses, referenceBlockHash }
      );
      if (!value) {
        methodLogger.logResponseError('unexpected null value');
        throw new Error('unexpected null value');
      }
      const response = value.slice(
          (Number(page) - 1) * Number(pageSize),
          Number(page) * Number(pageSize),
        ).map(v => (
          {
            utxo_id: v.utxoId,
            tx_hash: v.txHash,
            tx_index: v.txIndex,
            block_num: v.blockNum,
            receiver: v.receiver,
            amount: v.amount,
            assets: v.assets,
          }
        ));
        methodLogger.logResponseSuccess(JSON.stringify(response));
        res.send(response);
      });

    server.post('/api/v2/txs/utxoDiffSincePoint', async (req, res) => {
      const methodLogger = localLogger.getMethodLogger('POST', '/api/v2/txs/utxoDiffSincePoint');
      methodLogger.logRequest(req.body);
      // ignore `blockCount` and returns all diff items at once
      const { addresses, untilBlockHash, afterBlockHash, /* blockCount */ } = req.body;
      const { result, value } = await mockImporter.mockUtxoApi.getUtxoDiffSincePoint(
        {
          addresses,
          untilBlockHash,
          // ignore itemIndex and txHash
          afterBestBlock: afterBlockHash
        },
      );
      if (result !== 'SUCCESS') {
        methodLogger.logResponseError('500 REFERENCE_POINT_BLOCK_NOT_FOUND');
        res.status(500);
        res.send({ error: { response: 'REFERENCE_POINT_BLOCK_NOT_FOUND' } });
      } else {
        if (!value) {
          methodLogger.logResponseError('unexpected null value');
          throw new Error('unexpected null value');
        }
        // casting `value` to `any` is the only way to pass flow check
        const diffItems = (value: any).diffItems.map(item => {
          if (item.type === 'input') {
            return item;
          }
          return {
            type: 'output',
            id: item.utxo.utxoId,
            receiver: item.utxo.receiver,
            amount: item.utxo.amount,
            assets: item.utxo.assets,
            block_num: item.utxo.blockNum,
            tx_hash: item.utxo.txHash,
            tx_index: item.utxo.txIndex,
          };
        });
        const response = { diffItems, lastBlockHash: untilBlockHash };
        methodLogger.logResponseSuccess(response);
        res.send(response);
      }
    });

    installCoinPriceRequestHandlers(server);

    MockServer = server.listen(Ports.DevBackendServe, () => {
      // eslint-disable-next-line no-console
      console.log(`JSON Server is running at ${Ports.DevBackendServe}`);
      localLogger.logInfo(`JSON Server is running at ${Ports.DevBackendServe}`);
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
