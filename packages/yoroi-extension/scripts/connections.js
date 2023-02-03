// @flow

function portToPermission(port /*: number */)/*: string */ {
  return `http://localhost:${port} https://localhost:${port}`;
}
function portToSocketPermission(port /*: number */)/*: string */ {
  return `ws://localhost:${port} wss://localhost:${port}`;
}
function serverToPermission(server /*: string */)/*: string */ {
  return `https://${server} wss://${server}:443`;
}

const Ports = {
  WebpackDev: 3000,
  DevBackendServer: 21000,
  ErgoMockServer: 21001,
  ReactDevTools: 8097,
};

const Servers = {
  // this allows connecting to multiple different backends for different currencies
  Primary: '*.yoroiwallet.com',
  Testnet: '*.emurgornd.com',
};

module.exports = {
  portToPermission,
  portToSocketPermission,
  Ports,
  serverToPermission,
  Servers,
};
