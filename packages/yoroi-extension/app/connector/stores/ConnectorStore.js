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
  GetUtxosRequest,
  GetConnectionProtocolData,
} from '../../../chrome/extension/connector/types';
import type { ActionsMap } from '../actions/index';
import type { StoresMap } from './index';
import type {
  CardanoConnectorSignRequest,
  SignSubmissionErrorType,
} from '../types';
import { LoadingWalletStates } from '../types';
import { getWallets } from '../../api/common/index';
import {
  getErgoBaseConfig,
  isCardanoHaskell,
  isErgo,
} from '../../api/ada/lib/storage/database/prepackaged/networks';
import {
  asGetBalance,
  asGetPublicKey,
  asGetSigningKey,
  asHasLevels,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import { MultiToken } from '../../api/common/lib/MultiToken';
import { addErgoAssets } from '../../api/ergo/lib/storage/bridge/updateTransactions';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type { ISignRequest } from '../../api/common/lib/transactions/ISignRequest';
import { ErgoExternalTxSignRequest } from '../../api/ergo/lib/transactions/ErgoExternalTxSignRequest';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { toRemoteUtxo } from '../../api/ergo/lib/transactions/utils';
import { mintedTokenInfo } from '../../../chrome/extension/connector/utils';
import { Logger } from '../../utils/logging';
import { asAddressedUtxo, multiTokenFromCardanoValue, multiTokenFromRemote, } from '../../api/ada/transactions/utils';
import {
  connectorGetUsedAddresses,
  connectorGetUnusedAddresses,
  connectorGetChangeAddress,
  connectorSendTxCardano,
  connectorGenerateReorgTx,
  connectorRecordSubmittedCardanoTransaction,
} from '../../../chrome/extension/connector/api';
import { getWalletChecksum } from '../../api/export/utils';
import { WalletTypeOption } from '../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import { loadSubmittedTransactions } from '../../api/localStorage';
import {
  signTransaction as shelleySignTransaction
} from '../../api/ada/transactions/shelley/transactions';
import type { GetUtxoDataResponse, RemoteUnspentOutput, UtxoData } from '../../api/ada/lib/state-fetch/types';
import { WrongPassphraseError } from '../../api/ada/lib/cardanoCrypto/cryptoErrors';
import type {
  HaskellShelleyTxSignRequest
} from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import type {
  ConceptualWallet
} from '../../api/ada/lib/storage/models/ConceptualWallet';
import type { IGetAllUtxosResponse } from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { IFetcher } from '../../api/ada/lib/state-fetch/IFetcher';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';

export function connectorCall<T, R>(message: T): Promise<R> {
  return new Promise((resolve, reject) => {
    window.chrome.runtime.sendMessage(
      message,
      response => {
        if (window.chrome.runtime.lastError) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject(`Could not establish connection: ${JSON.stringify(typeof message === 'object' ? message : '')}`);
          return;
        }
        resolve(response);
      }
    );
  })
}

// Need to run only once - Connecting wallets
let initedConnecting = false;
async function sendMsgConnect(): Promise<?ConnectingMessage> {
  if (!initedConnecting) {
    const res = await connectorCall<ConnectRetrieveData, ConnectingMessage>({ type: 'connect_retrieve_data' })
    initedConnecting = true
    return res
  }
}

// Need to run only once - Sign Tx Confirmation
let initedSigning = false;
async function sendMsgSigningTx(): Promise<?SigningMessage> {
  if (!initedSigning) {
    const res = await connectorCall<TxSignWindowRetrieveData, SigningMessage>({
      type: 'tx_sign_window_retrieve_data',
    });
    initedSigning = true;
    return res;
  }
}

export async function getProtocol(): Promise<?Protocol> {
  return connectorCall<GetConnectionProtocolData, Protocol>({ type: 'get_protocol' })
}

