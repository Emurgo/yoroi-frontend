// Handlers for connector window messages
// @flow

import type { HandlerType } from './type';
import {
  withDb,
  withSelectedWallet,
  getConnectedSite,
  connectContinuation,
  setConnectedSite,
  deleteConnectedSite,
  sendToInjector,
  transformCardanoUtxos,
  getAllConnectedSites,
  getFromStorage,
  STORAGE_KEY_IMG_BASE64,
} from '../content';
import { getPublicDeriverById } from './utils';
import { asGetPublicKey } from '../../../../../app/api/ada/lib/storage/models/PublicDeriver/traits';
import {
  getAddressing,
  connectorSignData,
  connectorSignCardanoTx,
} from '../../../connector/api';
import { createAuthEntry } from '../../../../../app/connector/api';
import { getWalletChecksum } from '../../../../../app/api/export/utils';
import type CardanoTxRequest from '../../../../../app/api/ada';
import type { RemoteUnspentOutput } from '../../../../../app/api/ada/lib/state-fetch/types';
import {
  APIErrorCodes,
  ConnectorError,
  DataSignErrorCodes,
  TxSignErrorCodes,
  type WalletAuthEntry,
  type CardanoTx,
  type ConnectedSites,
  type ConnectingMessage,
  type SigningMessage,
} from '../../../connector/types';
import { RustModule } from '../../../../../app/api/ada/lib/cardanoCrypto/rustLoader';
import { mergeWitnessSets } from '../../../../../app/api/ada/transactions/utils';
import { hexToBytes } from '../../../../../app/coreUtils';
import { Logger } from '../../../../../app/utils/logging';

type RpcUid = number;

export const UserConnectResponse: HandlerType<
  {|
    accepted: true,
    tabId: ?number,
    publicDeriverId: number,
    auth: ?WalletAuthEntry,
  |} | {|
    accepted: false,
    tabId: ?number,
  |},
  void
> = Object.freeze({
  typeTag: 'connect-response',

  handle: async (request) => {
    const { tabId } = request;
    if (tabId == null) return;
    const connection = await getConnectedSite(tabId);
    if (connection?.status?.requestType != null) {
      if (request.accepted === true) {
        connectContinuation(
          connection?.status?.requestType,
          request.publicDeriverId,
          request.auth,
          tabId,
        );
        connection.status = {
          publicDeriverId: request.publicDeriverId,
          auth: request.auth,
        };
        await setConnectedSite(tabId, connection);
      } else {
        connectContinuation(
          connection?.status?.requestType,
          null,
          null,
          tabId,
        );
        await deleteConnectedSite(tabId);
      }
    }
  }
});

export type ConnectorCreateAuthEntryRequestType = {|
  appAuthID: ?string,
  publicDeriverId: number,
  password: string,
|};

export const CreateAuthEntry: HandlerType<
  ConnectorCreateAuthEntryRequestType,
  ?WalletAuthEntry | {| error: string |},
> = Object.freeze({
  typeTag: 'connect-auth-entry',

  handle: async (request) => {
    const publicDeriver = await getPublicDeriverById(request.publicDeriverId);
    const withPubKey = asGetPublicKey(publicDeriver);
    if (withPubKey == null) {
      throw new Error('unexpected missing asGetPublicKey result');
    }
    const checksum = await getWalletChecksum(withPubKey);
    try {
      const result = await createAuthEntry({
        appAuthID: request.appAuthID,
        deriver: publicDeriver,
        checksum,
        password: request.password
      });
      return result;
    } catch (error) {
      return { error: error.name };
    }
  },
});

type ConfirmedSignData = {|
  tx: CardanoTx | CardanoTxRequest | Array<RemoteUnspentOutput> | null,
  uid: RpcUid,
  tabId: number,
  password: string,
  // hardware wallet:
  witnessSetHex?: ?string,
|};

export const UserSignConfirm: HandlerType<
  ConfirmedSignData,
  void
