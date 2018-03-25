export const parseResponse = address =>
  async function (response) {
    const parsed = await response.json();
    const parsedTxs = parsed.Right;
    parsedTxs.caTxList = parsedTxs.caTxList.map((tx) => {
      //FIXME: this is not completely true. If it sent fund to itself this won't work
      return Object.assign({}, tx, {
        isOutgoing: tx.ctbInputs.findIndex(input => input[0] === address) !== -1
      });
    });
    return parsedTxs;
  };

export const handleErrors = function (responseJson) {
  if (responseJson.error) {
    throw responseJson.error;
  } else {
    return Promise.resolve(responseJson);
  }
};
