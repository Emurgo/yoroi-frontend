// @flow
import { PublicDeriver, } from '../../../../../app/api/ada/lib/storage/models/PublicDeriver/index';
import LocalStorageApi, {
  loadSubmittedTransactions,
} from '../../../../../app/api/localStorage';
import { RustModule } from '../../../../../app/api/ada/lib/cardanoCrypto/rustLoader';
import { Logger } from '../../../../../app/utils/logging';
import { NotEnoughMoneyToSendError, } from '../../../../../app/api/common/errors';
import {
  type PendingSignData,
  type AccountBalance,
  type Value,
  type Address,
  APIErrorCodes,
  asPaginate,
  asTokenId,
  asValue,
  ConnectorError,
  DataSignErrorCodes,
} from '../../../connector/types';
import type {
  IFetcher as CardanoIFetcher
} from '../../../../../app/api/ada/lib/state-fetch/IFetcher.types';
import { getCardanoStateFetcher, } from '../../utils';
import AdaApi, { getAddressing } from '../../../../../app/api/ada';
import { find721metadata } from '../../../../../app/utils/nftMetadata';
import {
  connectorCreateCardanoTx,
  connectorGetBalance,
  connectorGetCardanoRewardAddresses,
  connectorGetChangeAddress,
  connectorGetCollateralUtxos,
  connectorGetUnusedAddresses,
  connectorGetUsedAddressesWithPaginate,
  connectorGetUtxosCardano,
  connectorRecordSubmittedCardanoTransaction,
  connectorSendTxCardano,
  connectorGetAssets,
  getTokenMetadataFromIds,
  MAX_COLLATERAL,
  connectorGetDRepKey,
  connectorGetStakeKey,
  transformCardanoUtxos,
  assetToRustMultiasset,
} from '../../../connector/api';
import { authSignHexPayload } from '../../../../../app/connector/api';
import {
  getCardanoHaskellBaseConfig,
} from '../../../../../app/api/ada/lib/storage/database/prepackaged/networks';
import {
  sendToInjector,
  getBoundsForTabWindow,
  popupProps,
} from './utils';
import { asGetAllUtxos, } from '../../../../../app/api/ada/lib/storage/models/PublicDeriver/traits';
import { asAddressedUtxo as asAddressedUtxoCardano, } from '../../../../../app/api/ada/transactions/utils';
import {
  getConnectedSite,
  setConnectedSite,
  findWhitelistedConnection,
  connectError,
  getConnectedWallet,
  type ConnectedSite,
  type SignContinuationDataType,
} from './connect';
import type { CardanoTxRequest } from '../../../../../app/api/ada';
import type { NFTMetadata } from '../../../../../app/api/ada/lib/storage/database/primitives/tables';
import { getPublicDeriverById } from '../yoroi/utils';

declare var chrome;

async function confirmSign(
  tabId: number,
  request: PendingSignData,
  connectedSite: ConnectedSite,
  continuationData: SignContinuationDataType,
  uid: number,
): Promise<void> {
  const bounds = await getBoundsForTabWindow(tabId);

  connectedSite.pendingSigns[String(request.uid)] = {
    request,
    openedWindow: false,
    continuationData,
    uid,
  };
  await setConnectedSite(tabId, connectedSite);
  chrome.windows.create({
    ...popupProps,
    url: chrome.runtime.getURL(`/main_window_connector.html#/signin-transaction`),
    left: (bounds.width + bounds.positionX) - popupProps.width,
    top: bounds.positionY + 80,
  });
}

type RequestType<WalletType, ParamT> = {|
  wallet: WalletType,
  tabId: number,
  message: {|
    uid: number,
    params: ParamT,
    url: string,
    returnType: string,
  |},
|};

type ReturnType<ReturnT> = {|
  ok: ReturnT
|} | {|
  err: string
|} | {|
  err: {|
    code: number,
    info: string,
  |}
|} | void;

