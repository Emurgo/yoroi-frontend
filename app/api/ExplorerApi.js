const ExplorerApi = {};

ExplorerApi.config = {
  serverRoute: 'https://explorer.iohkdev.io/api'
};

const parseResponse = function (response) {
  return response.json();
};

const handleErrors = function (responseJson) {
  if (responseJson.error) {
    console.error(`[ExplorerApi.handleErrors] error[${responseJson.error.name}]`);
    throw responseJson.error;
  } else {
    return Promise.resolve(responseJson);
  }
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
  .then(handleErrors);
};

export default ExplorerApi;