export function getUtxosAndAddresses(
  tabId: number,
  select: string[]
  ): Promise<{|
    utxos: IGetAllUtxosResponse,
    usedAddresses: string[],
    unusedAddresses: string[],
    changeAddress: string,
  |}> {
  return new Promise((resolve, reject) => {
      window.chrome.runtime.sendMessage(
        ({ type: 'get_utxos/addresses', tabId, select }: GetUtxosRequest),
        response => {
          if (window.chrome.runtime.lastError) {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject('Could not establish connection: get_utxos/cardano ');
            return;
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
            return;
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

export type ForeignUtxoFetcher = Array<string> => Promise<Array<?RemoteUnspentOutput>>;

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

  reorgTxSignRequest: ?HaskellShelleyTxSignRequest = null;
  collateralOutputAddressSet: ?Set<string> = null;
  @observable submissionError: ?SignSubmissionErrorType = null;

  setup(): void {
    super.setup();
    this.actions.connector.updateConnectorWhitelist.listen(this._updateConnectorWhitelist);
    this.actions.connector.removeWalletFromWhitelist.listen(this._removeWalletFromWhitelist);
    this.actions.connector.confirmSignInTx.listen(async (password) => {
      await this._confirmSignInTx(password);
    });
    this.actions.connector.cancelSignInTx.listen(this._cancelSignInTx);
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
          if (response.sign.type === 'tx-reorg/cardano') {
            this.generateReorgTransaction();
          }
        }
      })
      // eslint-disable-next-line no-console
      .catch(err => console.error(err));
  };

  @action
  _confirmSignInTx: string => Promise<void> = async (password) => {
    runInAction(() => {
      this.submissionError = null;
    });

    if (this.signingMessage == null) {
      throw new Error(`${nameof(this._confirmSignInTx)} confirming a tx but no signing message set`);
    }
    const { signingMessage } = this;
    const wallet = this.wallets.find(w =>
      w.publicDeriver.getPublicDeriverId() === this.signingMessage?.publicDeriverId
    );
    if (!wallet) {
      throw new Error('unexpected nullish wallet');
    }

    let sendData: ConfirmedSignData;
    if (signingMessage.sign.type === 'tx-reorg/cardano') {
      // sign and send the tx
      let signedTx;
      try {
        signedTx = await this.signReorgTx(wallet.publicDeriver, password);
      } catch (error) {
        if (error instanceof WrongPassphraseError) {
          runInAction(() => {
            this.submissionError = 'WRONG_PASSWORD';
          });
          return;
        }
        throw error;
      }
      try {
        await connectorSendTxCardano(
          wallet.publicDeriver,
          signedTx.to_bytes(),
          this.api.localStorage,
        );
      } catch {
        runInAction(() => {
          this.submissionError = 'SEND_TX_ERROR';
        });
        return;
      }
      try {
        if (signingMessage.sign.type !== 'tx-reorg/cardano') {
          throw new Error('unexpected signing data type');
        }
        await connectorRecordSubmittedCardanoTransaction(
          wallet.publicDeriver,
          signedTx,
          asAddressedUtxo(signingMessage.sign.tx.utxos),
        );
      } catch {
        // ignore
      }
      const utxos = this.getUtxosAfterReorg(
        Buffer.from(
          RustModule.WalletV4.hash_transaction(signedTx.body()).to_bytes()
        ).toString('hex')
      );
      sendData = {
        type: 'sign_confirmed',
        tx: utxos,
        uid: signingMessage.sign.uid,
        tabId: signingMessage.tabId,
        pw: password,
      };
    } else if (
      signingMessage.sign.type === 'tx' ||
        signingMessage.sign.type === 'tx_input' ||
        signingMessage.sign.type === 'tx/cardano'
    ) {
      sendData = {
        type: 'sign_confirmed',
        tx: toJS(signingMessage.sign.tx),
        uid: signingMessage.sign.uid,
        tabId: signingMessage.tabId,
        pw: password,
      };
    } else if (signingMessage.sign.type === 'data') {
      sendData = {
        type: 'sign_confirmed',
        tx: null,
        uid: signingMessage.sign.uid,
        tabId: signingMessage.tabId,
        pw: password,
      };
    } else {
      throw new Error(`unkown sign data type ${signingMessage.sign.type}`);
    }

    window.chrome.runtime.sendMessage(sendData);
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
          this.signingMessage?.sign.type !== 'tx-reorg/cardano'
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
      if (this.signingMessage?.sign.type === 'tx-reorg/cardano') {
        this.generateReorgTransaction();
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
    const { tx/* , partialSign */, tabId } = signingMessage.sign.tx;

    const network = selectedWallet.publicDeriver.getParent().getNetworkInfo();

    if (!isCardanoHaskell(network)) {
      throw new Error(`${nameof(ConnectorStore)}::${nameof(this.createAdaTransaction)} unexpected wallet type`);
    }
    const response = await getUtxosAndAddresses(tabId, ['utxos', 'usedAddresses', 'unusedAddresses', 'changeAddress'])

    if (!response.utxos) {
      throw new Error('Missgin utxos for signing tx')
    }

    const submittedTxs = await loadSubmittedTransactions() || [];
    const addressedUtxos = await this.api.ada.addressedUtxosWithSubmittedTxs(
      asAddressedUtxo(response.utxos),
      selectedWallet.publicDeriver,
      submittedTxs,
    );

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

    const allUsedUtxoIdsSet = new Set(
      submittedTxs.flatMap(({ usedUtxos }) =>
        (usedUtxos||[]).map(({ txHash, index }) => `${txHash}${index}`))
    );

    for (let i = 0; i < txBody.inputs().len(); i++) {
      const input = txBody.inputs().get(i);
      const txHash = Buffer.from(input.transaction_id().to_bytes()).toString('hex');
      const txIndex = input.index();
      if (allUsedUtxoIdsSet.has(`${txHash}${txIndex}`)) {
        window.chrome.runtime.sendMessage(
          {
            type: 'sign_error',
            errorType: 'spent_utxo',
            data: `${txHash}${txIndex}`,
            uid: signingMessage.sign.uid,
            tabId: signingMessage.tabId,
          }
        );
        this._closeWindow();
        return;
      }
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

    const ownAddresses = new Set([
      ...response.utxos.map(utxo => utxo.address),
      ...response.usedAddresses,
      ...response.unusedAddresses,
      response.changeAddress
    ])

    const { amount, total } = await this._calculateAmountAndTotal(
      selectedWallet.publicDeriver,
      inputs,
      outputs,
      fee,
      response.utxos,
      ownAddresses,
    );

    if (foreignInputs.length) {
      const foreignUtxos = await this.stores.substores.ada.stateFetchStore.fetcher.getUtxoData(
        {
          network: selectedWallet.publicDeriver.getParent().networkInfo,
          utxos: foreignInputs,
        }
      )
      for (let i = 0; i < foreignUtxos.length; i++) {
        const foreignUtxo = foreignUtxos[i];
        if (foreignUtxo == null) {
          window.chrome.runtime.sendMessage(
            {
              type: 'sign_error',
              errorType: 'missing_utxo',
              data: `${foreignInputs[i].txHash}${foreignInputs[i].txIndex}`,
              uid: signingMessage.sign.uid,
              tabId: signingMessage.tabId,
            }
          );
          this._closeWindow();
          return;
        }
        if (foreignUtxo.spendingTxHash != null) {
          window.chrome.runtime.sendMessage(
            {
              type: 'sign_error',
              errorType: 'spent_utxo',
              data: `${foreignInputs[i].txHash}${foreignInputs[i].txIndex}`,
              uid: signingMessage.sign.uid,
              tabId: signingMessage.tabId,
            }
          );
          this._closeWindow();
          return;
        }
        const value = multiTokenFromRemote(
          foreignUtxo.output,
          defaultToken.NetworkId
        );
        inputs.push({
          address: Buffer.from(RustModule.WalletV4.Address.from_bech32(
            foreignUtxo.output.address
          ).to_bytes()).toString('hex'),
          value,
        });
      }
    }

    runInAction(() => {
      // $FlowFixMe[prop-missing]
      this.adaTransaction = { inputs, foreignInputs, outputs, fee, total, amount };
    });
  }

  static createForeignUtxoFetcher: (IFetcher, $ReadOnly<NetworkRow>) => ForeignUtxoFetcher =
    (fetcher, networkInfo) => {
      return async (utxoIds: Array<string>): Promise<Array<?RemoteUnspentOutput>> => {
        const foreignInputs = utxoIds.map((id: string) => {
          // tx hash length is 64
          if ((id?.length ?? 0) < 65) {
            throw new Error(`Invalid utxo ID "${id}", expected \`{hash}{index}\` with no separator`);
          }
          try {
            return {
              txHash: id.substring(0, 64),
              txIndex: parseInt(id.substring(64), 10),
            }
          } catch (e) {
            throw new Error(`Failed to parse utxo ID "${id}": ${String(e)}`);
          }
        })
        const fetchedData: GetUtxoDataResponse = await fetcher.getUtxoData({
          network: networkInfo,
          utxos: foreignInputs,
        });
        return fetchedData.map((data: (UtxoData | null), i): ?RemoteUnspentOutput => {
          if (data == null) {
            return null;
          }
          const { txHash, txIndex } = foreignInputs[i];
          return {
            utxo_id: utxoIds[i],
            tx_hash: txHash,
            tx_index: txIndex,
            receiver: data.output.address,
            amount: data.output.amount,
            assets: data.output.assets,
          };
        })
      };
    }

  generateReorgTransaction: void => Promise<void> = async () => {
    if (this.signingMessage == null) return;
    const { signingMessage } = this;
    const selectedWallet = this.wallets.find(
      wallet => wallet.publicDeriver.getPublicDeriverId() === signingMessage.publicDeriverId
    );

    if (selectedWallet == null) return undefined;
    if (signingMessage.sign.type !== 'tx-reorg/cardano') {
      throw new Error('unexpected signing data type');
    }
    const { usedUtxoIds, reorgTargetAmount, utxos } = signingMessage.sign.tx;
    const submittedTxs = await loadSubmittedTransactions() || [];

    const { unsignedTx, collateralOutputAddressSet } = await connectorGenerateReorgTx(
      selectedWallet.publicDeriver,
      usedUtxoIds,
      reorgTargetAmount,
      asAddressedUtxo(utxos),
      submittedTxs,
    );
    // record the unsigned tx, so that after the user's approval, we can sign
    // it without re-generating
    this.reorgTxSignRequest = unsignedTx;
    // record which addresses are used for collaterals, so that we can compute the
    // collateral UTXOs without waiting for the re-organization tx to be confirmed
    this.collateralOutputAddressSet = collateralOutputAddressSet;

    const fee = {
      tokenId: unsignedTx.fee().getDefaultEntry().identifier,
      networkId: unsignedTx.fee().getDefaultEntry().networkId,
      amount: unsignedTx.fee().getDefaultEntry().amount.toString(),
    };
    const { amount, total } = await this._calculateAmountAndTotal(
      selectedWallet.publicDeriver,
      unsignedTx.inputs(),
      unsignedTx.outputs(),
      fee,
      utxos,
    );
    runInAction(() => {
      this.adaTransaction = {
        inputs: unsignedTx.inputs(),
        outputs: unsignedTx.outputs(),
        fee,
        amount,
        total,
      };
    });
  }
  signReorgTx: (PublicDeriver<>, string) => Promise<RustModule.WalletV4.Transaction> = async (
    publicDeriver,
    password
  ) => {
    const signRequest = this.reorgTxSignRequest;

    if (!signRequest) {
      throw new Error('unexpected nullish sign request');
    }

    const withSigningKey = asGetSigningKey(publicDeriver);
    if (!withSigningKey) {
      throw new Error('expect to be able to get signing key');
    }
    const signingKey = await withSigningKey.getSigningKey();
    const normalizedKey = await withSigningKey.normalizeKey({
      ...signingKey,
      password,
    });

    const withLevels = asHasLevels<ConceptualWallet>(publicDeriver);
    if (!withLevels) {
      throw new Error(`can't get level`);
    }

    return shelleySignTransaction(
      signRequest.senderUtxos,
      signRequest.unsignedTx,
      withLevels.getParent().getPublicDeriverLevel(),
      RustModule.WalletV4.Bip32PrivateKey.from_bytes(
        Buffer.from(normalizedKey.prvKeyHex, 'hex')
      ),
      signRequest.neededStakingKeyHashes.wits,
      signRequest.metadata,
    );
  }
  getUtxosAfterReorg: (string) => Array<RemoteUnspentOutput> = (txId) => {
    const allOutputs = this.adaTransaction?.outputs;
    if (!allOutputs) {
      throw new Error('unexpected nullish transaction');
    }
    if (!this.collateralOutputAddressSet) {
      throw new Error('unexpected nullish collateral address set');
    }
    const collateralOutputs = [];
    for (let i = 0; i < allOutputs.length; i++) {
      if (this.collateralOutputAddressSet.has(allOutputs[i].address)) {
        collateralOutputs.push({
          utxo_id: txId + String(i),
          tx_hash: txId,
          tx_index: i,
          receiver: allOutputs[i].address,
          amount: allOutputs[i].value.getDefault().toString(),
          assets: [],
        });
      }
    }

    return collateralOutputs;
  }

  async _calculateAmountAndTotal(
    publicDeriver: PublicDeriver<>,
    inputs: Array<{| address: string, value: MultiToken |}>,
    outputs: Array<{| address: string, value: MultiToken |}>,
    fee: {| tokenId: string, networkId: number, amount: string |},
    utxos: IGetAllUtxosResponse,
    ownAddresses: ?Set<string>,
  ): Promise<{| amount: MultiToken, total: MultiToken |}> {

    if (!ownAddresses) {
      ownAddresses = new Set([
        ...utxos.map(utxo => utxo.address),
        ...await connectorGetUsedAddresses(publicDeriver, null),
        ...await connectorGetUnusedAddresses(publicDeriver),
        await connectorGetChangeAddress(publicDeriver),
      ]);
    }

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
