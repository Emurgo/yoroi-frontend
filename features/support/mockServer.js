import { create, bodyParser, defaults } from 'json-server';
import moment from 'moment';
import { getAddressMapper, getMockData, getTxsMapList } from './mockDataBuilder';

const middlewares = [...defaults(), bodyParser];

const port = 8080;

export function createServer() {
  const server = create();

  server.use(middlewares);

  function validateAddressesReq({ addresses } = {}) {
    if (!addresses || addresses.length > 50 || addresses.length === 0) {
      throw new Error('Addresses request length should be (0, 50]');
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
    validateAddressesReq(req.body);
    validateDatetimeReq(req.body);
    const firstAddress = req.body.addresses[0];
    const addressPrefix = firstAddress.slice(0, firstAddress.length - 1);
    const addressMap = getAddressMapper(addressPrefix);
    const txsMapList = getTxsMapList(addressMap, addressPrefix);
    // Filters all txs according to hash and date
    const filteredTxs = txsMapList.filter(txMap => {
      const extraFilter = req.body.txHash ?
        txMap.tx.hash > req.body.txHash :
        !req.body.txHash;
      return req.body.addresses.includes(txMap.address) &&
        moment(txMap.tx.time) >= moment(req.body.dateFrom) &&
        extraFilter;
    }).map(txMap => txMap.tx);
    // Returns a chunk of 20 txs
    res.send(filteredTxs.slice(0, 20));
  });

  server.post('/api/txs/signed', (req, res) => {
    res.send();
  });

  server.post('/api/addresses/filterUsed', (req, res) => {
    const usedAddresses = getMockData().usedAddresses.filter((address) =>
      req.body.addresses.includes(address));
    res.send(usedAddresses);
  });

  server.post('/api/txs/pending', (req, res) => {
    res.send([]);
  });

  return server.listen(port, () => {
    console.log(`JSON Server is running at ${port}`);
  });
}
