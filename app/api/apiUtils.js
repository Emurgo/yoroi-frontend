
export const parseResponse = function (response) {
  return response.json();
};

export const handleErrors = function (responseJson) {
  if (responseJson.error) {
    throw responseJson.error;
  } else {
    return Promise.resolve(responseJson);
  }
};
