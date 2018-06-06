import axios from 'axios';

// FIXME: Should be improved to allow multiple evironments
const isTest = process.env.NODE_ENV === 'test';
const BackendApiProtocol = isTest ? 'http' : 'https';
const BackendApiRoute = isTest ? 'localhost' : '18.206.30.1';
const BackendApiPort = isTest ? 8080 : 443;
export const transactionsLimit = 20;
export const addressesLimit = 20;

// TODO: Refactor service call in order to re-use common parameters
// TODO: Map errors in a more specific way

export const getUTXOsForAddresses = addresses =>
  axios(`${BackendApiProtocol}://${BackendApiRoute}:${BackendApiPort}/api/txs/utxoForAddresses`,
    {
      method: 'post',
      data: {
        addresses
      }
    }
  ).then(response => response.data);

export const getUTXOsSumsForAddresses = addresses =>
  axios(`${BackendApiProtocol}://${BackendApiRoute}:${BackendApiPort}/api/txs/utxoSumForAddresses`,
    {
      method: 'post',
      data: {
        addresses
      }
    }
  ).then(response => response.data);

export const getTransactionsHistoryForAddresses = (addresses, dateFrom) =>
  axios(`${BackendApiProtocol}://${BackendApiRoute}:${BackendApiPort}/api/txs/history`,
    {
      method: 'post',
      data: {
        addresses,
        dateFrom
      }
    }
  ).then(response => response.data);

export const sendTx = signedTx =>
  axios(`${BackendApiProtocol}://${BackendApiRoute}:${BackendApiPort}/api/txs/signed`,
    {
      method: 'post',
      data: {
        signedTx
      }
    }
  ).then(response => response.data);

export const checkAddressesInUse = addresses =>
  axios(`${BackendApiProtocol}://${BackendApiRoute}:${BackendApiPort}/api/addresses/filterUsed`,
    {
      method: 'post',
      data: {
        addresses
      }
    }
  ).then(response => response.data);
