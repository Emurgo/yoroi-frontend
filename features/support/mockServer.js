import { create, bodyParser, defaults } from 'json-server';
import moment from 'moment';
import { getMockData, getTxs } from './mockDataBuilder';

const middlewares = [...defaults(), bodyParser];

const port = 8080;

export function createServer() {
  const server = create();

  server.use(middlewares);

  function validateAddressesReq({ addresses } = {}) {
    if (!addresses || addresses.length > 20 || addresses.length === 0) {
      throw new Error('Addresses request length should be (0, 20]');
    }
    // TODO: Add address validation
    return true;
  }

  function validateDatetimeReq({ dateFrom } = {}) {
    if (!dateFrom || !moment(dateFrom).isValid()) {
      throw new Error('DateFrom should be a valid datetime');
    }
    return true;
  }

  server.post('/api/txs/utxoForAddresses', (req, res) => {
    const { utxos } = getMockData();
    res.send(utxos);
  });

  server.post('/api/txs/utxoSumForAddresses', (req, res) => {
    validateAddressesReq(req.body);
    const sumUtxos = getMockData().utxos.reduce((sum, utxo) => {
      if (req.body.addresses.includes(utxo.receiver)) {
        return sum + utxo.amount;
      }
      return sum;
    }, 0);
    res.send({ sum: sumUtxos });
  });

  server.post('/api/txs/history', (req, res) => {
    // FIXME: This method shouldn't make test cases that don't need it fail
    if (!getMockData().addressesMapper) {
      return res.send();
    }
    validateAddressesReq(req.body);
    validateDatetimeReq(req.body);
    // FIXME: Simplify logic
    const firstAddress = req.body.addresses[0];
    const addressPrefix = firstAddress.slice(0, firstAddress.length - 1);
    const addressMap = getMockData().addressesMapper
      .find((address => address.prefix === addressPrefix));
    // Filters all txs according to hash and date
    const txsMapList = addressMap && addressMap.hashPrefix && addressMap.txsAmount ?
      getTxs(addressMap.txsAmount, addressPrefix, addressMap.hashPrefix) :
      getMockData().txs[addressPrefix];
    const filteredTxs = txsMapList.filter(txMap => {
      const extraFilter = req.body.txHash ?
        txMap.tx.hash > req.body.txHash :
        !req.body.txHash;
      return req.body.addresses.includes(txMap.address) &&
        moment(txMap.tx.time) >= moment(req.body.dateFrom) &&
        extraFilter;
    }).map(txMap => txMap.tx);
    // Returns a chunk of 20 txs and sorted
    const txsChunk = filteredTxs.slice(0, 20);
    const txs = txsChunk.sort((txA, txB) => {
      if (moment(txA.time) < moment(txB.time)) return -1;
      if (moment(txA.time) > moment(txB.time)) return 1;
      if (txA.hash < txB.hash) return -1;
      if (txA.hash > txB.hash) return 1;
      return 0;
    });
    res.send(txs);
  });

  server.post('/api/txs/signed', (req, res) => {
    res.send();
  });

  server.post('/api/addresses/filterUsed', (req, res) => {
    const usedAddresses = getMockData().usedAddresses.filter((address) =>
      req.body.addresses.includes(address));
    res.send(usedAddresses);
  });

  return server.listen(port, () => {
    console.log(`JSON Server is running at ${port}`);
  });
}
