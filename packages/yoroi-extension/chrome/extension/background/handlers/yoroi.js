// @flow
import { getWallets } from '../../../../app/api/common/index';
import { PublicDeriver, } from '../../../../app/api/ada/lib/storage/models/PublicDeriver/index';
import { asGetAllUtxos, asHasUtxoChains } from '../../../../app/api/ada/lib/storage/models/PublicDeriver/traits';
import type {
  CardanoTx,
  ConfirmedSignData,
  ConnectedSites,
  ConnectingMessage,
  ConnectResponseData,
  ConnectRetrieveData,
  FailedSignData,
  GetConnectedSitesData,
  GetConnectionProtocolData,
  GetUtxosRequest,
  RemoveWalletFromWhitelistData,
  SigningMessage,
  TxSignWindowRetrieveData,
  GetDb,
  SubscribeWalletStateChanges,
  CreateWallet,
} from '../../connector/types';
import {
  APIErrorCodes,
  asPaginate,
  asTokenId,
  asValue,
  ConnectorError,
  DataSignErrorCodes,
  TxSignErrorCodes,
} from '../../connector/types';
import {
  connectorCreateCardanoTx,
  connectorGenerateReorgTx,
  connectorGetBalance,
  connectorGetCardanoRewardAddresses,
  connectorGetChangeAddress,
  connectorGetCollateralUtxos,
  connectorGetUnusedAddresses,
  connectorGetUsedAddresses,
  connectorGetUtxosCardano,
  connectorRecordSubmittedCardanoTransaction,
  connectorSendTxCardano,
  connectorSignCardanoTx,
  getAddressing,
  connectorSignData,
  connectorGetAssets,
  getTokenMetadataFromIds,
  MAX_COLLATERAL,
  connectorGetDRepKey, connectorGetStakeKey,
} from '../../connector/api';
import {
  updateTransactions as cardanoUpdateTransactions
} from '../../../../app/api/ada/lib/storage/bridge/updateTransactions';
import { environment } from '../../../../app/environment';
import type { IFetcher as CardanoIFetcher } from '../../../../app/api/ada/lib/state-fetch/IFetcher.types';
import { RemoteFetcher as CardanoRemoteFetcher } from '../../../../app/api/ada/lib/state-fetch/remoteFetcher';
import { BatchedFetcher as CardanoBatchedFetcher } from '../../../../app/api/ada/lib/state-fetch/batchedFetcher';
import LocalStorageApi, {
  loadSubmittedTransactions,
} from '../../../../app/api/localStorage/index';
import { RustModule } from '../../../../app/api/ada/lib/cardanoCrypto/rustLoader';
import { Logger, stringifyError } from '../../../../app/utils/logging';
import type { lf$Database, } from 'lovefield';
import {
  getCardanoHaskellBaseConfig,
  isCardanoHaskell,
  getNetworkById,
} from '../../../../app/api/ada/lib/storage/database/prepackaged/networks';
import { authSignHexPayload } from '../../../../app/connector/api';
import type { RemoteUnspentOutput } from '../../../../app/api/ada/lib/state-fetch/types';
import { NotEnoughMoneyToSendError, } from '../../../../app/api/common/errors';
import { asAddressedUtxo as asAddressedUtxoCardano, } from '../../../../app/api/ada/transactions/utils';
import ConnectorStore from '../../../../app/connector/stores/ConnectorStore';
import type { ForeignUtxoFetcher } from '../../../../app/connector/stores/ConnectorStore';
import { find721metadata } from '../../../../app/utils/nftMetadata';
import { hexToBytes } from '../../../../app/coreUtils';
import { mergeWitnessSets } from '../../connector/utils';
import { getDb, syncWallet } from '../state';
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
  STORAGE_KEY_CONNECTION_PROTOCOL,
} from './content';
import type { ConnectedSite } from './content';
import { subscribeWalletStateChanges } from '../state';
import AdaApi from '../../../../app/api/ada';

const YOROI_MESSAGES = Object.freeze({
  CONNECT_RESPONSE: 'connect_response',
  SIGN_CONFIRMED: 'sign_confirmed',
  SIGN_REJECTED: 'sign_rejected',
  SIGN_ERROR: 'sign_error',
  SIGN_WINDOW_RETRIEVE_DATA: 'tx_sign_window_retrieve_data',
  CONNECT_WINDOW_RETRIEVE_DATA: 'connect_retrieve_data',
  REMOVE_WALLET_FROM_WHITELIST: 'remove_wallet_from_whitelist',
  GET_CONNECTED_SITES: 'get_connected_sites',
  GET_PROTOCOL: 'get_protocol',
  GET_UTXOS_ADDRESSES: 'get_utxos/addresses',
  GET_DB: 'get-db',
  SUBSCRIBE_WALLET_STATE_CHANGES: 'subscribe-wallet-state-changes',
  CREATE_WALLET: 'create-wallet',
  CREAET_HARDWARE_WALLET: 'create-hardware-wallet',
});

