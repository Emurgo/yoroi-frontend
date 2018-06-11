import { create, bodyParser, defaults } from 'json-server';
import mockData from './mockData.json';

const middlewares = [...defaults(), bodyParser];

const port = 8080;

export function createServer() {
  const server = create();
  server.use(middlewares);

  server.post('/api/txs/utxoForAddresses', (req, res) => {
    const sumUtxos = mockData.utxos.reduce((sum, utxo) => {
      if (req.body.addresses.includes(utxo.receiver)) {
        return sum + utxo.amount;
      }
      return sum;
    }, 0);
    res.send(sumUtxos);
  });

  server.post('/api/txs/utxoSumForAddresses', (req, res) => {
    // TODO: Implement
    res.send();
  });

  server.post('/api/txs/history', (req, res) => {
    // TODO: Implement
    res.send();
  });

  server.post('/api/txs/signed', (req, res) => {
    // TODO: Implement
    res.send();
  });

  server.post('/api/addresses/filterUsed', (req, res) => {
    const usedAddresses = mockData.usedAddresses.filter((address) =>
      req.body.addresses.includes(address));
    res.send(usedAddresses);
  });

  return server.listen(port, () => {
    console.log(`JSON Server is running at ${port}`);
  });
}
