// @flow

import WebSocket from 'ws';

const MSG_TYPE_RESTORE = 'RESTORE';
const fromMessage = JSON.parse;
const toMessage = JSON.stringify;

let wss = null;

export function getMockWebSocketServer(server: any): WebSocket.Server {
  if (!wss) {
    wss = new WebSocket.Server({ server });
  }
  return wss;
}

export function closeMockWebSocketServer() {
  wss = null;
}

export function mockRestoredDaedalusAddresses(addresses: Array<string>) {
  if (!wss) {
    return;
  }
  wss.on('connection', ws => {
    ws.on('message', (msg) => {
      const data = fromMessage(msg);
      switch (data.msg) {
        case MSG_TYPE_RESTORE:
          ws.send(toMessage({
            msg: MSG_TYPE_RESTORE,
            addresses
          }));
          break;
        default:
          break;
      }
    });
  });
}
