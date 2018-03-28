
import { parseResponse, handleErrors } from './apiUtils';

const ExplorerApi = {};

ExplorerApi.config = {
  serverRoute: 'https://explorer.iohkdev.io/api'
};

const toTx = address => async function (response) {
  const parsedTxs = response.Right;
  parsedTxs.caTxList = parsedTxs.caTxList.map((tx) => {
    //FIXME: This a simplification:
    // -- This won't work if send funds to itself
    // -- If no change is sent
    const foundInput = tx.ctbInputs.find(input => input[0] === address);
    const foundOutput = tx.ctbOutputs.find(output => output[0] === address);
    const isOutgoing = foundInput !== undefined;
    const change = foundOutput !== undefined && isOutgoing ? foundOutput[1].getCoin : 0;
    const amount = isOutgoing ? tx.ctbOutputSum.getCoin - change : foundOutput[1].getCoin;
    return Object.assign({}, tx, {
      isOutgoing,
      amount
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
