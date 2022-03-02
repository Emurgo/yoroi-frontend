/* eslint-disable promise/always-return */
// @flow
import BigNumber from 'bignumber.js';
import { observable, action, runInAction, computed, toJS } from 'mobx';
import Request from '../../stores/lib/LocalizedRequest';
import Store from '../../stores/base/Store';
import type {
  ConfirmedSignData,
  ConnectedSites,
  ConnectingMessage,
  ConnectRetrieveData,
  FailedSignData,
  GetConnectedSitesData,
  Protocol,
  PublicDeriverCache,
  RemoveWalletFromWhitelistData,
  SigningMessage,
  Tx,
  TxSignWindowRetrieveData,
  WhitelistEntry,
} from '../../../chrome/extension/ergo-connector/types';
import type { ActionsMap } from '../actions/index';
import type { StoresMap } from './index';
import type { CardanoConnectorSignRequest } from '../types';
import { LoadingWalletStates } from '../types';
import { getWallets } from '../../api/common/index';
import {
  getCardanoHaskellBaseConfig,
  getErgoBaseConfig,
  isCardanoHaskell,
  isErgo,
} from '../../api/ada/lib/storage/database/prepackaged/networks';
import {
  asGetAllUtxos,
  asGetBalance,
  asGetPublicKey,
  asHasUtxoChains,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import { MultiToken } from '../../api/common/lib/MultiToken';
import { addErgoAssets } from '../../api/ergo/lib/storage/bridge/updateTransactions';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type { ISignRequest } from '../../api/common/lib/transactions/ISignRequest';
import { ErgoExternalTxSignRequest } from '../../api/ergo/lib/transactions/ErgoExternalTxSignRequest';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { toRemoteUtxo } from '../../api/ergo/lib/transactions/utils';
import { mintedTokenInfo } from '../../../chrome/extension/ergo-connector/utils';
import { Logger } from '../../utils/logging';
import { asAddressedUtxo, multiTokenFromCardanoValue, multiTokenFromRemote, } from '../../api/ada/transactions/utils';
import { genTimeToSlot, } from '../../api/ada/lib/storage/bridge/timeUtils';
import {
  connectorGetUsedAddresses,
  connectorGetUnusedAddresses,
  connectorGetChangeAddress,
} from '../../../chrome/extension/ergo-connector/api';
import { getWalletChecksum } from '../../api/export/utils';
import { WalletTypeOption } from '../../api/ada/lib/storage/models/ConceptualWallet/interfaces';

// Need to run only once - Connecting wallets
let initedConnecting = false;
function sendMsgConnect(): Promise<ConnectingMessage> {
  return new Promise((resolve, reject) => {
    if (!initedConnecting)
      window.chrome.runtime.sendMessage((
        { type: 'connect_retrieve_data' }: ConnectRetrieveData),
        response => {
          if (window.chrome.runtime.lastError) {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject('Could not establish connection: connect_retrieve_data ');
          }

          resolve(response);
          initedConnecting = true;
        }
      );
  });
}

// Need to run only once - Sign Tx Confirmation
let initedSigning = false;
function sendMsgSigningTx(): Promise<SigningMessage> {
  return new Promise((resolve, reject) => {
    if (!initedSigning)
      window.chrome.runtime.sendMessage(
        ({ type: 'tx_sign_window_retrieve_data' }: TxSignWindowRetrieveData),
        response => {
          if (window.chrome.runtime.lastError) {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject('Could not establish connection: connect_retrieve_data ');
          }

          resolve(response);
          initedSigning = true;
        }
      );
  });
}

export function getProtocol(): Promise<?Protocol> {
  return new Promise((resolve, reject) => {
      window.chrome.runtime.sendMessage(
        ({ type: 'get_protocol' }),
        response => {
          if (window.chrome.runtime.lastError) {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject('Could not establish connection: get_protocol ');
          }

          resolve(response);
        }
      );
  });
}

export function getConnectedSites(): Promise<ConnectedSites> {
  return new Promise((resolve, reject) => {
    if (!initedSigning)
      window.chrome.runtime.sendMessage(
        ({ type: 'get_connected_sites' }: GetConnectedSitesData),
        response => {
          if (window.chrome.runtime.lastError) {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject('Could not establish connection: get_connected_sites ');
          }

          resolve(response);
        }
      );
  });
}

export async function parseWalletsList(
  wallets: Array<PublicDeriver<>>
  ): Promise<Array<PublicDeriverCache>> {
  const result = [];
  for (const currentWallet of wallets) {
    const conceptualInfo = await currentWallet.getParent().getFullConceptualWalletInfo();
    const withPubKey = asGetPublicKey(currentWallet);

    const canGetBalance = asGetBalance(currentWallet);
    const balance = canGetBalance == null
      ? new MultiToken([], currentWallet.getParent().getDefaultToken())
      : await canGetBalance.getBalance();
    result.push({
      publicDeriver: currentWallet,
      name: conceptualInfo.Name,
      balance,
      checksum: await getWalletChecksum(withPubKey)
    });
  }

  return result
}

type GetWhitelistFunc = void => Promise<?Array<WhitelistEntry>>;
type SetWhitelistFunc = {|
  whitelist: Array<WhitelistEntry> | void,
|} => Promise<void>;

export default class ConnectorStore extends Store<StoresMap, ActionsMap> {
  @observable connectingMessage: ?ConnectingMessage = null;
  @observable whiteList: Array<WhitelistEntry> = [];

  @observable loadingWallets: $Values<typeof LoadingWalletStates> = LoadingWalletStates.IDLE;
  @observable errorWallets: string = '';
  @observable wallets: Array<PublicDeriverCache> = [];
  /**
   * - `filteredWallets`: includes only cardano or ergo wallets according to the `protocol`
   *   it will be displyed to the user at the `connect` screen for the user to choose
   *   which wallet to connect
   * - `allWallets`: list of all wallets the user have in yoroi
   *    Will be displayed in the on the `connected webists screen` as we need all wallets
   *    not only ergo or cardano ones
   */
  @observable filteredWallets: Array<PublicDeriverCache> = [];
  @observable allWallets: Array<PublicDeriverCache> = [];
  @observable protocol: ?string = ''
  @observable getConnectorWhitelist: Request<
    GetWhitelistFunc
  > = new Request<GetWhitelistFunc>(
    this.api.localStorage.getWhitelist
  );
  @observable setConnectorWhitelist: Request<SetWhitelistFunc> = new Request<
    SetWhitelistFunc
  >(({ whitelist }) => this.api.localStorage.setWhitelist(whitelist));

  @observable getConnectedSites: Request<
    typeof getConnectedSites
  > = new Request<typeof getConnectedSites>(
    getConnectedSites
  );

  @observable signingMessage: ?SigningMessage = null;

  @observable adaTransaction: ?CardanoConnectorSignRequest = null;

  setup(): void {
    super.setup();
    this.actions.connector.getResponse.listen(this._getConnectingMsg);
    this.actions.connector.getConnectorWhitelist.listen(this._getConnectorWhitelist);
    this.actions.connector.updateConnectorWhitelist.listen(this._updateConnectorWhitelist);
    this.actions.connector.removeWalletFromWhitelist.listen(this._removeWalletFromWhitelist);
    this.actions.connector.confirmSignInTx.listen(this._confirmSignInTx);
    this.actions.connector.cancelSignInTx.listen(this._cancelSignInTx);
    this.actions.connector.getSigningMsg.listen(this._getSigningMsg);
    this.actions.connector.refreshActiveSites.listen(this._refreshActiveSites);
    this.actions.connector.refreshWallets.listen(this._getWallets);
    this.actions.connector.closeWindow.listen(this._closeWindow);
    this._getConnectorWhitelist();
    this._getConnectingMsg();
    this._getSigningMsg();
    this._getProtocol()
    this.currentConnectorWhitelist;
  }

  teardown(): void {
    super.teardown();
  }

  // ========== general ========== //
  @action
  _closeWindow() {
    window.close();
  }

  // ========== connecting wallets ========== //
  @action
  _getConnectingMsg: () => Promise<void> = async () => {
    await sendMsgConnect()
      .then(response => {
        runInAction(() => {
          this.connectingMessage = response;
        });
      })
      // eslint-disable-next-line no-console
      .catch(err => console.error(err));
  };

  @action
  _getProtocol: () => Promise<void> = async () => {
    const protocol = await getProtocol()
    runInAction(() => {
      this.protocol = protocol?.type
    })
  }

  @action
  _getSigningMsg: () => Promise<void> = async () => {
    await sendMsgSigningTx()
      .then(response => {
        runInAction(() => {
          this.signingMessage = response;
        });
        if (response) {
          if (response.sign.type === 'tx/cardano') {
            this.createAdaTransaction();
          }
          if (response.sign.type === 'tx-create-req/cardano') {
            this.generateAdaTransaction();
          }
        }
      })
      // eslint-disable-next-line no-console
      .catch(err => console.error(err));
  };

  @action
  _confirmSignInTx: string => void = password => {
    if (this.signingMessage == null) {
      throw new Error(`${nameof(this._confirmSignInTx)} confirming a tx but no signing message set`);
    }
    const { signingMessage } = this;
    if (signingMessage.sign.tx == null) {
      throw new Error(`${nameof(this._confirmSignInTx)} signing non-tx is not supported`);
    }
    const sendData: ConfirmedSignData = {
      type: 'sign_confirmed',
      tx: toJS(signingMessage.sign.tx),
      uid: signingMessage.sign.uid,
      tabId: signingMessage.tabId,
      pw: password,
    };
    window.chrome.runtime.sendMessage(sendData);
    this._closeWindow();
  };
  @action
  _cancelSignInTx: void => void = () => {
    if (this.signingMessage == null) {
      throw new Error(`${nameof(this._confirmSignInTx)} confirming a tx but no signing message set`);
    }
    const { signingMessage } = this;
    const sendData: FailedSignData = {
      type: 'sign_rejected',
      uid: signingMessage.sign.uid,
      tabId: signingMessage.tabId,
    };
    window.chrome.runtime.sendMessage(sendData);
    this._closeWindow();
  };

  // ========== wallets info ========== //
  @action
  _getWallets: void => Promise<void> = async () => {
    runInAction(() => {
      this.loadingWallets = LoadingWalletStates.PENDING;
      this.errorWallets = '';
    });

    const persistentDb = this.stores.loading.getDatabase();
    if (persistentDb == null) {
      throw new Error(`${nameof(this._getWallets)} db not loaded. Should never happen`);
    }
    try {
      const wallets = (await getWallets({ db: persistentDb }))
        .filter(w => w.getParent().getWalletType() === WalletTypeOption.WEB_WALLET);

      const protocol = this.protocol;
      const isProtocolErgo = protocol === 'ergo';
      const isProtocolCardano = protocol === 'cardano';
      const isProtocolDefined = isProtocolErgo || isProtocolCardano;
      const protocolFilter = wallet => {
        const isWalletErgo = isErgo(wallet.getParent().getNetworkInfo());
        return isProtocolErgo === isWalletErgo;
      };
      const filteredWallets = isProtocolDefined
        ? wallets.filter(protocolFilter)
        : wallets;

      if (
        this.signingMessage?.sign.type !== 'tx/cardano' &&
          this.signingMessage?.sign.type !== 'tx-create-req/cardano'
      ) {
        await this._getTxAssets(filteredWallets);
      }

      const filteredWalletsResult = await parseWalletsList(filteredWallets)
      const allWallets = await parseWalletsList(wallets)

      runInAction(() => {
        this.loadingWallets = LoadingWalletStates.SUCCESS;

        // note: "replace" is a mobx-specific function
        (this.wallets: any).replace(filteredWalletsResult);
        (this.filteredWallets: any).replace(filteredWalletsResult);
        (this.allWallets: any).replace(allWallets)
      });
      if (this.signingMessage?.sign.type === 'tx/cardano') {
        this.createAdaTransaction();
      }
      if (this.signingMessage?.sign.type === 'tx-create-req/cardano') {
        this.generateAdaTransaction();
      }
    } catch (err) {
      runInAction(() => {
        this.loadingWallets = LoadingWalletStates.REJECTED;
        this.errorWallets = err.message;
      });
    }
  };

  _getTxAssets: Array<PublicDeriver<>> => Promise<void> = async (publicDerivers) => {
    const persistentDb = this.stores.loading.getDatabase();
    if (persistentDb == null) {
      throw new Error(`${nameof(this._getWallets)} db not loaded. Should never happen`);
    }
    if (this.signingMessage == null) return;
    const { signingMessage } = this;

    const selectedWallet = publicDerivers.find(
      wallet => wallet.getPublicDeriverId() === signingMessage.publicDeriverId
    );
    if (selectedWallet == null) return;

    if (!signingMessage.sign.tx) return;
    // Because this function is only invoked for a Ergo wallet, we know the type
    // of `tx` must be `Tx`
    const tx: Tx = (signingMessage.sign.tx: any);
    // it's possible we minted assets in this tx, so looking them up will fail
    const mintedTokenIds = mintedTokenInfo(tx, Logger.info).map(t => t.Identifier);
    const tokenIdentifiers = Array.from(new Set([
      ...tx.inputs
        .flatMap(output => output.assets)
        .map(asset => asset.tokenId),
      ...tx.outputs
        .flatMap(output => output.assets)
        .map(asset => asset.tokenId),
      // force inclusion of primary token for chain
      selectedWallet.getParent().getDefaultToken().defaultIdentifier
    ])).filter(id => !mintedTokenIds.includes(id));
    const stateFetcher = this.stores.substores.ergo.stateFetchStore.fetcher;
    try {
      await addErgoAssets({
        db: selectedWallet.getDb(),
        tokenIdentifiers,
        getAssetInfo: async (req) => {
          try {
            return await stateFetcher.getAssetInfo(req);
          } catch (e) {
            // eslint-disable-next-line no-console
              console.error('Aseet info request failed', e);
              return {};
          }
        },
        network: selectedWallet.getParent().getNetworkInfo(),
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to add ergo assets!', error);
    }
  }

  // De-serialize the tx so that the signing dialog could show the tx info (
  // inputs, outputs, fee, ...) to the user.
  createAdaTransaction: void => Promise<void> = async () => {
    if (this.signingMessage == null) return;
    const { signingMessage } = this;
    const selectedWallet = this.wallets.find(
      wallet => wallet.publicDeriver.getPublicDeriverId() === signingMessage.publicDeriverId
    );
    if (selectedWallet == null) return undefined;
    if (!signingMessage.sign.tx) return undefined;
    // Invoked only for Cardano, so we know the type of `tx` must be `CardanoTx`.
    // $FlowFixMe[prop-missing]
    const { tx/* , partialSign */, utxos } = signingMessage.sign.tx;

    const network = selectedWallet.publicDeriver.getParent().getNetworkInfo();

    if (!isCardanoHaskell(network)) {
      throw new Error(`${nameof(ConnectorStore)}::${nameof(this.createAdaTransaction)} unexpected wallet type`);
    }

    const withUtxos = asGetAllUtxos(selectedWallet.publicDeriver);
    if (withUtxos == null) {
      throw new Error(`missing utxo functionality`);
    }

    const withHasUtxoChains = asHasUtxoChains(withUtxos);
    if (withHasUtxoChains == null) {
      throw new Error(`missing chains functionality`);
    }
    // const utxos = await withHasUtxoChains.getAllUtxos();
    console.log({utxos, signingMessage: JSON.parse(JSON.stringify(signingMessage))})
    const addressedUtxos = asAddressedUtxo(utxos);

    const defaultToken = this.stores.tokenInfoStore.getDefaultTokenInfo(
      network.NetworkId
    );


    let txBody;
    const bytes = Buffer.from(tx, 'hex');
    try {
      // <TODO:USE_METADATA_AND_WITNESSES>
      txBody = RustModule.WalletV4.Transaction.from_bytes(bytes).body();
    } catch (originalErr) {
      try {
        // Try parsing as body for backward compatibility
        txBody = RustModule.WalletV4.TransactionBody.from_bytes(bytes);
      } catch (_e) {
        throw originalErr;
      }
    }

    const inputs = [];
    const foreignInputs = [];

    for (let i = 0; i < txBody.inputs().len(); i++) {
      const input = txBody.inputs().get(i);
      const txHash = Buffer.from(input.transaction_id().to_bytes()).toString('hex');
      const txIndex = input.index();
      // eslint-disable-next-line camelcase
      const utxo = addressedUtxos.find(({ tx_hash, tx_index }) =>
        // eslint-disable-next-line camelcase
        tx_hash === txHash && tx_index === txIndex
      );
      if (utxo) {
        inputs.push({
          address: utxo.receiver,
          value: multiTokenFromRemote(utxo, defaultToken.NetworkId),
        });
      } else {
        foreignInputs.push({ txHash, txIndex })
      }
    }

    const outputs = [];
    for (let i = 0; i < txBody.outputs().len(); i++) {
      const output = txBody.outputs().get(i);
      const address = Buffer.from(output.address().to_bytes()).toString('hex');
      outputs.push(
        {
          address,
          value: multiTokenFromCardanoValue(
            output.amount(),
            selectedWallet.publicDeriver.getParent().getDefaultToken(),
          ),
        }
      );
    }
    const fee = {
      tokenId: defaultToken.Identifier,
      networkId: defaultToken.NetworkId,
      amount: txBody.fee().to_str(),
    };

    const { amount, total } = await this._calculateAmountAndTotal(
      selectedWallet.publicDeriver,
      inputs,
      outputs,
      fee,
    );

    runInAction(() => {
      // <TODO:FOREIGN_INPUTS>
      // $FlowFixMe[prop-missing]
      this.adaTransaction = { inputs, foreignInputs, outputs, fee, total, amount };
    });
  }

  generateAdaTransaction: void => Promise<void> = async () => {
    if (this.signingMessage == null) return;
    const { signingMessage } = this;
    const selectedWallet = this.wallets.find(
      wallet => wallet.publicDeriver.getPublicDeriverId() === signingMessage.publicDeriverId
    );

    if (selectedWallet == null) return undefined;
    if (!signingMessage.sign.tx) return undefined;

    const network = selectedWallet.publicDeriver.getParent().getNetworkInfo();

    if (isCardanoHaskell(network)) {
      const withUtxos = asGetAllUtxos(selectedWallet.publicDeriver);
      if (withUtxos == null) {
        throw new Error(`missing utxo functionality`);
      }

      const withHasUtxoChains = asHasUtxoChains(withUtxos);
      if (withHasUtxoChains == null) {
        throw new Error(`missing chains functionality`);
      }

      const fullConfig = getCardanoHaskellBaseConfig(network);
      const timeToSlot = await genTimeToSlot(fullConfig);
      const absSlotNumber = new BigNumber(timeToSlot({
        time: new Date(),
      }).slot);

      const result = await this.api.ada.createUnsignedTxForConnector({
        publicDeriver: withHasUtxoChains,
        absSlotNumber,
        cardanoTxRequest: (signingMessage.sign: any).tx,
      });
      const fee = {
        tokenId: result.fee().getDefaultEntry().identifier,
        networkId: result.fee().getDefaultEntry().networkId,
        amount: result.fee().getDefaultEntry().amount.toString(),
      };
      const { amount, total } = await this._calculateAmountAndTotal(
        selectedWallet.publicDeriver,
        result.inputs(),
        result.outputs(),
        fee,
      );
      runInAction(() => {
        this.adaTransaction = {
          inputs: result.inputs(),
          outputs: result.outputs(),
          fee,
          amount,
          total,
        };
      });
    } else {
      throw new Error(`${nameof(ConnectorStore)}::${nameof(this.createAdaTransaction)} unexpected wallet type`);
    }
  }

  async _calculateAmountAndTotal(
    publicDeriver: PublicDeriver<>,
    inputs: Array<{| address: string, value: MultiToken |}>,
    outputs: Array<{| address: string, value: MultiToken |}>,
    fee: {| tokenId: string, networkId: number, amount: string |},
  ): Promise<{| amount: MultiToken, total: MultiToken |}> {
    const withUtxos = asGetAllUtxos(publicDeriver);
    if (withUtxos == null) {
      throw new Error('wallet doesn\'t support IGetAllUtxos');
    }
    const utxos = await withUtxos.getAllUtxos();
    const ownAddresses = new Set([
      ...utxos.map(utxo => utxo.address),
      ...await connectorGetUsedAddresses(publicDeriver, null),
      ...await connectorGetUnusedAddresses(publicDeriver),
      await connectorGetChangeAddress(publicDeriver),
    ]);
    const { defaultNetworkId, defaultIdentifier } =
          publicDeriver.getParent().getDefaultToken();

    const total = new MultiToken(
      [
        {
          amount: new BigNumber('0'),
          identifier: defaultIdentifier,
          networkId: defaultNetworkId,
        }
      ],
      { defaultNetworkId, defaultIdentifier }
    );
    for (const input of inputs) {
      if (ownAddresses.has(input.address)) {
        total.joinSubtractMutable(input.value);
      }
    }
    for (const output of outputs) {
      if (ownAddresses.has(output.address)) {
        total.joinAddMutable(output.value);
      }
    }
    const amount = total.joinAddCopy(
      new MultiToken(
        [
          {
            identifier: fee.tokenId,
            networkId: fee.networkId,
            amount: new BigNumber(fee.amount),
          }
        ],
        { defaultNetworkId, defaultIdentifier }
      )
    );
    return { total, amount };
  }

  @computed get signingRequest(): ?ISignRequest<any> {
    if (this.signingMessage == null) return;
    const { signingMessage } = this;
    const selectedWallet = this.wallets.find(
      wallet => wallet.publicDeriver.getPublicDeriverId() === signingMessage.publicDeriverId
    );
    if (selectedWallet == null) return undefined;
    if (!signingMessage.sign.tx) return undefined;

    const network = selectedWallet.publicDeriver.getParent().getNetworkInfo();
    if (isErgo(network)) {
      // Since this is Ergo, we know the type of `tx` must be `Tx`.
      const tx: Tx = (signingMessage.sign: any).tx;

      const config = getErgoBaseConfig(
        network
      ).reduce((acc, next) => Object.assign(acc, next), {});
      const networkSettingSnapshot = {
        NetworkId: network.NetworkId,
        ChainNetworkId: (Number.parseInt(config.ChainNetworkId, 10): any),
        FeeAddress: config.FeeAddress,
      }
      return new ErgoExternalTxSignRequest({
        inputUtxos: tx.inputs
          .map(
            // eslint-disable-next-line no-unused-vars
            ({ extension, ...rest }) => toRemoteUtxo(rest, networkSettingSnapshot.ChainNetworkId)
          ),
        unsignedTx: RustModule.SigmaRust.UnsignedTransaction.from_json(JSON.stringify(tx)),
        changeAddr: [],
        networkSettingSnapshot
      });
    }
    // If this is Cardano wallet, the return value is ignored
    return undefined;
  }

  // ========== whitelist ========== //
  @computed get currentConnectorWhitelist(): Array<WhitelistEntry> {
    let { result } = this.getConnectorWhitelist;
    if (result == null) {
      result = this.getConnectorWhitelist.execute().result;
    }
    return result ?? [];
  }
  _getConnectorWhitelist: void => Promise<void> = async () => {
    await this.getConnectorWhitelist.execute();
  };
  _updateConnectorWhitelist: ({| whitelist: Array<WhitelistEntry> |}) => Promise<void> = async ({
    whitelist,
  }) => {
    await this.setConnectorWhitelist.execute({ whitelist });
    await this.getConnectorWhitelist.execute();
  };
  _removeWalletFromWhitelist: (
    request: {| url: string, protocol: string |}
    ) => Promise<void> = async (request) => {
    const filter = this.currentConnectorWhitelist.filter(
      e => !(e.url === request.url && e.protocol === request.protocol)
    );
    await this.setConnectorWhitelist.execute({
      whitelist: filter,
    });
    await this.getConnectorWhitelist.execute();
    window.chrome.runtime.sendMessage(({
      type: 'remove_wallet_from_whitelist',
      url: request.url,
    }: RemoveWalletFromWhitelistData));
  };

  _refreshActiveSites: void => Promise<void> = async () => {
    await this.getConnectedSites.execute();
  }

  // ========== active websites ========== //
  @computed get activeSites(): ConnectedSites {
    let { result } = this.getConnectedSites;
    if (result == null) {
      result = this.getConnectedSites.execute().result;
    }
    return result ?? { sites: [] };
  }
}