type HandleFuncType<WalletType, ParamT, ReturnT> = (
  request: RequestType<WalletType, ParamT>
) => Promise<ReturnType<ReturnT>>;

type Handler<ParamT, ReturnT> = {|
  needConnectedWallet: false,
  handle: HandleFuncType<void, ParamT, ReturnT>,
|} | {|
  needConnectedWallet: true,
  syncConnectedWallet: boolean,
  handle: HandleFuncType<PublicDeriver<>, ParamT, ReturnT>,
|};

class NewHandler {

  static basic<ParamT, ReturnT>(
    handle: HandleFuncType<void, ParamT, ReturnT>
  ): Handler<ParamT, ReturnT> {
    return { needConnectedWallet: false, handle };
  }

  static withWallet<ParamT, ReturnT>(
    handle: HandleFuncType<PublicDeriver<>, ParamT, ReturnT>
  ): Handler<ParamT, ReturnT> {
    return { needConnectedWallet: true, syncConnectedWallet: false, handle };
  }

  static withSyncedWallet<ParamT, ReturnT>(
    handle: HandleFuncType<PublicDeriver<>, ParamT, ReturnT>
  ): Handler<ParamT, ReturnT> {
    return { needConnectedWallet: true, syncConnectedWallet: true, handle };
  }
}

const signDataHandler = NewHandler.withSyncedWallet<
  [
    string, // rawAddress
    string, // payload
  ],
  void,
>(async ({ message, wallet, tabId }) => {
  const rawAddress = message.params[0];
  const payload = message.params[1];
  const connection = await getConnectedSite(tabId);
  if (connection == null) { // shouldn't happen
    Logger.error(`ERR - sign_data could not find connection with tabId = ${tabId}`);
    return undefined;
  }
  let address;
  try {
    address = Buffer.from(
      RustModule.WalletV4.Address.from_bech32(rawAddress).to_bytes()
    ).toString('hex');
  } catch {
    address = rawAddress;
  }
  const addressing = await getAddressing(wallet, address);
  if (!addressing) {
    return {
      err: {
        code: DataSignErrorCodes.DATA_SIGN_ADDRESS_NOT_PK,
        info: 'address not found',
      }
    };
  }
  await confirmSign(
    tabId,
    {
      type: 'data',
      address,
      payload,
      uid: message.uid
    },
    connection,
    {
      type: 'cardano-data',
      address,
      payload,
    },
    message.uid,
  );
});