> = Object.freeze({
  typeTag: 'user-sign-confirm',

  handle: async (request) => {
    const rpcResponse = (response: {| ok: any |} | {| err: any |}) => {
      sendToInjector(
        request.tabId,
        {
          type: 'connector_rpc_response',
          protocol: responseData.protocol,
          uid: request.uid,
          return: response
        }
      );
    };

    const connection = await getConnectedSite(request.tabId);
    if (connection == null) {
      // fixme: should response with `rpcResponse`
      throw new ConnectorError({
        code: APIErrorCodes.API_INTERNAL_ERROR,
        info: 'Connection has failed. Please retry.',
      });
    }
    const responseData = connection.pendingSigns[String(request.uid)];
    if (!responseData) {
      // fixme: should response with `rpcResponse`
      throw new ConnectorError({
        code: APIErrorCodes.API_INTERNAL_ERROR,
        info: `Sign request data is not available after confirmation (uid=${request.uid}). Please retry.`,
      });
    }

    switch (responseData.request.type) {
      case 'tx/cardano':
      {
        let resp;
        try {
          let signedTxWitnessSetHex;
          if (request.password) {
            signedTxWitnessSetHex = await signCardanoTx(
              (request.tx: any),
              request.password,
              request.tabId
            );
          } else if (request.witnessSetHex) {
            signedTxWitnessSetHex = request.witnessSetHex;
          } else {
            throw new Error('missing password or witness from connector dialog');
          }
          resp = { ok: signedTxWitnessSetHex };
        } catch (error) {
          resp = { err: 'transaction signing failed' };
        }
        if (responseData.continuationData.type !== 'cardano-tx') {
          rpcResponse({ err: 'unexpected error' });
          return;
        }
        const { tx, returnTx } = responseData.continuationData;
        if (resp?.ok == null) {
          rpcResponse(resp);
        } else {
          const resultWitnessSetHex: string = resp.ok;
          if (returnTx) {
            const inputWitnessSetHex: string | null = RustModule.WasmScope(Scope => {
              try {
                const fullTx = Scope.WalletV4.FixedTransaction.from_hex(tx);
                return fullTx.witness_set().to_hex();
              } catch {
                // no input witness set
                return null;
              }
            });
            const isFullTx = inputWitnessSetHex != null;
            const finalWitnessSetHex = inputWitnessSetHex == null
                  ? resultWitnessSetHex
                  : mergeWitnessSets(inputWitnessSetHex, resultWitnessSetHex);
            RustModule.WasmScope(Scope => {
              let fullTx;
              if (isFullTx) {
                fullTx = Scope.WalletV4.FixedTransaction.from_hex(tx);
                fullTx.set_witness_set(hexToBytes(finalWitnessSetHex));
              } else {
                fullTx = Scope.WalletV4.FixedTransaction.new(
                  hexToBytes(tx),
                  hexToBytes(finalWitnessSetHex),
                  true,
                );
              }
              rpcResponse({ ok: fullTx.to_hex() });
            });
          } else {
            rpcResponse({ ok: resultWitnessSetHex });
          }
        }
      }
        break;
      case 'data':
      {
        if (responseData.continuationData.type !== 'cardano-data') {
          rpcResponse({ err: 'unexpected error' });
          return;
        }
        const { address, payload } = responseData.continuationData;
        let dataSig;
        try {
          dataSig = await withDb(async (db, localStorageApi) => {
            return await withSelectedWallet(
              request.tabId,
              async (wallet) => {
                const addressing = await getAddressing(wallet, address);
                if (!addressing) {
                  throw new Error('key derivation path does not exist');
                }
                return await connectorSignData(
                  wallet,
                  request.password,
                  addressing,
                  address,
                  payload,
                );
              },
              db,
              localStorageApi,
              false,
            );
          });
        } catch (error) {
          Logger.error(`error when signing data ${error}`);
          rpcResponse(
            {
              err: {
                code: DataSignErrorCodes.DATA_SIGN_PROOF_GENERATION,
                info: error.message,
              }
            }
          );
          return;
        }
        rpcResponse({ ok: dataSig });
      }
        break;
      case 'tx-reorg/cardano':
      {
        if (responseData.continuationData.type !== 'cardano-reorg-tx') {
          rpcResponse({ err: 'unexpected error' });
          return;
        }
        const { isCBOR } = responseData.continuationData;
        const utxos = await transformCardanoUtxos(
          // Only one utxo from the result of the reorg transaction is packed and returned here
          [...(request.tx: any)],
          isCBOR
        );
        rpcResponse({ ok: utxos });
      }
        break;
      default:
        // log?
        break;
    }
    delete connection.pendingSigns[String(request.uid)];
    await setConnectedSite(request.tabId, connection);
  },
});

/**
 * Returns HEX of a serialised witness set
 */
async function signCardanoTx(
  tx: CardanoTx,
  password: string,
  tabId: number
): Promise<string> {
  return await withDb(async (db, localStorageApi) => {
    return await withSelectedWallet(
      tabId,
      async (wallet) => {
        return await connectorSignCardanoTx(
          wallet,
          password,
          tx,
        );
      },
      db,
      localStorageApi
    );
  });
}

export const UserSignReject: HandlerType<
  {|
    uid: RpcUid,
    tabId: number,
  |},
  void
