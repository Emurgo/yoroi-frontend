
// serializeUint8Array :: String with JSON format => Uint8Array -> String
export const serializeUint8Array = function (x) {
  return JSON.stringify(x);
};

// deserializeUint8Array :: String with JSON format => String -> Uint8Array
export const deserializeUint8Array = function (x) {
  const xObj = JSON.parse(x);
  const xAsArray = Object.values(xObj);
  return Uint8Array.from(xAsArray);
};
