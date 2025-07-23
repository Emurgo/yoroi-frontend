// @flow

function portToPermission(port /*: number */) /*: string */ {
  return `http://localhost:${port} https://localhost:${port}`;
}
function serverToPermission(server /*: string */) /*: string */ {
  return `https://${server}`;
}

const Ports = {
  DevBackendServer: 21000,
  ReactDevTools: 8097,
};

const Servers = {
  // this allows connecting to multiple different backends for different currencies
  Primary: '*.yoroiwallet.com',
  Testnet: '*.emurgornd.com',
};

module.exports = {
  portToPermission,
  Ports,
  serverToPermission,
  Servers,
};