> = Object.freeze({
  typeTag: 'user-sign-reject',

  handle: async (request) => {
    const connection = await getConnectedSite(request.tabId);
    const responseData = connection?.pendingSigns[String(request.uid)];
    if (connection && responseData) {
      const code = responseData.request?.type === 'data'
        ? DataSignErrorCodes.DATA_SIGN_USER_DECLINED
        : TxSignErrorCodes.USER_DECLINED;

      sendToInjector(
        request.tabId,
        {
          type: 'connector_rpc_response',
          protocol: responseData.protocol,
          uid: request.uid,
          return: {
            err: {
              code,
              info: 'User rejected'
            },
          },
        }
      );
      delete connection.pendingSigns[String(request.uid)];
      await setConnectedSite(request.tabId, connection);
    } else {
      // eslint-disable-next-line no-console
      console.error(`couldn't find tabId: ${request.tabId}`);
    }
  },
});

export const SignFail: HandlerType<
  {|
    errorType: string,
    data: string,
    uid: RpcUid,
    tabId: number,
  |},
  void
> = Object.freeze({
  typeTag: 'sign-error',

  handle: async (request) => {
    const connection = await getConnectedSite(request.tabId);
    const responseData = connection?.pendingSigns[String(request.uid)];
    if (connection && responseData) {
      const code = responseData.request?.type === 'data'
        ? DataSignErrorCodes.DATA_SIGN_PROOF_GENERATION
        : TxSignErrorCodes.PROOF_GENERATION;

      sendToInjector(
        request.tabId,
        {
          type: 'connector_rpc_response',
          protocol: responseData.protocol,
          uid: request.uid,
          return: {
            err: {
              code,
              info: `utxo error: ${request.errorType} (${request.data})`
            },
          },
        }
      );
      delete connection.pendingSigns[String(request.uid)];
      await setConnectedSite(request.tabId, connection);
    } else {
      // eslint-disable-next-line no-console
      console.error(`couldn't find tabId: ${request.tabId}`);
    }
  },
});

export const SignWindowRetrieveData: HandlerType<
  void,
  SigningMessage | null,
> = Object.freeze({
  typeTag: 'tx_sign_window_retrieve_data',

  handle: async () => {
    // why do we need this?
    await new Promise(resolve => { setTimeout(resolve, 1); });
    const connectedSites = await getAllConnectedSites();
    for (const tabId of Object.keys(connectedSites)) {
      const connection = connectedSites[tabId];
      for (const uid of Object.keys(connection.pendingSigns)) {
        const responseData = connection.pendingSigns[uid];
        if (!responseData.openedWindow) {
          responseData.openedWindow = true;
          await setConnectedSite(Number(tabId), connection);
          if (connection.status?.publicDeriverId == null) {
            throw new Error('no public deriver set for request');
          }
          return {
            publicDeriverId: connection.status.publicDeriverId,
            sign: responseData.request,
            tabId: Number(tabId),
            requesterUrl: connection.url,
          };
        }
      }
    }
    return null;
  },
});

export const ConnectWindowRetrieveData: HandlerType<
  void,
  ConnectingMessage | null,
> = Object.freeze({
  typeTag: 'connect_retrieve_data',

  handle: async () => {
    const connectedSites = await getAllConnectedSites();

    for (const tabId of Object.keys(connectedSites)) {
      const connection = connectedSites[tabId];
      if (connection.status?.requestType) {
        connection.status.openedWindow = true;
        const imgBase64Url = await getFromStorage(STORAGE_KEY_IMG_BASE64);
        return {
          url: connection.url,
          protocol: connection.protocol,
          appAuthID: connection.appAuthID,
          imgBase64Url,
          tabId: Number(tabId),
        };
      }
    }
    return null;
  },
});

export const RemoveWalletFromWhiteList: HandlerType<
  {| url: string |},
  void
> = Object.freeze({
  typeTag: 'remove_wallet_from_whitelist',

  handle: async (request) => {
    const connectedSites = await getAllConnectedSites();
    for (const tabId of Object.keys(connectedSites)) {
      const site = connectedSites[tabId];
      if (site.url === request.url) {
        sendToInjector(Number(tabId), { type: 'disconnect' });
        break;
      }
    }
  },
});

export const GetConnectedSites: HandlerType<
  void,
  ConnectedSites
> = Object.freeze({
  typeTag: 'get_connected_sites',

  handle: async () => {
    const activeSites = await getAllConnectedSites();
    return {
      sites: Object.keys(activeSites).map(key => activeSites[key].url),
    };
  },
});
