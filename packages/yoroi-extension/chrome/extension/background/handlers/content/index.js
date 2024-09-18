// @flow
import { handleRpc } from './rpc';
import { handleConnect } from './connect';
import { stringifyError } from '../../../../../app/utils/logging';
import { sendToInjector } from './utils';

export async function handleInjectorMessage(message: Object, sender: Object) {
  const tabId = sender.tab.id;

  if (message.type === 'yoroi_connect_request/cardano') {
    try {
      await handleConnect(tabId, message.connectParameters, message.imgBase64Url)
    } catch (e) {
      sendToInjector(
        tabId,
        {
          type: 'yoroi_connect_response/cardano',
          success: false,
          err: stringifyError(e),
        }
      );
    }
  } else if (message.type === 'connector_rpc_request') {
    await handleRpc(message, sender);
  }
}

