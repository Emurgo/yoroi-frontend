// @flow

import type {
  HistoryRequest,
  HistoryResponse,
  RewardHistoryRequest,
  RewardHistoryResponse,
  BestBlockRequest,
  BestBlockResponse,
  SignedResponse,
  AccountStateRequest,
  AccountStateResponse,
  PoolInfoRequest,
  PoolInfoResponse,
  ReputationRequest,
  ReputationResponse,
  SignedRequestInternal,
} from '../../app/api/jormungandr/lib/state-fetch/types';
import type {
  FilterUsedRequest,
  FilterUsedResponse,
} from '../../app/api/common/lib/state-fetch/currencySpecificTypes';
import type { ServerStatusResponse } from '../../app/api/common/lib/state-fetch/types';
import chai from 'chai';
import mockImporter from './mockJormungandrImporter';
import {
  validateAddressesReq,
  defaultSignedTransaction,
  txsLimit,
  getCommonServer,
} from './mockCommonServer';
import { installCoinPriceRequestHandlers } from './coinPriceRequestHandler';
import { Ports } from '../../scripts/connections';

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
  if (!MockServer) {
    const server = getCommonServer(settings);

    server.post(
      '/api/v2/txs/history',
      async (
        req: { body: HistoryRequest, ... },
        res: { send(arg: HistoryResponse): any, ... }
      ): Promise<void> => {
        chai.assert.isTrue(validateAddressesReq(req.body));

        const history = await mockImporter.history(req.body);
        // Returns a chunk of txs
        res.send(history.slice(0, txsLimit));
      }
    );

    server.post(
      '/api/v2/account/rewards',
      async (
        req: { body: RewardHistoryRequest, ... },
        res: { send(arg: RewardHistoryResponse): any, ... }
      ): Promise<void> => {
        chai.assert.isTrue(validateAddressesReq(req.body));

        const history = await mockImporter.getRewardHistory(req.body);
        res.send(history);
      }
    );

    server.get(
      '/api/v2/bestblock',
      async (
        req: { body: BestBlockRequest, ... },
        res: { send(arg: BestBlockResponse): any, ... }
      ): Promise<void> => {
        const bestBlock = await mockImporter.getBestBlock(req.body);
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
        if (settings.signedTransaction) {
          settings.signedTransaction(req, res);
        } else {
          defaultSignedTransaction(req, res);
        }
      }
    );

    server.post(
      '/api/v2/addresses/filterUsed',
      async (
        req: { body: FilterUsedRequest, ... },
        res: { send(arg: FilterUsedResponse): any, ... }
      ): Promise<void> => {
        const response = await mockImporter.usedAddresses(req.body);
        res.send(response);
      }
    );

    server.post(
      '/api/v2/account/state',
      async (
        req: { body: AccountStateRequest, ... },
        res: { send(arg: AccountStateResponse): any, ... }
      ): Promise<void> => {
        const response = await mockImporter.getAccountState(req.body);
        res.send(response);
      }
    );

    server.post(
      '/api/v2/pool/info',
      async (
        req: { body: PoolInfoRequest, ... },
        res: { send(arg: PoolInfoResponse): any, ... }
      ): Promise<void> => {
        const response = await mockImporter.getPoolInfo(req.body);
        res.send(response);
      }
    );

    server.get(
      '/api/v2/pool/reputation',
      async (
        req: { body: ReputationRequest, ... },
        res: { send(arg: ReputationResponse): any, ... }
      ): Promise<void> => {
        const response = await mockImporter.getReputation(req.body);
        res.send(response);
      }
    );

    server.get('/api/status', (req, res: { send(arg: ServerStatusResponse): any, ... }): void => {
      const status = mockImporter.getApiStatus();
      res.send(status);
    });

    installCoinPriceRequestHandlers(server);

    MockServer = server.listen(Ports.DevBackendServe, () => {
      // eslint-disable-next-line no-console
      console.log(`JSON Server is running at ${Ports.DevBackendServe}`);
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
