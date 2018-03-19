const API = {};

API.config = {
  serverRoute: 'https://explorer.iohkdev.io/api'
};

const parseResponse = function (response) {
  return response.json();
};

const handleErrors = function (responseJson) {
  if (responseJson.error) {
    console.error(`[API.handleErrors] error[${responseJson.error.name}]`);
    throw responseJson.error;
  } else {
    return Promise.resolve(responseJson);
  }
};

API.wallet = {};

API.wallet.getInfo = function (walletId) {
  return fetch(`${API.config.serverRoute}/addresses/summary/${walletId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  })
  .then(parseResponse)
  .then(handleErrors);
};

export default API;
