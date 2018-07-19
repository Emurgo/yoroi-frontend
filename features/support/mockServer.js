import { create, bodyParser, defaults } from 'json-server';
import moment from 'moment';
import { getMockData, getTxsMapList } from './mockDataBuilder';
import BigNumber from 'bignumber.js';

const middlewares = [...defaults(), bodyParser];

const port = 8080;

// MockData should always be consistent with the following values
const addressesLimit = 50;
const txsLimit = 20;

function _validateAddressesReq({ addresses } = {}) {
  if (!addresses || addresses.length > addressesLimit || addresses.length === 0) {
    throw new Error('Addresses request length should be (0, ' + addressesLimit + ']');
  }
  // TODO: Add address validation
  return true;
}

function _validateDatetimeReq({ dateFrom } = {}) {
  if (!dateFrom || !moment(dateFrom).isValid()) {
    throw new Error('DateFrom should be a valid datetime');
  }
  return true;
}

function _defaultSignedTransaction(req, res) {
  res.send();
}

let MockServer = null;

export function getMockServer(settings) {

  // If the MockServer doesn't exist or new settings are passed the Mocker Server is created.
  if (!MockServer || settings) {
    const server = create();

    server.use(middlewares);

    server.post('/api/txs/utxoForAddresses', (req, res) => {
      const { utxos } = getMockData();
      const filteredUtxos =
        utxos.filter(utxo => req.body.addresses.includes(utxo.receiver));
      res.send(filteredUtxos);
    });

    server.post('/api/txs/utxoSumForAddresses', (req, res) => {
      _validateAddressesReq(req.body);
      const utxos = getMockData().utxos;
      const sumUtxos = !utxos ? 0 : utxos.reduce((sum, utxo) => {
        if (req.body.addresses.includes(utxo.receiver)) {
          return new BigNumber(utxo.amount).plus(sum);
        }
        return sum;
      }, new BigNumber(0));
      res.send({ sum: sumUtxos.toString() });
    });

    server.post('/api/txs/history', (req, res) => {
      _validateAddressesReq(req.body);
      _validateDatetimeReq(req.body);
      const txsMapList = getTxsMapList(req.body.addresses);
      // Filters all txs according to hash and date
      const filteredTxs = txsMapList.filter(txMap =>
        req.body.addresses.includes(txMap.address) &&
          moment(txMap.tx.last_update) >= moment(req.body.dateFrom)
      ).map(txMap => txMap.tx);
      // Returns a chunk of txs
      res.send(filteredTxs.slice(0, txsLimit));
    });

    server.post('/api/txs/signed', settings.signedTransaction ?
      settings.signedTransaction : _defaultSignedTransaction);

    server.post('/api/addresses/filterUsed', (req, res) => {
      const usedAddresses = getMockData().usedAddresses.filter((address) =>
        req.body.addresses.includes(address));
      res.send(usedAddresses);
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