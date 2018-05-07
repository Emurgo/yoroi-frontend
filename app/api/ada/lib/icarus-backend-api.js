import axios from 'axios';

const BackendApiRoute = 'localhost';
const BackendApiPort = 8080;

// TODO: Refactor service call in order to re-use common parameters
// TODO: Map errors in a more specific way

export const getUTXOsForAddresses = addresses =>
  axios(`http://${BackendApiRoute}:${BackendApiPort}/api/txs/utxoForAddresses`,
    {
      method: 'post',
      responseType: 'application/json',
      data: {
        addresses
      }
    }
  ).then(response => response.data);

export const getTransactionsHistoryForAddresses = addresses =>
  axios(`http://${BackendApiRoute}:${BackendApiPort}/api/txs/history`,
    {
      method: 'post',
      responseType: 'application/json',
      data: {
        addresses
      }
    }
  ).then(response => response.data);

export const sendTx = signedTx =>
  axios(`http://${BackendApiRoute}:${BackendApiPort}/api/txs/signed`,
    {
      method: 'post',
      responseType: 'application/json',
      data: {
        signedTx
      }
    }
  ).then(response => response.data);
