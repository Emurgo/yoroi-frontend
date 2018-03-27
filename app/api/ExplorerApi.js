
import { parseResponse, handleErrors } from './apiUtils';

const ExplorerApi = {};

ExplorerApi.config = {
  serverRoute: 'https://explorer.iohkdev.io/api'
};

const toTx = address => async function (response) {
  const parsedTxs = response.Right;
  parsedTxs.caTxList = parsedTxs.caTxList.map((tx) => {
    //FIXME: this is not completely true. If it sent fund to itself this won't work
    return Object.assign({}, tx, {
      isOutgoing: tx.ctbInputs.findIndex(input => input[0] === address) !== -1
    });
  });
  return parsedTxs;
};

ExplorerApi.wallet = {};

ExplorerApi.wallet.getInfo = function (walletId) {
  return fetch(`${ExplorerApi.config.serverRoute}/addresses/summary/${walletId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  })
  .then(parseResponse)
  .then(toTx(walletId))
  .then(handleErrors);
};

export default ExplorerApi;