// messages from other parts of Yoroi (i.e. the UI for the connector)
export async function yoroiMessageHandler(
  request: (
    ConnectResponseData
    | ConfirmedSignData
    | FailedSignData
    | TxSignWindowRetrieveData
    | ConnectRetrieveData
    | RemoveWalletFromWhitelistData
    | GetConnectedSitesData
    | GetConnectionProtocolData
    | GetUtxosRequest
    | GetDb
    | SubscribeWalletStateChanges
    | CreateWallet
  ),
  sender: any,
  sendResponse: Function,
) {
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

  if (request.type === YOROI_MESSAGES.CONNECT_RESPONSE) {
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
  } else if (request.type === YOROI_MESSAGES.SIGN_CONFIRMED) {
    const connection = await getConnectedSite(request.tabId);
    if (connection == null) {
      throw new ConnectorError({
        code: APIErrorCodes.API_INTERNAL_ERROR,
        info: 'Connection has failed. Please retry.',
      });
    }
    const responseData = connection.pendingSigns[String(request.uid)];
    if (!responseData) {
      throw new ConnectorError({
        code: APIErrorCodes.API_INTERNAL_ERROR,
        info: `Sign request data is not available after confirmation (uid=${request.uid}). Please retry.`,
      });
    }
    const password = request.pw;

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


    switch (responseData.request.type) {
      case 'tx/cardano':
      {
        let resp;
        try {
          let signedTxWitnessSetHex;
          if (password) {
            signedTxWitnessSetHex = await signCardanoTx(
              (request.tx: any),
              password,
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
                  password,
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
  } else if (request.type === YOROI_MESSAGES.SIGN_REJECTED) {
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
  } else if (request.type === YOROI_MESSAGES.SIGN_ERROR) {
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
  } else if (request.type === YOROI_MESSAGES.SIGN_WINDOW_RETRIEVE_DATA) {
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
            throw new Error(`${request.type} no public deriver set for request`);
          }
          sendResponse(({
            publicDeriverId: connection.status.publicDeriverId,
            sign: responseData.request,
            tabId: Number(tabId),
            requesterUrl: connection.url,
          }: SigningMessage));
          return;
        }
      }
    }
  } else if (request.type === YOROI_MESSAGES.CONNECT_WINDOW_RETRIEVE_DATA) {
    const connectedSites = await getAllConnectedSites();

    for (const tabId of Object.keys(connectedSites)) {
      const connection = connectedSites[tabId];
      if (connection.status != null) {
        if (connection.status.requestType) {
          connection.status.openedWindow = true;
          const imgBase64Url = await getFromStorage(STORAGE_KEY_IMG_BASE64);
          sendResponse(({
            url: connection.url,
            protocol: connection.protocol,
            appAuthID: connection.appAuthID,
            imgBase64Url,
            tabId: Number(tabId),
          }: ConnectingMessage));
          return;
        }
      }
    }
    sendResponse(null);
  } else if (request.type === YOROI_MESSAGES.REMOVE_WALLET_FROM_WHITELIST) {
    const connectedSites = await getAllConnectedSites();
    for (const tabId of Object.keys(connectedSites)) {
      const site = connectedSites[tabId];
      if (site.url === request.url) {
        sendToInjector(Number(tabId), { type: 'disconnect' });
        break;
      }
    }
  } else if (request.type === YOROI_MESSAGES.GET_CONNECTED_SITES) {
    const activeSites: Array<ConnectedSite> =
      (Object.values(await getAllConnectedSites()): any);

    sendResponse(({
      sites: activeSites.map(site => site.url),
    }: ConnectedSites));
  } else if (request.type === YOROI_MESSAGES.GET_PROTOCOL) {
    const connectionProtocol = await getFromStorage(STORAGE_KEY_CONNECTION_PROTOCOL) ||
      'cardano';
    sendResponse({ type: connectionProtocol })
  } else if (request.type === YOROI_MESSAGES.GET_UTXOS_ADDRESSES) {
    try {
      await withDb(async (db, localStorageApi) => {
        await withSelectedWallet(
          request.tabId,
          async (wallet, connection) => {
            if (connection == null) {
              Logger.error(`ERR - sign_tx could not find connection with tabId = ${request.tabId}`);
              sendResponse({ utxos: null })
              return
            }
            const withUtxos = asGetAllUtxos(wallet)

            if (withUtxos == null) {
              throw new Error(`missing utxo functionality`);
            }
            const withHasUtxoChains = asHasUtxoChains(withUtxos);
            if (withHasUtxoChains == null) {
              throw new Error(`missing chains functionality`);
            }

            const addressesMap = {
              usedAddresses: async () => await connectorGetUsedAddresses(wallet, null),
              unusedAddresses: async () => await connectorGetUnusedAddresses(wallet),
              changeAddress: async () => await connectorGetChangeAddress(wallet),
              utxos: async () =>  await withHasUtxoChains.getAllUtxos(),
            }

            const response = {}

            for(const key of request.select) {
              response[key] = await addressesMap[key]()
            }

            sendResponse(response)
          },
          db,
          localStorageApi,
        )
      });
    } catch (error) {
      Logger.error(`Get utxos faild for tabId = ${request.tabId}`);
    }
  } else if (request.type === YOROI_MESSAGES.GET_DB) {
    const db = await getDb();
    const data = await db.export();
    sendResponse(JSON.stringify(data));
  } else if (request.type === YOROI_MESSAGES.SUBSCRIBE_WALLET_STATE_CHANGES) {
    const data = await subscribeWalletStateChanges(sender.tab.id);
    sendResponse(JSON.stringify(data));
  } else if (request.type === YOROI_MESSAGES.CREATE_WALLET) {
    try {
      const db = await getDb();
      const network = getNetworkById(request.request.networkId);

      const adaApi = new AdaApi();
      await adaApi.createWallet({
        db,
        network,
        recoveryPhrase: request.request.recoveryPhrase,
        walletName: request.request.walletName,
        walletPassword: request.request.walletPassword,
        accountIndex: request.request.accountIndex,
      });
    } catch(error) {
      sendResponse({ error: error.message });
      return;
    }
    sendResponse({ error: null });
  } else if (request.type === YOROI_MESSAGES.CREATE_HARDWARE_WALLET) {
    //fixme
  } else {
    console.error(`unknown message ${JSON.stringify(request)} from ${sender.tab.id}`)
  }
}

export function isYoroiMessage({ type }: {| type: string |}): boolean {
  return Object.values(YOROI_MESSAGES).includes(type);
}
