// @flow

import { create, bodyParser, defaults } from 'json-server';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import { getFeatureData, getTxsMapList } from './mockDataBuilder';
import type {
  UtxoForAddressesRequest, UtxoForAddressesResponse,
  UtxoSumForAddressessRequest, UtxoSumForAddressesResponse,
  HistoryRequest, HistoryResponse,
  SignedRequest, SignedResponse,
  FilterUsedRequest, FilterUsedResponse
} from '../../app/api/ada/lib/yoroi-backend-api';
import chai from 'chai';

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
  res.send([]);
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
        body: UtxoForAddressesRequest
      },
      res: { send(arg: UtxoForAddressesResponse): any }
    ): void => {
      const { utxos } = getFeatureData();
      const filteredUtxos = utxos
        ? utxos.filter(utxo => req.body.addresses.includes(utxo.receiver))
        : [];
      res.send(filteredUtxos);
    });

    server.post('/api/txs/utxoSumForAddresses', (
      req: {
        body: UtxoSumForAddressessRequest
      },
      res: { send(arg: UtxoSumForAddressesResponse): any }
    ): void => {
      chai.assert.isTrue(_validateAddressesReq(req.body));
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
        body: HistoryRequest
      },
      res: { send(arg: HistoryResponse): any }
    ): void => {
      chai.assert.isTrue(_validateAddressesReq(req.body));
      chai.assert.isTrue(_validateDatetimeReq(req.body));
      const txsMapList = getTxsMapList(req.body.addresses);
      // Filters all txs according to hash and date
      const filteredTxs = txsMapList.filter(txMap => {
        const includesAddress = req.body.addresses.includes(txMap.address);
        const timeOkay = moment(txMap.tx.last_update) >= moment(req.body.dateFrom);
        return includesAddress && timeOkay;
      }).map(txMap => txMap.tx);
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
