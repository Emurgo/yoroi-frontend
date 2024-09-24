// Handlers for connector window messages
// @flow

import type { HandlerType } from './type';
import {
  getConnectedSite,
  connectContinuation,
  setConnectedSite,
  deleteConnectedSite,
  getAllConnectedSites,
  getConnectedWallet,
} from '../content/connect';
import { sendToInjector } from '../content/utils';

import { getPublicDeriverById } from './utils';
import { asGetPublicKey } from '../../../../../app/api/ada/lib/storage/models/PublicDeriver/traits';
import {
  connectorSignCardanoTx,
  transformCardanoUtxos,
} from '../../../connector/api';
import { createAuthEntry } from '../../../../../app/connector/api';
import { getWalletChecksum } from '../../../../../app/api/export/utils';
import type CardanoTxRequest from '../../../../../app/api/ada';
import type { RemoteUnspentOutput } from '../../../../../app/api/ada/lib/state-fetch/types';
import {
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
import { walletSignData } from '../../../../../app/api/ada';

type RpcUid = number;

function rpcResponse(
  tabId: number,
  uid: RpcUid,
  response: {| ok: any |} | {| err: any |}
) {
  sendToInjector(
    tabId,
    {
      type: 'connector_rpc_response',
      uid,
      return: response,
      protocol: 'cardano',
    }
  );
};


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
    const connection = await getConnectedSite(request.tabId);
    if (connection == null) {
      console.error('Handling user sign confirmation but lost connection to dApp site.');
      return;
    }
    const responseData = connection.pendingSigns[String(request.uid)];
    if (!responseData) {
      console.error('Handling user sign confirmation but signing request is unexpectedly missing..');
      return;
    }

    const wallet = await getConnectedWallet(request.tabId, false);

    switch (responseData.request.type) {
      case 'tx/cardano':
      {
        let resp;
        try {
          let signedTxWitnessSetHex;
          if (request.password) {
            signedTxWitnessSetHex = await connectorSignCardanoTx(
              wallet,
              request.password,
              (request.tx: any),
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
          rpcResponse(request.tabId, request.uid, { err: 'unexpected error' });
          return;
        }
        const { tx, returnTx } = responseData.continuationData;
        if (resp?.ok == null) {
          rpcResponse(request.tabId, request.uid, resp);
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
              rpcResponse(request.tabId, request.uid, { ok: fullTx.to_hex() });
            });
          } else {
            rpcResponse(request.tabId, request.uid, { ok: resultWitnessSetHex });
          }
        }
      }
        break;
      case 'data':
      {
        if (responseData.continuationData.type !== 'cardano-data') {
          rpcResponse(request.tabId, request.uid, { err: 'unexpected error' });
          return;
        }
        const { address, payload } = responseData.continuationData;
        let dataSig;
        try {
          dataSig = await walletSignData(
            wallet,
            request.password,
            address,
            payload,
          );
        } catch (error) {
          Logger.error(`error when signing data ${error}`);
          rpcResponse(
            request.tabId,
            request.uid,
            {
              err: {
                code: DataSignErrorCodes.DATA_SIGN_PROOF_GENERATION,
                info: error.message,
              }
            }
          );
          return;
        }
        rpcResponse(request.tabId, request.uid, { ok: dataSig });
      }
        break;
      case 'tx-reorg/cardano':
      {
        if (responseData.continuationData.type !== 'cardano-reorg-tx') {
          rpcResponse(request.tabId, request.uid, { err: 'unexpected error' });
          return;
        }
        const { isCBOR } = responseData.continuationData;
        const utxos = await transformCardanoUtxos(
          // Only one utxo from the result of the reorg transaction is packed and returned here
          [...(request.tx: any)],
          isCBOR
        );
        rpcResponse(request.tabId, request.uid, { ok: utxos });
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

      rpcResponse(
        request.tabId,
        request.uid,
        {
          err: {
            code,
            info: 'User rejected'
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

      rpcResponse(
        request.tabId,
        request.uid,
        {
          err: {
            code,
            info: `utxo error: ${request.errorType} (${request.data})`
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

        return {
          url: connection.url,
          appAuthID: connection.appAuthID,
          imgBase64Url: connection.imgBase64Url,
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
