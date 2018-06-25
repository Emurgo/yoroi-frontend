import axios from 'axios';

export const transactionsLimit = 20;
export const addressesLimit = 50;

declare var CONFIG: ConfigType;
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

export const getTransactionsHistoryForAddresses = (addresses, dateFrom, txHash) =>
  axios(`${backendUrl}/api/txs/history`,
    {
      method: 'post',
      data: {
        addresses,
        dateFrom,
        txHash
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

export const getPendingTxsForAddresses = addresses =>
  axios(`${backendUrl}/api/txs/pending`,
    {
      method: 'post',
      data: {
        addresses
      }
    }
  ).then(response => response.data);
