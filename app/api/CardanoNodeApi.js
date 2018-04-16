
import { parseResponse, handleErrors } from './apiUtils';

const CardanoNodeApi = {};

CardanoNodeApi.config = {
  serverRoute: 'https://localhost:8080/api'
};

CardanoNodeApi.transactions = {};

CardanoNodeApi.transactions.getUTXOsOfAddress = function (address) {
  return fetch(`${CardanoNodeApi.config.serverRoute}/txs/utxoForAddress/${address}`, {
    method: 'GET',
    headers: new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Content-Length': 0
    }),
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
