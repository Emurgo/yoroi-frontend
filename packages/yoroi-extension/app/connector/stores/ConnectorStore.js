/* eslint-disable promise/always-return */
// @flow
import type {
  ConfirmedSignData,
  ConnectedSites,
  ConnectingMessage,
  ConnectRetrieveData,
  FailedSignData,
  GetConnectedSitesData,
  GetConnectionProtocolData,
  GetUtxosRequest,
  Protocol,
  PublicDeriverCache,
  RemoveWalletFromWhitelistData,
  SigningMessage,
  TxSignWindowRetrieveData,
  WhitelistEntry,
} from '../../../chrome/extension/connector/types';
import type { ActionsMap } from '../actions/index';
import type { StoresMap } from './index';
import type {
  Anchor,
  CardanoConnectorSignRequest,
  SignSubmissionErrorType,
  TxDataInput,
  TxDataOutput,
} from '../types';
import { LoadingWalletStates } from '../types';
import type { ISignRequest } from '../../api/common/lib/transactions/ISignRequest';
import type { GetUtxoDataResponse, RemoteUnspentOutput, UtxoData, } from '../../api/ada/lib/state-fetch/types';
import { WrongPassphraseError } from '../../api/ada/lib/cardanoCrypto/cryptoErrors';
import type { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import type { ConceptualWallet } from '../../api/ada/lib/storage/models/ConceptualWallet';
import { isLedgerNanoWallet, isTrezorTWallet, } from '../../api/ada/lib/storage/models/ConceptualWallet';
import type { IGetAllUtxosResponse } from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { IFetcher } from '../../api/ada/lib/state-fetch/IFetcher';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import BigNumber from 'bignumber.js';
import { action, computed, observable, runInAction, toJS } from 'mobx';
import Request from '../../stores/lib/LocalizedRequest';
import Store from '../../stores/base/Store';
import { getWallets } from '../../api/common/index';
import {
  getCardanoHaskellBaseConfig,
  isCardanoHaskell,
} from '../../api/ada/lib/storage/database/prepackaged/networks';
import {
  asGetBalance,
  asGetPublicKey,
  asGetSigningKey,
  asHasLevels,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import { MultiToken } from '../../api/common/lib/MultiToken';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { asAddressedUtxo, multiTokenFromCardanoValue, multiTokenFromRemote, } from '../../api/ada/transactions/utils';
import {
  connectorGenerateReorgTx,
  connectorGetChangeAddress,
  connectorGetUnusedAddresses,
  connectorGetUsedAddresses,
  connectorRecordSubmittedCardanoTransaction,
  connectorSendTxCardano,
  getScriptRequiredSigningKeys,
  resolveTxOrTxBody,
} from '../../../chrome/extension/connector/api';
import { getWalletChecksum } from '../../api/export/utils';
import { WalletTypeOption } from '../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import { loadSubmittedTransactions } from '../../api/localStorage';
import { signTransaction as shelleySignTransaction } from '../../api/ada/transactions/shelley/transactions';
import { LedgerConnect } from '../../utils/hwConnectHandler';
import { getAllAddressesWithPaths } from '../../api/ada/lib/storage/bridge/traitUtils';
import {
  buildConnectorSignedTransaction as buildSignedLedgerTransaction,
  toLedgerSignRequest,
} from '../../api/ada/transactions/shelley/ledgerTx';
import {
  buildConnectorSignedTransaction as buildSignedTrezorTransaction,
  toTrezorSignRequest,
} from '../../api/ada/transactions/shelley/trezorTx';
import type { CardanoAddressedUtxo } from '../../api/ada/transactions/types';
import blake2b from 'blake2b';
import type LocalizableError from '../../i18n/LocalizableError';
import { convertToLocalizableError as convertToLocalizableLedgerError } from '../../domain/LedgerLocalizedError';
import { convertToLocalizableError as convertToLocalizableTrezorError } from '../../domain/TrezorLocalizedError';
import {
  ledgerSignDataUnsupportedError,
  transactionHashMismatchError,
  trezorSignDataUnsupportedError,
  unsupportedTransactionError,
} from '../../domain/HardwareWalletLocalizedError';
import { wrapWithFrame } from '../../stores/lib/TrezorWrapper';
import { ampli } from '../../../ampli/index';

export function connectorCall<T, R>(message: T): Promise<R> {
  return new Promise((resolve, reject) => {
    window.chrome.runtime.sendMessage(message, response => {
      if (window.chrome.runtime.lastError) {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject(
          `Could not establish connection: ${JSON.stringify(
            typeof message === 'object' ? message : ''
          )}`
        );
        return;
      }
      resolve(response);
    });
  });
}

// Need to run only once - Connecting wallets
let initedConnecting = false;
async function sendMsgConnect(): Promise<?ConnectingMessage> {
  if (!initedConnecting) {
    const res = await connectorCall<ConnectRetrieveData, ConnectingMessage>({
      type: 'connect_retrieve_data',
    });
    initedConnecting = true;
    return res;
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
  return connectorCall<GetConnectionProtocolData, Protocol>({ type: 'get_protocol' });
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
    const balance =
      canGetBalance == null
        ? new MultiToken([], currentWallet.getParent().getDefaultToken())
        : await canGetBalance.getBalance();
    result.push({
      publicDeriver: currentWallet,
      name: conceptualInfo.Name,
      balance,
      checksum: await getWalletChecksum(withPubKey),
    });
  }

  return result;
}

type GetWhitelistFunc = void => Promise<?Array<WhitelistEntry>>;
type SetWhitelistFunc = ({|
  whitelist: Array<WhitelistEntry> | void,
|}) => Promise<void>;

export type ForeignUtxoFetcher = (Array<string>) => Promise<Array<?RemoteUnspentOutput>>;

export default class ConnectorStore extends Store<StoresMap, ActionsMap> {
  @observable connectingMessage: ?ConnectingMessage = null;
  @observable whiteList: Array<WhitelistEntry> = [];

  @observable loadingWallets: $Values<typeof LoadingWalletStates> = LoadingWalletStates.IDLE;
  @observable errorWallets: string = '';
  @observable wallets: Array<PublicDeriverCache> = [];

  // <TODO:PENDING_REMOVAL> LEGACY we don't have multiple protocols anymore
  /**
   * - `filteredWallets`: includes only wallets according to the `protocol`
   *   it will be displyed to the user at the `connect` screen for the user to choose
   *   which wallet to connect
   * - `allWallets`: list of all wallets the user have in yoroi
   *    Will be displayed in the on the `connected webists screen` as we need all wallets
   */
  @observable filteredWallets: Array<PublicDeriverCache> = [];
  @observable allWallets: Array<PublicDeriverCache> = [];
  @observable protocol: ?string = '';
  @observable getConnectorWhitelist: Request<GetWhitelistFunc> = new Request<GetWhitelistFunc>(
    this.api.localStorage.getWhitelist
  );
  @observable setConnectorWhitelist: Request<SetWhitelistFunc> = new Request<SetWhitelistFunc>(
    ({ whitelist }) => this.api.localStorage.setWhitelist(whitelist)
  );

  @observable getConnectedSites: Request<typeof getConnectedSites> = new Request<
    typeof getConnectedSites
  >(getConnectedSites);

  @observable signingMessage: ?SigningMessage = null;

  @observable adaTransaction: ?CardanoConnectorSignRequest = null;

  // store the transaction body for hw wallet signing
  rawTxBody: ?Buffer = null;
  addressedUtxos: ?Array<CardanoAddressedUtxo> = null;

  reorgTxSignRequest: ?HaskellShelleyTxSignRequest = null;
  collateralOutputAddressSet: ?Set<string> = null;
  @observable submissionError: ?SignSubmissionErrorType = null;
  @observable hwWalletError: ?LocalizableError = null;
  // Whether the above error is recoverable.
  // Recoverable errors are like the HW is plugged in. Unrecoverable errors are like
  // the tx is not supported.
  @observable isHwWalletErrorRecoverable: ?boolean = null;

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
    this._getProtocol();
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
    const protocol = await getProtocol();
    runInAction(() => {
      this.protocol = protocol?.type;
    });
  };

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
            ampli.dappPopupSignTransactionPageViewed();
          }
          if (response.sign.type === 'tx-reorg/cardano') {
            this.generateReorgTransaction();
            ampli.dappPopupAddCollateralPageViewed();
          }
          if (response.sign.type === 'data') {
            this.checkHwWalletSignData();
          }
        }
      })
      // eslint-disable-next-line no-console
      .catch(err => console.error(err));
  };

  @action
  _confirmSignInTx: string => Promise<void> = async password => {
    runInAction(() => {
      this.submissionError = null;
    });

    const { signingMessage, connectedWallet: wallet } = this;

    if (signingMessage == null) {
      throw new Error(
        `${nameof(this._confirmSignInTx)} confirming a tx but no signing message set`
      );
    }

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
          Buffer.from(signedTx.to_bytes()),
          this.api.localStorage
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
          asAddressedUtxo(signingMessage.sign.tx.utxos)
        );
      } catch {
        // ignore
      }
      const utxos = this.getUtxosAfterReorg(
        Buffer.from(RustModule.WalletV4.hash_transaction(signedTx.body()).to_bytes()).toString(
          'hex'
        )
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
      const tx = toJS(signingMessage.sign.tx);
      if (wallet.publicDeriver.getParent().getWalletType() !== WalletTypeOption.WEB_WALLET) {
        const { rawTxBody } = this;
        if (!rawTxBody) {
          throw new Error('unexpected nullish transaction');
        }

        const additionalRequiredSigners = RustModule.WasmScope(Module => {
          const { witnessSet } = resolveTxOrTxBody((tx: any), Module);
          return witnessSet == null ? []
            : [...(getScriptRequiredSigningKeys(witnessSet, Module))];
        });

        const witnessSetHex =
          (await this.hwSignTx(
            wallet.publicDeriver,
            rawTxBody,
            additionalRequiredSigners,
          ))
          .witness_set()
          .to_hex();

        sendData = {
          type: 'sign_confirmed',
          tx,
          uid: signingMessage.sign.uid,
          tabId: signingMessage.tabId,
          witnessSetHex,
          pw: '',
        };
      } else {
        sendData = {
          type: 'sign_confirmed',
          tx,
          uid: signingMessage.sign.uid,
          tabId: signingMessage.tabId,
          pw: password,
        };
      }
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
    this.actions.connector.cancelSignInTx.remove(this._cancelSignInTx);
    await ampli.dappPopupSignTransactionSubmitted();
    this._closeWindow();
  };
  @action
  _cancelSignInTx: void => void = () => {
    if (this.signingMessage == null) {
      throw new Error(
        `${nameof(this._confirmSignInTx)} confirming a tx but no signing message set`
      );
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
      const wallets = await getWallets({ db: persistentDb });

      const filteredWalletsResult = await parseWalletsList(wallets);
      const allWallets = await parseWalletsList(wallets);

      runInAction(() => {
        this.loadingWallets = LoadingWalletStates.SUCCESS;

        // note: "replace" is a mobx-specific function
        (this.wallets: any).replace(filteredWalletsResult);
        (this.filteredWallets: any).replace(filteredWalletsResult);
        (this.allWallets: any).replace(allWallets);
      });
      if (this.signingMessage?.sign.type === 'tx/cardano') {
        this.createAdaTransaction();
      }
      if (this.signingMessage?.sign.type === 'tx-reorg/cardano') {
        this.generateReorgTransaction();
      }
      if (this.signingMessage?.sign.type === 'data') {
        this.checkHwWalletSignData();
      }
    } catch (err) {
      runInAction(() => {
        this.loadingWallets = LoadingWalletStates.REJECTED;
        this.errorWallets = err.message;
      });
    }
  };

  // De-serialize the tx so that the signing dialog could show the tx info (
  // inputs, outputs, fee, ...) to the user.
  createAdaTransaction: void => Promise<void> = async () => {
    const { signingMessage, connectedWallet } = this;
    if (connectedWallet == null || signingMessage == null) return undefined;
    if (!signingMessage.sign.tx) return undefined;
    // Invoked only for Cardano, so we know the type of `tx` must be `CardanoTx`.
    // $FlowFixMe[prop-missing]
    const { tx /* , partialSign */, tabId } = signingMessage.sign.tx;

    const network = connectedWallet.publicDeriver.getParent().getNetworkInfo();

    if (!isCardanoHaskell(network)) {
      throw new Error(
        `${nameof(ConnectorStore)}::${nameof(this.createAdaTransaction)} unexpected wallet type`
      );
    }
    const response = await getUtxosAndAddresses(tabId, [
      'utxos',
      'usedAddresses',
      'unusedAddresses',
      'changeAddress',
    ]);

    if (!response.utxos) {
      throw new Error('Missgin utxos for signing tx');
    }

    const submittedTxs = await loadSubmittedTransactions() || [];
    const addressedUtxos = await this.api.ada.addressedUtxosWithSubmittedTxs(
      asAddressedUtxo(response.utxos),
      connectedWallet.publicDeriver,
      submittedTxs
    );
    this.addressedUtxos = addressedUtxos;

    const defaultToken = this.stores.tokenInfoStore.getDefaultTokenInfo(network.NetworkId);

    let txBody;
    const bytes = Buffer.from(tx, 'hex');
    try {
      // <TODO:USE_METADATA_AND_WITNESSES>
      const transaction = RustModule.WalletV4.FixedTransaction.from_bytes(bytes);
      this.rawTxBody = Buffer.from(transaction.raw_body());
      txBody = transaction.body();
    } catch (originalErr) {
      try {
        // Try parsing as body for backward compatibility
        txBody = RustModule.WalletV4.TransactionBody.from_bytes(bytes);
        this.rawTxBody = bytes;
      } catch (_e) {
        throw originalErr;
      }
    }

    const inputs = [];
    const foreignInputs = [];

    const allUsedUtxoIdsSet = new Set(
      submittedTxs.flatMap(({ usedUtxos }) =>
        (usedUtxos || []).map(({ txHash, index }) => `${txHash}${index}`)
      )
    );

    for (let i = 0; i < txBody.inputs().len(); i++) {
      const input = txBody.inputs().get(i);
      const txHash = Buffer.from(input.transaction_id().to_bytes()).toString('hex');
      const txIndex = input.index();
      if (allUsedUtxoIdsSet.has(`${txHash}${txIndex}`)) {
        window.chrome.runtime.sendMessage({
          type: 'sign_error',
          errorType: 'spent_utxo',
          data: `${txHash}${txIndex}`,
          uid: signingMessage.sign.uid,
          tabId: signingMessage.tabId,
        });
        this._closeWindow();
        return;
      }

      const utxo = addressedUtxos.find(
        (
          { tx_hash, tx_index } // eslint-disable-line camelcase
        ) => tx_hash === txHash && tx_index === txIndex // eslint-disable-line camelcase
      );
      if (utxo) {
        inputs.push({
          address: utxo.receiver,
          value: multiTokenFromRemote(utxo, defaultToken.NetworkId),
        });
      } else {
        foreignInputs.push({ txHash, txIndex });
      }
    }

    const ownAddresses = new Set([
      ...response.utxos.map(utxo => utxo.address),
      ...response.usedAddresses,
      ...response.unusedAddresses,
      response.changeAddress,
    ]);

    const outputs: Array<TxDataOutput> = [];
    for (let i = 0; i < txBody.outputs().len(); i++) {
      const output = txBody.outputs().get(i);
      const address = Buffer.from(output.address().to_bytes()).toString('hex');
      outputs.push({
        address,
        isForeign: !ownAddresses.has(address),
        value: multiTokenFromCardanoValue(
          output.amount(),
          connectedWallet.publicDeriver.getParent().getDefaultToken()
        ),
      });
    }
    const fee = {
      tokenId: defaultToken.Identifier,
      networkId: defaultToken.NetworkId,
      amount: txBody.fee().to_str(),
    };

    const { amount, total } = await this._calculateAmountAndTotal(
      connectedWallet.publicDeriver,
      inputs,
      outputs,
      fee,
      response.utxos,
      ownAddresses
    );

    if (foreignInputs.length) {
      const foreignUtxos = await this.stores.substores.ada.stateFetchStore.fetcher.getUtxoData({
        network: connectedWallet.publicDeriver.getParent().networkInfo,
        utxos: foreignInputs,
      });
      for (let i = 0; i < foreignUtxos.length; i++) {
        const foreignUtxo = foreignUtxos[i];
        if (foreignUtxo == null || typeof foreignUtxo !== 'object') {
          window.chrome.runtime.sendMessage({
            type: 'sign_error',
            errorType: 'missing_utxo',
            data: `${foreignInputs[i].txHash}${foreignInputs[i].txIndex}`,
            uid: signingMessage.sign.uid,
            tabId: signingMessage.tabId,
          });
          this._closeWindow();
          return;
        }
        if (foreignUtxo.spendingTxHash != null) {
          window.chrome.runtime.sendMessage({
            type: 'sign_error',
            errorType: 'spent_utxo',
            data: `${foreignInputs[i].txHash}${foreignInputs[i].txIndex}`,
            uid: signingMessage.sign.uid,
            tabId: signingMessage.tabId,
          });
          this._closeWindow();
          return;
        }
        const value = multiTokenFromRemote(foreignUtxo.output, defaultToken.NetworkId);
        inputs.push({
          address: Buffer.from(
            RustModule.WalletV4.Address.from_bech32(foreignUtxo.output.address).to_bytes()
          ).toString('hex'),
          value,
        });
      }
    }

    const cip95Info = [];
    const certs = txBody.certs();
    if (certs) {
      for (let i = 0; i < certs.len(); i++) {
        const cert = certs.get(i);
        if (!cert) {
          throw new Error('unexpectedly missing certificate');
        }
        const stakeRegistration = cert.as_stake_registration();
        if (stakeRegistration) {
          const coin = stakeRegistration.coin()?.toString() ?? null;
          cip95Info.push({
            type: 'StakeRegistrationCert',
            coin,
          });
          continue;
        }
        const stakeDeregistration = cert.as_stake_deregistration();
        if (stakeDeregistration) {
          const coin = stakeDeregistration.coin()?.toString() ?? null;
          cip95Info.push({
            type: 'StakeDeregistrationCert',
            coin,
          });
          continue;
        }
        const stakeDelegation = cert.as_stake_delegation();
        if (stakeDelegation) {
          const keyHash = stakeDelegation.stake_credential().to_keyhash();
          if (keyHash) {
            cip95Info.push({
              type: 'StakeDelegationCert',
              poolKeyHash: keyHash.to_hex(),
            });
          }
          continue;
        }
        const voteDelegation = cert.as_vote_delegation();
        if (voteDelegation) {
          const keyHash = voteDelegation.stake_credential().to_keyhash();
          if (keyHash) {
            cip95Info.push({
              type: 'VoteDelegCert',
              drep: voteDelegation.drep().to_hex(),
            });
          }
          continue;
        }
        const stakeVoteDelegation = cert.as_stake_and_vote_delegation();
        if (stakeVoteDelegation) {
          const keyHash = stakeVoteDelegation.stake_credential().to_keyhash();
          if (keyHash) {
            cip95Info.push({
              type: 'StakeVoteDelegCert',
              drep: stakeVoteDelegation.drep().to_hex(),
              poolKeyHash: stakeVoteDelegation.pool_keyhash().to_hex(),
            });
          }
          continue;
        }
        const stakeRegDelegation = cert.as_stake_registration_and_delegation();
        if (stakeRegDelegation) {
          const keyHash = stakeRegDelegation.stake_credential().to_keyhash();
          if (keyHash) {
            cip95Info.push({
              type: 'StakeRegDelegCert',
              poolKeyHash: stakeRegDelegation.pool_keyhash().to_hex(),
              coin: stakeRegDelegation.coin().to_str(),
            });
          }
          continue;
        }
        const voteRegDelegation = cert.as_vote_registration_and_delegation();
        if (voteRegDelegation) {
          const keyHash = voteRegDelegation.stake_credential().to_keyhash();
          if (keyHash) {
            cip95Info.push({
              type: 'VoteRegDelegCert',
              drep: voteRegDelegation.drep().to_hex(),
              coin: voteRegDelegation.coin().to_str(),
            });
          }
          continue;
        }
        const stakeRegVoteDeletion = cert.as_stake_vote_registration_and_delegation();
        if (stakeRegVoteDeletion) {
          const keyHash = stakeRegVoteDeletion.stake_credential().to_keyhash();
          if (keyHash) {
            cip95Info.push({
              type: 'StakeVoteRegDelegCert',
              poolKeyHash: stakeRegVoteDeletion.pool_keyhash().to_hex(),
              drep: stakeRegVoteDeletion.drep().to_hex(),
              coin: stakeRegVoteDeletion.coin().to_str(),
            });
          }
          continue;
        }
        const regDrep = cert.as_drep_registration();
        if (regDrep) {
          const keyHash = regDrep.voting_credential().to_keyhash();
          if (keyHash) {
            cip95Info.push({
              type: 'RegDrepCert',
              coin: regDrep.coin().to_str(),
              anchor: deserializeAnchor(regDrep.anchor()),
            });
          }
          continue;
        }
        const unregDrep = cert.as_drep_deregistration();
        if (unregDrep) {
          const keyHash = unregDrep.voting_credential().to_keyhash();
          if (keyHash) {
            cip95Info.push({
              type: 'UnregDrepCert',
              coin: unregDrep.coin().to_str(),
            });
          }
          continue;
        }
        const updateDrep = cert.as_drep_update();
        if (updateDrep) {
          const keyHash = updateDrep.voting_credential().to_keyhash();
          if (keyHash) {
            cip95Info.push({
              type: 'UpdateDrepCert',
              anchor: deserializeAnchor(updateDrep.anchor()),
            });
          }
          continue;
        }
      }
    }
    const votingProcedures = txBody.voting_procedures();
    if (votingProcedures) {
      const voters = votingProcedures.get_voters();
      for (let i = 0; i < voters.len(); i++) {
        const voter = voters.get(i);
        if (!voter) {
          throw new Error('unexpectedly missing voter');
        }
        const govActionIds = votingProcedures.get_governance_action_ids_by_voter(
          voter
        );
        for (let j = 0; i < govActionIds.len(); j++) {
          const govActionId = govActionIds.get(j);
          if (!govActionId) {
            throw new Error('unexpectedly missing governance action id');
          }
          const votingProcedure = votingProcedures.get(voter, govActionId);
          if (!votingProcedure) {
            throw new Error('unexpectedly missing voting procedure');
          }
          cip95Info.push({
            type: 'VotingProcedure',
            voterType: voter.kind(),
            voterHash: voter.to_constitutional_committee_hot_cred()?.to_scripthash()?.to_hex() ||
              voter.to_constitutional_committee_hot_cred()?.to_keyhash()?.to_hex() ||
              voter.to_drep_cred()?.to_scripthash()?.to_hex() ||
              voter.to_drep_cred()?.to_keyhash()?.to_hex() ||
              voter.to_staking_pool_key_hash()?.to_hex() ||
              (() => { throw new Error('unexpected voter'); })(),
            govActionTxId: govActionId.transaction_id().to_hex(),
            govActionIndex: govActionId.index(),
            vote: votingProcedure.vote_kind(),
            anchor: deserializeAnchor(votingProcedure.anchor()),
          });
        }
      }
    }
    const votingProposals = txBody.voting_proposals();
    if (votingProposals) {
      for (let i = 0; i < votingProposals.len(); i++) {
        // eslint-disable-next-line no-unused-vars
        const _votingProposal = votingProposals.get(i);
        //  wait for CSL update
      }
    }
    const currentTreasuryValue = txBody.current_treasury_value();
    if (currentTreasuryValue) {
      cip95Info.push({
        type: 'TreasuryValue',
        coin: currentTreasuryValue.to_str(),
      });
    }
    const donation = txBody.donation();
    if (donation) {
      cip95Info.push({
        type: 'TreasuryDonation',
        positiveCoin: donation.to_str(),
      });
    }
    runInAction(() => {
      this.adaTransaction = {
        inputs,
        // $FlowFixMe[prop-missing]
        foreignInputs,
        outputs,
        fee,
        total,
        amount,
        cip95Info,
      };
    });
  };

  static createForeignUtxoFetcher: (IFetcher, $ReadOnly<NetworkRow>) => ForeignUtxoFetcher = (
    fetcher,
    networkInfo
  ) => {
    return async (utxoIds: Array<string>): Promise<Array<?RemoteUnspentOutput>> => {
      const foreignInputs = utxoIds.map((id: string) => {
        // tx hash length is 64
        if ((id.length ?? 0) < 65) {
          throw new Error(`Invalid utxo ID "${id}", expected \`{hash}{index}\` with no separator`);
        }
        try {
          return {
            txHash: id.substring(0, 64),
            txIndex: parseInt(id.substring(64), 10),
          };
        } catch (e) {
          throw new Error(`Failed to parse utxo ID "${id}": ${String(e)}`);
        }
      });
      const fetchedData: GetUtxoDataResponse = await fetcher.getUtxoData({
        network: networkInfo,
        utxos: foreignInputs,
      });
      return fetchedData.map((data: UtxoData | null, i): ?RemoteUnspentOutput => {
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
      });
    };
  };

  generateReorgTransaction: void => Promise<void> = async () => {
    const { signingMessage, connectedWallet } = this;
    if (connectedWallet == null || signingMessage == null) return undefined;
    if (signingMessage.sign.type !== 'tx-reorg/cardano') {
      throw new Error('unexpected signing data type');
    }
    const { usedUtxoIds, reorgTargetAmount, utxos } = signingMessage.sign.tx;
    const addressedUtxos = asAddressedUtxo(toJS(utxos));
    this.addressedUtxos = addressedUtxos;
    const submittedTxs = await loadSubmittedTransactions() || [];

    const { unsignedTx, collateralOutputAddressSet } = await connectorGenerateReorgTx(
      connectedWallet.publicDeriver,
      usedUtxoIds,
      reorgTargetAmount,
      addressedUtxos,
      submittedTxs
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
      connectedWallet.publicDeriver,
      unsignedTx.inputs(),
      unsignedTx.outputs(),
      fee,
      utxos
    );
    runInAction(() => {
      this.adaTransaction = {
        foreignInputs: [],
        inputs: unsignedTx.inputs(),
        outputs: unsignedTx.outputs(),
        fee,
        amount,
        total,
        cip95Info: [],
      };
    });
  };
  signReorgTx: (PublicDeriver<>, string) => Promise<RustModule.WalletV4.Transaction> = async (
    publicDeriver,
    password
  ) => {
    const signRequest = this.reorgTxSignRequest;

    if (!signRequest) {
      throw new Error('unexpected nullish sign request');
    }

    if (publicDeriver.getParent().getWalletType() === WalletTypeOption.WEB_WALLET) {
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
        RustModule.WalletV4.Bip32PrivateKey.from_bytes(Buffer.from(normalizedKey.prvKeyHex, 'hex')),
        signRequest.neededStakingKeyHashes.wits,
        signRequest.metadata
      );
    }
    return this.hwSignTx(publicDeriver, Buffer.from(signRequest.unsignedTx.build().to_bytes()));
  };
  getUtxosAfterReorg: string => Array<RemoteUnspentOutput> = txId => {
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
  };

  async _calculateAmountAndTotal(
    publicDeriver: PublicDeriver<>,
    inputs: $ReadOnlyArray<TxDataInput>,
    outputs: $ReadOnlyArray<$ReadOnly<TxDataOutput>>,
    fee: {| tokenId: string, networkId: number, amount: string |},
    utxos: IGetAllUtxosResponse,
    ownAddresses: ?Set<string>
  ): Promise<{| amount: MultiToken, total: MultiToken |}> {
    if (!ownAddresses) {
      ownAddresses = new Set([
        ...utxos.map(utxo => utxo.address),
        ...(await connectorGetUsedAddresses(publicDeriver, null)),
        ...(await connectorGetUnusedAddresses(publicDeriver)),
        await connectorGetChangeAddress(publicDeriver),
      ]);
    }

    const { defaultNetworkId, defaultIdentifier } = publicDeriver.getParent().getDefaultToken();

    const total = new MultiToken(
      [
        {
          amount: new BigNumber('0'),
          identifier: defaultIdentifier,
          networkId: defaultNetworkId,
        },
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
          },
        ],
        { defaultNetworkId, defaultIdentifier }
      )
    );
    return { total, amount };
  }

  // <TODO:PENDING_REMOVAL> ?? LEGACY?
  @computed get signingRequest(): ?ISignRequest<any> {
    if (this.signingMessage == null) return;
    const { signingMessage } = this;
    const selectedWallet = this.connectedWallet;
    if (selectedWallet == null) return undefined;
    if (!signingMessage.sign.tx) return undefined;
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
  _removeWalletFromWhitelist: (request: {|
    url: string,
    protocol: string,
  |}) => Promise<void> = async request => {
    const filter = this.currentConnectorWhitelist.filter(
      e => !(e.url === request.url && e.protocol === request.protocol)
    );
    await this.setConnectorWhitelist.execute({
      whitelist: filter,
    });
    await this.getConnectorWhitelist.execute();
    window.chrome.runtime.sendMessage(
      ({
        type: 'remove_wallet_from_whitelist',
        url: request.url,
      }: RemoveWalletFromWhitelistData)
    );
  };

  _refreshActiveSites: void => Promise<void> = async () => {
    await this.getConnectedSites.execute();
  };

  // ========== active websites ========== //
  @computed get activeSites(): ConnectedSites {
    let { result } = this.getConnectedSites;
    if (result == null) {
      result = this.getConnectedSites.execute().result;
    }
    return result ?? { sites: [] };
  }

  @computed get connectedWallet(): ?PublicDeriverCache {
    const { signingMessage } = this;
    if (signingMessage == null) {
      return null;
    }
    return this.wallets.find(
      wallet => wallet.publicDeriver.getPublicDeriverId() === signingMessage.publicDeriverId
    );
  }

  async hwSignTx(
    publicDeriver: PublicDeriver<>,
    rawTxBody: Buffer,
    additionalRequiredSigners: Array<string> = [],
  ): Promise<RustModule.WalletV4.Transaction> {
    if (isLedgerNanoWallet(publicDeriver.getParent())) {
      return this.ledgerSignTx(publicDeriver, rawTxBody, additionalRequiredSigners);
    }
    if (isTrezorTWallet(publicDeriver.getParent())) {
      return this.trezorSignTx(publicDeriver, rawTxBody);
    }
    throw new Error('unexpected wallet type');
  }

  async trezorSignTx(
    publicDeriver: PublicDeriver<>,
    rawTxBody: Buffer
  ): Promise<RustModule.WalletV4.Transaction> {
    const config = getCardanoHaskellBaseConfig(publicDeriver.getParent().getNetworkInfo()).reduce(
      (acc, next) => Object.assign(acc, next),
      {}
    );

    const addresses = await getAllAddressesWithPaths(publicDeriver);
    const ownUtxoAddressMap = {};
    const ownStakeAddressMap = {};
    for (const { address, path } of addresses.utxoAddresses) {
      ownUtxoAddressMap[address] = path;
    }
    for (const { address, path } of addresses.accountingAddresses) {
      ownStakeAddressMap[address] = path;
    }

    const { addressedUtxos } = this;
    if (!addressedUtxos) {
      throw new Error('unexpected nullish addressed UTXOs');
    }
    const txBody = RustModule.WalletV4.TransactionBody.from_bytes(rawTxBody);

    let trezorSignTxPayload;
    try {
      trezorSignTxPayload = toTrezorSignRequest(
        txBody,
        Number(config.ChainNetworkId),
        config.ByronNetworkId,
        ownUtxoAddressMap,
        ownStakeAddressMap,
        addressedUtxos,
        rawTxBody,
      );
    } catch {
      runInAction(() => {
        this.hwWalletError = unsupportedTransactionError;
        this.isHwWalletErrorRecoverable = false;
      });
      throw new Error('unsupported transaction');
    }

    let trezorSignTxResp;
    try {
      const signResult = await wrapWithFrame(trezor =>
        trezor.cardanoSignTransaction({
          ...trezorSignTxPayload,
          allowSeedlessDevice: true,
        })
      );
      if (!signResult.success) {
        throw new Error(
          `Trezor signing error: ${signResult.payload.error} (code=${String(
            signResult.payload.code
          )})`
        );
      }
      trezorSignTxResp = signResult.payload;
    } catch (error) {
      runInAction(() => {
        this.hwWalletError = new convertToLocalizableTrezorError(error);
        this.isHwWalletErrorRecoverable = true;
      });
      throw error;
    }

    if (
      trezorSignTxResp.hash !==
      blake2b(256 / 8)
        .update(rawTxBody)
        .digest('hex')
    ) {
      runInAction(() => {
        this.hwWalletError = transactionHashMismatchError;
        this.isHwWalletErrorRecoverable = false;
      });
      throw new Error('hash mismatch');
    }

    return buildSignedTrezorTransaction(txBody, trezorSignTxResp.witnesses, undefined);
  }

  async ledgerSignTx(
    publicDeriver: PublicDeriver<>,
    rawTxBody: Buffer,
    additionalRequiredSigners: Array<string> = [],
  ): Promise<RustModule.WalletV4.Transaction> {
    const config = getCardanoHaskellBaseConfig(publicDeriver.getParent().getNetworkInfo()).reduce(
      (acc, next) => Object.assign(acc, next),
      {}
    );

    const addresses = await getAllAddressesWithPaths(publicDeriver);
    const ownUtxoAddressMap = {};
    const ownStakeAddressMap = {};
    for (const { address, path } of addresses.utxoAddresses) {
      ownUtxoAddressMap[address] = path;
    }
    for (const { address, path } of addresses.accountingAddresses) {
      ownStakeAddressMap[address] = path;
    }

    const { addressedUtxos } = this;
    if (!addressedUtxos) {
      throw new Error('unexpected nullish addressed UTXOs');
    }
    const txBody = RustModule.WalletV4.TransactionBody.from_bytes(rawTxBody);

    let ledgerSignTxPayload;
    try {
      ledgerSignTxPayload = toLedgerSignRequest(
        txBody,
        Number(config.ChainNetworkId),
        config.ByronNetworkId,
        ownUtxoAddressMap,
        ownStakeAddressMap,
        addressedUtxos,
        rawTxBody,
        additionalRequiredSigners,
      );
    } catch {
      runInAction(() => {
        this.hwWalletError = unsupportedTransactionError;
        this.isHwWalletErrorRecoverable = false;
      });
      throw new Error('unsupported transaction');
    }

    const expectedSerial = publicDeriver.getParent().hardwareInfo?.DeviceId || '';

    const ledgerConnect = new LedgerConnect({
      locale: this.stores.profile.currentLocale,
    });

    let ledgerSignResult;
    try {
      ledgerSignResult = await ledgerConnect.signTransaction({
        serial: expectedSerial,
        params: ledgerSignTxPayload,
      });
    } catch (error) {
      runInAction(() => {
        this.hwWalletError = new convertToLocalizableLedgerError(error);
        this.isHwWalletErrorRecoverable = true;
      });
      throw error;
    }

    if (
      ledgerSignResult.txHashHex !==
      blake2b(256 / 8)
        .update(rawTxBody)
        .digest('hex')
    ) {
      runInAction(() => {
        this.hwWalletError = transactionHashMismatchError;
        this.isHwWalletErrorRecoverable = false;
      });
      throw new Error('hash mismatch');
    }

    const withLevels = asHasLevels<ConceptualWallet>(publicDeriver);
    if (withLevels == null) {
      throw new Error('No public deriver level for this public deriver');
    }

    const withPublicKey = asGetPublicKey(withLevels);
    if (withPublicKey == null) throw new Error('No public key for this public deriver');
    const publicKey = await withPublicKey.getPublicKey();

    const publicKeyInfo = {
      key: RustModule.WalletV4.Bip32PublicKey.from_bytes(Buffer.from(publicKey.Hash, 'hex')),
      addressing: {
        startLevel: 1,
        path: withLevels.getPathToPublic(),
      },
    };

    return buildSignedLedgerTransaction(
      txBody,
      ledgerSignResult.witnesses,
      publicKeyInfo,
      undefined
    );
  }

  checkHwWalletSignData(): void {
    const { connectedWallet } = this;
    if (connectedWallet == null) {
      return;
    }
    if (connectedWallet.publicDeriver.getParent().getWalletType() !== WalletTypeOption.WEB_WALLET) {
      const hwWalletError = isLedgerNanoWallet(connectedWallet.publicDeriver.getParent())
        ? ledgerSignDataUnsupportedError
        : trezorSignDataUnsupportedError;
      runInAction(() => {
        this.hwWalletError = hwWalletError;
        this.isHwWalletErrorRecoverable = false;
      });
    }
  }
}

function deserializeAnchor(anchor: ?RustModule.WalletV4.Anchor): Anchor | null {
  if (!anchor) {
    return null;
  }
  return {
    url: anchor.url().url(),
    dataHash: anchor.anchor_data_hash().to_hex(),
  };
}



