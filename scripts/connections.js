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
  DevBackendServe: 8080,
  ReactDevTools: 8097,
};

const Servers = {
  ByronMainnet: 'iohk-mainnet.yoroiwallet.com',
  ByronTestnet: 'testnet-yoroi-backend.yoroiwallet.com',
  ShelleyDev: 'shelley-emurgo-yoroi-backend.yoroiwallet.com',
  ShelleyITN: 'shelley-itn-yoroi-backend.yoroiwallet.com',
};

module.exports = {
  portToPermission,
  portToSocketPermission,
  Ports,
  serverToPermission,
  Servers,
};
