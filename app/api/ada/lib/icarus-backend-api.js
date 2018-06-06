import axios from 'axios';

const order = 'DESC';
export const transactionsLimit = 20;
export const addressesLimit = 20;

const backendUrl = CONFIG.network.backendUrl;

// TODO: Refactor service call in order to re-use common parameters
// TODO: Map errors in a more specific way

export const getUTXOsForAddresses = addresses =>
  axios(`${backendUrl}/api/txs/utxoForAddresses`,
    {
      method: 'post',
      data: {
        addresses
      }
    }
  ).then(response => response.data);

export const getUTXOsSumsForAddresses = addresses =>
  axios(`${backendUrl}/api/txs/utxoSumForAddresses`,
    {
      method: 'post',
      data: {
        addresses
      }
    }
  ).then(response => response.data);

export const getTransactionsHistoryForAddresses = (addresses, dateFrom) =>
  axios(`${backendUrl}/api/txs/history?order=${order}`,
    {
      method: 'post',
      data: {
        addresses,
        dateFrom
      }
    }
  ).then(response => response.data);

export const sendTx = signedTx =>
  axios(`${backendUrl}/api/txs/signed`,
    {
      method: 'post',
      data: {
        signedTx
      }
    }
  ).then(response => response.data);

export const checkAddressesInUse = addresses =>
  axios(`${backendUrl}/api/addresses/filterUsed`,
    {
      method: 'post',
      data: {
        addresses
      }
    }
  ).then(response => response.data);
