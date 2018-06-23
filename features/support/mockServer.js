import { create, bodyParser, defaults } from 'json-server';
import { getMockData } from './mockDataBuilder';

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

  server.post('/api/txs/utxoForAddresses', (req, res) => {
    const { utxos } = getMockData();
    res.send(utxos);
  });

  server.post('/api/txs/utxoSumForAddresses', (req, res) => {
    validateAddressesReq(req.body);
    const utxos = getMockData().utxos;
    const sumUtxos = !utxos ? 0 : utxos.reduce((sum, utxo) => {
      if (req.body.addresses.includes(utxo.receiver)) {
        return sum + utxo.amount;
      }
      return sum;
    }, 0);
    res.send({ sum: sumUtxos });
  });

  server.post('/api/txs/history', (req, res) => {
    // TODO: Implement
    res.send();
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