const Handlers = Object.freeze({
  'is_enabled/cardano': NewHandler.basic<
    void,
    boolean,
  >(async ({ message, tabId }) => {
    try {
      const whitelistedEntry = await findWhitelistedConnection(
        message.url,
        false,
        new LocalStorageApi(),
      );
      const isWhitelisted = whitelistedEntry != null;
      return { ok: isWhitelisted };
    } catch (error) {
      connectError(tabId, error);
    }
  }),

  'sign_tx/cardano': NewHandler.basic<
    [
      {|
        tx: string,
        partialSign: boolean,
        returnTx: boolean
      |}
    ],
    void,
  >(async ({ message, tabId }) => {
    const connection = await getConnectedSite(tabId);
    if (connection == null) { // shouldn't happen
      Logger.error(`ERR - sign_tx could not find connection with tabId = ${tabId}`);
      return undefined;
    }
    const { tx, partialSign, returnTx } = message.params[0];
    await confirmSign(
      tabId,
      {
        type: 'tx/cardano',
        tx: { tx, partialSign, tabId },
        uid: message.uid
      },
      connection,
      {
        type: 'cardano-tx',
        returnTx,
        tx,
      },
      message.uid,
    );
  }),

  'sign_data': signDataHandler,
  'cip95_sign_data': signDataHandler,

  'get_balance': NewHandler.withSyncedWallet<
    [ string /* tokenId */ ],
    string /* cbor */ | (AccountBalance | Value) /* non-cbor */
  >(async ({ message, wallet }) => {
    const tokenId = asTokenId(message.params[0]);
    const balance = await connectorGetBalance(wallet, tokenId);
    if (message.returnType === 'cbor' && tokenId === '*' && !(typeof balance === 'string')) {
      const W4 = RustModule.WalletV4;
      const value = W4.Value.new(
        W4.BigNum.from_str(balance.default),
      );
      if (balance.assets.length > 0) {
        const mappedAssets = balance.assets.map(a => {
          const [policyId, name] = a.identifier.split('.');
          return {
            amount: a.amount,
            assetId: a.identifier,
            policyId,
            name,
          };
        })
        value.set_multiasset(assetToRustMultiasset(mappedAssets));
      }
      const result = Buffer.from(value.to_bytes()).toString('hex');
      value.free();
      return { ok: result };
    }
    return { ok: balance };
  }),

  'get_utxos/cardano': NewHandler.withSyncedWallet<
    [
      string | null, // valueExpected
      boolean, // paginate
    ],
    null,
  >(async ({ wallet, message }) => {
    const valueExpected = message.params[0] == null ? null : asValue(message.params[0]);
    const paginate = message.params[1] == null ? null : asPaginate(message.params[1]);

    const network = wallet.getParent().getNetworkInfo();
    const config = getCardanoHaskellBaseConfig(
      network
    ).reduce((acc, next) => Object.assign(acc, next), {});
    const coinsPerUtxoWord =
      RustModule.WalletV4.BigNum.from_str(config.CoinsPerUtxoWord);
    try {
      // fixme: put in wasmscope
      const utxos = await transformCardanoUtxos(
        await connectorGetUtxosCardano(
          wallet,
          valueExpected,
          paginate,
          coinsPerUtxoWord,
        ),
        message.returnType === 'cbor',
      );
      coinsPerUtxoWord.free();
      return  { ok: utxos };
    } catch (e) {
      if (e instanceof NotEnoughMoneyToSendError) {
        return { ok: null };
      }
      return { err: (e.message: string) };
    }
  }),

  'get_used_addresses': NewHandler.withWallet<
    [ boolean /* paginate */],
    Array<Address> /* cbor */| Array<string> /* non-cbor */
  >(async ({ wallet, message }) => {
    const paginate = message.params[0] == null ? null : asPaginate(message.params[0]);

    const addresses = await connectorGetUsedAddressesWithPaginate(wallet, paginate);
    if (message.returnType === 'cbor') {
      return { ok: addresses };
    }
    return { ok: await addressesToBech(addresses) };
  }),

  'get_unused_addresses': NewHandler.withWallet<
    void,
    Array<Address> /* cbor */| Array<string> /* non-cbor */
  >(async ({ wallet, message }) => {
    const addresses = await connectorGetUnusedAddresses(wallet);
    if (message.returnType === 'cbor') {
      return { ok: addresses };
    }
    return { ok: await addressesToBech(addresses) };
  }),

  'get_reward_addresses/cardano': NewHandler.withWallet<
    void,
    Array<Address> /* cbor */| Array<string> /* non-cbor */
  >(async ({ wallet, message }) => {
    const addresses = await connectorGetCardanoRewardAddresses(wallet);
    if (message.returnType === 'cbor') {
      return { ok: addresses };
    }
    return { ok: await addressesToBech(addresses) };
  }),

  'get_drep_key': NewHandler.withWallet<
    void,
    string,
  >(async ({ wallet }) => {
    const dRepKey = await connectorGetDRepKey(wallet);
    return { ok: dRepKey };
  }),

  'get_stake_key': NewHandler.withWallet<
    void,
    {| key: string, isRegistered: boolean |}
  >(async ({ wallet }) => {
    const stateFetcher: CardanoIFetcher = await getCardanoStateFetcher(new LocalStorageApi());
    const resp = await connectorGetStakeKey(
      wallet,
      stateFetcher.getAccountState,
    );
    return { ok: resp };
  }),

  'get_change_address': NewHandler.withWallet<
    void,
    string,
  >(async ({ wallet, message }) => {
    const address = await connectorGetChangeAddress(wallet);
    if (message.returnType === 'cbor') {
      return { ok: address };
    }
    return { ok: (await addressesToBech([address]))[0] };
  }),

  'submit_tx': NewHandler.withWallet<
    [ string /* tx hex */ ],
    string,
  >(async ({ wallet, message }) => {
    const txBuffer = Buffer.from(message.params[0], 'hex');
    await connectorSendTxCardano(
      wallet,
      txBuffer,
      new LocalStorageApi(),
    );
    const tx = RustModule.WalletV4.Transaction.from_bytes(
      txBuffer
    );
    const id = Buffer.from(
      RustModule.WalletV4.hash_transaction(tx.body()).to_bytes()
    ).toString('hex');
    try {
      await connectorRecordSubmittedCardanoTransaction(
        wallet,
        tx,
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('error recording submitted tx', error);
    }
    tx.free();

    return { ok: id };
  }),

  'ping': NewHandler.basic<void, boolean>(async () => {
    return { ok: true };
  }),

  'create_tx/cardano': NewHandler.withWallet<
    [ CardanoTxRequest ],
    string,
  >(async ({ wallet, message, tabId }) => {
    const connection = await getConnectedSite(tabId);
    if (connection == null) { // shouldn't happen
      Logger.error(`ERR - sign_tx could not find connection with tabId = ${tabId}`);
      return;
    }
    const stateFetcher: CardanoIFetcher = await getCardanoStateFetcher(new LocalStorageApi());
    const networkInfo = wallet.getParent().getNetworkInfo();
    const adaApi = new AdaApi();
    const foreignUtxoFetcher = adaApi.createForeignUtxoFetcher(stateFetcher, networkInfo);
    const resp = await connectorCreateCardanoTx(
      wallet,
      null,
      message.params[0],
      foreignUtxoFetcher,
    );
    return { ok: resp };
  }),

  'get_network_id': NewHandler.withWallet<
    void,
    number,
  >(async ({ wallet, tabId }) => {
    const connection = await getConnectedSite(tabId);
    if (connection == null) { // shouldn't happen
      Logger.error(`ERR - get_network_id could not find connection with tabId = ${tabId}`);
      return;
    }
    const networkId = wallet.getParent().getNetworkInfo().BaseConfig[0].ChainNetworkId;
    return { ok: parseInt(networkId, 10) };
  }),


  'list_nfts/cardano': NewHandler.withSyncedWallet<
    void,
    {| [string]: {| metadata: NFTMetadata | null |} |}
  >(async ({ wallet }) => {
    const assets = await connectorGetAssets(wallet);
    const potentialNFTAssets = assets.filter(asset => asset.amount === '1');
    const tokenIds = potentialNFTAssets.map(asset => asset.identifier);
    const tokenMetadata = await getTokenMetadataFromIds(tokenIds, wallet);

    const nfts = {};

    for (const metadata of tokenMetadata) {
      if (!metadata.IsNFT) {
        continue;
      }
      if (metadata.Metadata.type !== 'Cardano') {
        throw new Error('this API only supports Cardano');
      }
      const nftMetadata = find721metadata(
        metadata.Metadata.policyId,
        metadata.Metadata.assetName,
        metadata.Metadata.assetMintMetadata,
      );
      if (nftMetadata) {
        nfts[metadata.Identifier] = { metadata: nftMetadata };
      }
    }
    return { ok: nfts };
  }),


  'auth_sign_hex_payload/cardano': NewHandler.basic<
    [string],
    string,
  >(async ({ tabId, message }) => {
    const connection = await getConnectedSite(tabId);

    const auth = connection?.status?.auth;
    if (!auth) {
      return { err: 'auth_sign_hex_payload is requested but no auth is present in the connection!' };
    }
    const signatureHex = await authSignHexPayload({
        privKey: auth.privkey,
      payloadHex: message.params[0],
    });
    return { ok: signatureHex };
  }),

  'auth_check_hex_payload/cardano': NewHandler.basic<
    [
      string,
      string
    ],
    boolean
  >(async ({ tabId, message }) => {
    const connection = await getConnectedSite(tabId);
    if (!connection) {
      throw new Error(`could not find tabId ${tabId} in connected sites`);
    }
    if (typeof connection.status?.publicDeriverId !== 'number') {
      throw new Error('site not connected yet');
    }
    if (!connection?.status?.auth) {
      return { err: 'auth_check_hex_payload is requested but no auth is present in the connection!' };
    }
    const [payloadHex, signatureHex] = message.params;
    const pk = RustModule.WalletV4.PublicKey
          .from_bytes(Buffer.from(String(connection.status?.auth?.pubkey), 'hex'));
    const sig = RustModule.WalletV4.Ed25519Signature.from_hex(signatureHex);
    const res = pk.verify(Buffer.from(payloadHex, 'hex'), sig);
    pk.free();
    return { ok: res };
  }),

  'get_collateral_utxos': NewHandler.withSyncedWallet<
    string,
    void,
  >(async ({ wallet, tabId, message }) => {
    const firstParam = message.params[0];
    const definedRequiredAmount = !!firstParam;
    let requiredAmount: string = firstParam || String(MAX_COLLATERAL);
    if (!/^\d+$/.test(requiredAmount)) {
      try {
        requiredAmount = RustModule.WalletV4.Value.from_bytes(
          Buffer.from(requiredAmount, 'hex')
        ).coin().to_str();
      } catch {
        return {
          err: {
            code: APIErrorCodes.API_INVALID_REQUEST,
            info: 'failed to parse the required collateral amount',
          },
        };
      }
    }
    // try to get enough collaterals from existing UTXOs
    const withUtxos = asGetAllUtxos(wallet)
    if (withUtxos == null) {
      throw new Error('wallet doesn\'t support IGetAllUtxos');
    }
    const walletUtxos = await withUtxos.getAllUtxos();
    const addressedUtxos = asAddressedUtxoCardano(walletUtxos);
    const submittedTxs = await loadSubmittedTransactions() || [];
    const {
      utxosToUse,
      reorgTargetAmount
    } = await connectorGetCollateralUtxos(
      wallet,
      requiredAmount,
      addressedUtxos.map(u => {
        // eslint-disable-next-line no-unused-vars
        const { addressing, ...rest } = u;
        return rest;
      }),
      submittedTxs,
    );
    const isEnough = reorgTargetAmount == null;
    const someCollateralIsSelected = utxosToUse.length > 0;
    const canAnswer = isEnough || (someCollateralIsSelected && !definedRequiredAmount)
    // do have enough
    if (canAnswer) {
      const utxos = await transformCardanoUtxos(
        utxosToUse,
        message.returnType === 'cbor'
      );
      return {
        ok: utxos,
      };
    }

    if (reorgTargetAmount != null) {

      // not enough suitable UTXOs for collateral
      // see if we can re-organize the UTXOs
      // `utxosToUse` are UTXOs that are already picked
      // `requiredAmount` is the amount needed to respond
      const usedUtxoIds = utxosToUse.map(utxo => utxo.utxo_id);
      try {
        const adaApi = new AdaApi();
        await adaApi.createReorgTx(
          wallet,
          usedUtxoIds,
          // `requiredAmount` is used here instead of the `reorgTargetAmount`
          // this is by design to minimise the number of collateral utxos
          requiredAmount,
          addressedUtxos,
          submittedTxs,
        );
      } catch (error) {
        if (error instanceof NotEnoughMoneyToSendError) {
          return {
            err: {
              code: APIErrorCodes.API_INTERNAL_ERROR,
              info: 'not enough UTXOs'
            }
          };
        }
        throw error;
      }
      // we can get enough collaterals after re-organization
      // pop-up the UI
      const connection = await getConnectedSite(tabId);
      if (connection == null) {
        throw new Error(
          `ERR - get_collateral_utxos could not find connection with tabId = ${tabId}`
        );
      }

      await confirmSign(
        tabId,
        {
          type: 'tx-reorg/cardano',
          tx: {
            usedUtxoIds,
            reorgTargetAmount: requiredAmount,
            utxos: walletUtxos,
          },
          uid: message.uid,
        },
        connection,
        {
          type: 'cardano-reorg-tx',
          utxosToUse,
          isCBOR: message.returnType === 'cbor',
        },
        message.uid,
      );
    }
  }),

  'get-theme-mode': NewHandler.basic<
    void,
    'dark' | 'light'
  >(async () => {
    const localStorageApi = new LocalStorageApi();
    const theme = await localStorageApi.getUserThemeMode();
    return { ok: theme || 'light' };
  }),
});

function sendRpcResponse(response: Object, tabId: number, messageUid: number) {
  sendToInjector(
    tabId,
    {
      type: 'connector_rpc_response',
      uid: messageUid,
      return: response,
      // the content script expects this:
      protocol: 'cardano',
    }
  );
}


export async function handleRpc(message: Object, sender: Object) {
  const tabId = sender.tab.id;

  Logger.debug(`[yoroi][handleInjectorConnect] ${message.function} (Return type is: ${message.returnType})`);

  try {
    await RustModule.load();

    const returnType = message.returnType;
    if (returnType !== 'cbor' && returnType !== 'json') {
      throw ConnectorError.invalidRequest(`Invalid return type "${returnType}". Expected "cbor" or "json"`);
    }

    const handler = Handlers[message.function];

    if (!handler) {
      sendRpcResponse(
        {
          err: {
            code: APIErrorCodes.API_INVALID_REQUEST,
            info: `unknown API function: ${message.function}`
          }
        },
        tabId,
        message.uid,
      );
      return;
    }

    let connectedWallet = undefined;
    if (handler.needConnectedWallet) {
      try {
        connectedWallet = await getConnectedWallet(tabId, handler.syncConnectedWallet);
      } catch (error) {
        // fixme: unsafe
        const localStorageApi = new LocalStorageApi();
        const publicDeriverId = await localStorageApi.getSelectedWalletId();
        if (publicDeriverId == null) {
          sendRpcResponse(
            {
              err: 'no wallet',
            },
            tabId,
            message.uid,
          );
          return;
        }
        connectedWallet = await getPublicDeriverById(publicDeriverId);
      }
    }

    const result = await handler.handle({
      wallet: connectedWallet,
      tabId,
      message,
    });

    if (result !== undefined) {
      sendRpcResponse(result, tabId, message.uid);
    }
  } catch (error) {
    if (error instanceof ConnectorError) {
      sendRpcResponse(
        { err: error.toAPIError() },
        tabId,
        message.uid
      );
    } else {
      const func = message.function;
      const args = message.params.map(JSON.stringify).join(', ');
      const msg = `Yoroi internal error: RPC call ${func}(${args}) failed due to internal error: ${error}`;
      const info = error?.stack == null ? msg : `${msg}\n${error.stack}`;
      Logger.error(info);
      sendRpcResponse(
        { err: { code: APIErrorCodes.API_INTERNAL_ERROR, info } },
        tabId,
        message.uid
      );
    }
  }
}

async function addressesToBech(addressesHex: string[]): Promise<string[]> {
  return addressesHex.map(addrHex => {
    const addr = RustModule.WalletV4.Address.from_hex(addrHex);
    const bech32 = addr.to_bech32();
    addr.free();
    return bech32;
  });
}
