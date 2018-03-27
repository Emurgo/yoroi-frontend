
import { parseResponse, handleErrors } from './apiUtils';

const CardanoNodeApi = {};

CardanoNodeApi.config = {
  serverRoute: 'https://localhost:8080/api'
};

CardanoNodeApi.transactions = {};

CardanoNodeApi.transactions.buildTx = function ({ to, from, amount }) {
  return fetch(`${CardanoNodeApi.config.serverRoute}/txs/unsigned/${from}/${to}/${amount}`, {
    method: 'POST',
    headers: new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({ groupingPolicy: 'OptimizeForHighThroughput' }),
  })
  .then(parseResponse)
  .then(handleErrors);
};

CardanoNodeApi.transactions.sendTx = function (signedTx) {
  return fetch(`${CardanoNodeApi.config.serverRoute}/txs/signed`, {
    method: 'POST',
    headers: new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(signedTx),
  })
  .then(parseResponse)
  .then(handleErrors);
};

export default CardanoNodeApi;
