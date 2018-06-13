// @flow
import { importDaedalusWallet } from '../importDaedalusWallet';
import type { ConfigType } from '../../../../config/config-types';

declare var CONFIG: ConfigType;
const websocketUrl = CONFIG.network.websocketUrl;

const MSG_TYPE_RESTORE = 'RESTORE';

export function setupWs(secretWords: string, receiverAddress: string): WebSocket {
  const ws = new WebSocket(websocketUrl);

  ws.addEventListener('open', () => {
    console.log('[ws::connected]');

    // TODO: Trigger this when the user start Daedalus wallet restoration
    ws.send(_toMessage({
      msg: MSG_TYPE_RESTORE,
    }));
  });

  /*
    FIXME: Remove 'any' from event
    There is an open issue with this https://github.com/facebook/flow/issues/3116
  */
  ws.addEventListener('message', (event: any) => {
    const data = _fromMessage(event.data);
    console.log(`[ws::message] on: ${data.msg}`);
    switch (data.msg) {
      case MSG_TYPE_RESTORE:
        importDaedalusWallet(secretWords, receiverAddress, data.addresses);
        break;
      default:
        break;
    }
  });

  ws.addEventListener('closed', () => {
    console.log('[ws::connected]');
  });

  return ws;
}

function _fromMessage(data: mixed) {
  if (typeof data !== 'string') {
    return {};
  }
  return JSON.parse(data);
}

const _toMessage = JSON.stringify;
