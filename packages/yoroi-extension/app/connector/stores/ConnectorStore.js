/* eslint-disable promise/always-return */
// @flow
import type {
  ConnectedSites,
  ConnectingMessage,
  SigningMessage,
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
import type { RemoteUnspentOutput } from '../../api/ada/lib/state-fetch/types';
import { WrongPassphraseError } from '../../api/ada/lib/cardanoCrypto/cryptoErrors';
import type { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import type { IGetAllUtxosResponse } from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import BigNumber from 'bignumber.js';
import { action, computed, observable, runInAction, toJS } from 'mobx';
import Request from '../../stores/lib/LocalizedRequest';
import Store from '../../stores/base/Store';
import {
  getCardanoHaskellBaseConfig,
  isCardanoHaskell,
  getNetworkById,
} from '../../api/ada/lib/storage/database/prepackaged/networks';
import { MultiToken } from '../../api/common/lib/MultiToken';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { asAddressedUtxo, multiTokenFromCardanoValue, multiTokenFromRemote, } from '../../api/ada/transactions/utils';
import {
  _connectorGetUnusedAddresses,
  _connectorGetUsedAddressesWithPaginate,
  getScriptRequiredSigningKeys,
  resolveTxOrTxBody,
  _getOutputAddressesInSubmittedTxs,
} from '../../../chrome/extension/connector/api';
import { loadSubmittedTransactions } from '../../api/localStorage';
import { LedgerConnect } from '../../utils/hwConnectHandler';
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
import { noop } from '../../coreUtils';
import {
  getWallets,
  signAndBroadcastTransaction,
  broadcastTransaction,
  userSignConfirm,
  userSignReject,
  signFail,
  signWindowRetrieveData,
  connectWindowRetrieveData,
  removeWalletFromWhiteList,
  getConnectedSites,
} from '../../api/thunk';
import type { WalletState } from '../../../chrome/extension/background/types';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';
import { addressBech32ToHex } from '../../api/ada/lib/cardanoCrypto/utils';
import AdaApi from '../../api/ada';

// Need to run only once - Connecting wallets
let initedConnecting = false;
async function sendMsgConnect(): Promise<?ConnectingMessage> {
  if (!initedConnecting) {
    const res = await connectWindowRetrieveData();
    initedConnecting = true;
    return res;
  }
}

// Need to run only once - Sign Tx Confirmation
let initedSigning = false;
async function sendMsgSigningTx(): Promise<?SigningMessage> {
  if (!initedSigning) {
    const res = await signWindowRetrieveData();
    initedSigning = true;
    return res;
  }
}

type GetWhitelistFunc = void => Promise<?Array<WhitelistEntry>>;
type SetWhitelistFunc = ({|
  whitelist: Array<WhitelistEntry> | void,
|}) => Promise<void>;

export default class ConnectorStore extends Store<StoresMap, ActionsMap> {
  @observable unrecoverableError: string | null = null;
  @observable connectingMessage: ?ConnectingMessage = null;
  @observable whiteList: Array<WhitelistEntry> = [];

  @observable loadingWallets: $Values<typeof LoadingWalletStates> = LoadingWalletStates.IDLE;
  @observable errorWallets: string = '';
  @observable wallets: Array<WalletState> = [];

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
    noop(this.currentConnectorWhitelist);
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

    if (signingMessage.sign.type === 'tx-reorg/cardano') {
      // sign and send the tx
      let txId;
      try {
        txId = await this.signAndSendReorgTx(
          wallet,
          password,
          asAddressedUtxo(signingMessage.sign.tx.utxos),
        );
      } catch (error) {
        if (error instanceof WrongPassphraseError) {
          runInAction(() => {
            this.submissionError = 'WRONG_PASSWORD';
          });
          return;
        }
        runInAction(() => {
          this.submissionError = 'SEND_TX_ERROR';
        });
        return;
      }
      const utxos = this.getUtxosAfterReorg(txId);
      userSignConfirm({
        tx: utxos,
        uid: signingMessage.sign.uid,
        tabId: signingMessage.tabId,
        password,
      });
    } else if (
      signingMessage.sign.type === 'tx' ||
      signingMessage.sign.type === 'tx_input' ||
      signingMessage.sign.type === 'tx/cardano'
    ) {
      const tx = toJS(signingMessage.sign.tx);
      if (wallet.type !== 'mnemonic') {
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
            wallet,
            rawTxBody,
            additionalRequiredSigners,
          ))
          .witness_set()
          .to_hex();

        userSignConfirm({
          tx,
          uid: signingMessage.sign.uid,
          tabId: signingMessage.tabId,
          witnessSetHex,
          password: '',
        });
      } else {
        userSignConfirm( {
          tx,
          uid: signingMessage.sign.uid,
          tabId: signingMessage.tabId,
          password,
        });
      }
    } else if (signingMessage.sign.type === 'data') {
      userSignConfirm({
        tx: null,
        uid: signingMessage.sign.uid,
        tabId: signingMessage.tabId,
        password,
      });
    } else {
      throw new Error(`unkown sign data type ${signingMessage.sign.type}`);
    }

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
    userSignReject({
      uid: signingMessage.sign.uid,
      tabId: signingMessage.tabId,
    });
  };

  // ========== wallets info ========== //
  @action
  _getWallets: void => Promise<void> = async () => {
    runInAction(() => {
      this.loadingWallets = LoadingWalletStates.PENDING;
      this.errorWallets = '';
    });

    try {
      const wallets = await getWallets();

      runInAction(() => {
        this.loadingWallets = LoadingWalletStates.SUCCESS;
        // note: "replace" is a mobx-specific function
        (this.wallets: any).replace(wallets);
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
    const { tx /* , partialSign, tabId */ } = signingMessage.sign.tx;

    const network = getNetworkById(connectedWallet.networkId);

    if (!isCardanoHaskell(network)) {
      throw new Error(
        `${nameof(ConnectorStore)}::${nameof(this.createAdaTransaction)} unexpected wallet type`
      );
    }

    const submittedTxs = await loadSubmittedTransactions() || [];
    const addressedUtxos = await this.api.ada._addressedUtxosWithSubmittedTxs(
      asAddressedUtxo(connectedWallet.utxos),
      connectedWallet.publicDeriverId,
      connectedWallet.allUtxoAddresses,
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
    } catch {
      try {
        // Try parsing as body for backward compatibility
        txBody = RustModule.WalletV4.TransactionBody.from_bytes(bytes);
        this.rawTxBody = bytes;
      } catch {
        runInAction(() => {
          this.unrecoverableError = 'Unable to parse input transaction.';
        });
        return;
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
        signFail({
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

    // todo: review this:
    const ownAddresses = new Set([
      ...connectedWallet.allAddresses.utxoAddresses,
      ...connectedWallet.allAddresses.accountingAddresses,
    ].map(a => a.address.Hash));

    const outputs: Array<TxDataOutput> = [];
    for (let i = 0; i < txBody.outputs().len(); i++) {
      const output = txBody.outputs().get(i);
      const address = Buffer.from(output.address().to_bytes()).toString('hex');
      outputs.push({
        address,
        isForeign: !ownAddresses.has(address),
        value: multiTokenFromCardanoValue(
          output.amount(),
          {
            defaultNetworkId: connectedWallet.networkId,
            defaultIdentifier: connectedWallet.defaultTokenId,
          }
        ),
      });
    }
    const fee = {
      tokenId: defaultToken.Identifier,
      networkId: defaultToken.NetworkId,
      amount: txBody.fee().to_str(),
    };

    const { amount, total } = await this._calculateAmountAndTotal(
      connectedWallet,
      inputs,
      outputs,
      fee,
      connectedWallet.utxos,
      ownAddresses
    );

    const foreignInputDetails = [];
    if (foreignInputs.length) {
      const foreignUtxos = await this.stores.substores.ada.stateFetchStore.fetcher.getUtxoData({
        network,
        utxos: foreignInputs,
      });
      for (let i = 0; i < foreignUtxos.length; i++) {
        const foreignUtxo = foreignUtxos[i];
        if (foreignUtxo == null || typeof foreignUtxo !== 'object') {
          signFail({
            errorType: 'missing_utxo',
            data: `${foreignInputs[i].txHash}${foreignInputs[i].txIndex}`,
            uid: signingMessage.sign.uid,
            tabId: signingMessage.tabId,
          });
          this._closeWindow();
          return;
        }
        if (foreignUtxo.spendingTxHash != null) {
          signFail({
            errorType: 'spent_utxo',
            data: `${foreignInputs[i].txHash}${foreignInputs[i].txIndex}`,
            uid: signingMessage.sign.uid,
            tabId: signingMessage.tabId,
          });
          this._closeWindow();
          return;
        }
        const value = multiTokenFromRemote(foreignUtxo.output, defaultToken.NetworkId);
        foreignInputDetails.push({
          address: addressBech32ToHex(foreignUtxo.output.address),
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
        foreignInputs: foreignInputDetails,
        outputs,
        fee,
        total,
        amount,
        cip95Info,
      };
    });
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

    const adaApi = new AdaApi();
    const usedAddress = (await adaApi._getAllUsedAddresses(connectedWallet))[0];
    if (!usedAddress) {
      throw new Error('wallet has no used address');
    }

    const { unsignedTx, collateralOutputAddressSet } = await adaApi._createReorgTx(
      getNetworkById(connectedWallet.networkId),
      {
        defaultNetworkId: connectedWallet.networkId,
        defaultIdentifier: connectedWallet.defaultTokenId,
      },
      connectedWallet.publicDeriverId,
      connectedWallet.allUtxoAddresses,
      connectedWallet.receiveAddress,
      usedUtxoIds,
      reorgTargetAmount,
      addressedUtxos,
      connectedWallet.submittedTransactions,
      usedAddress,
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
      connectedWallet,
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
  signAndSendReorgTx: (
    WalletState,
    string,
    Array<CardanoAddressedUtxo>
  ) => Promise<string> = async (
    publicDeriver, password, addressedUtxos
  ) => {
    const signRequest = this.reorgTxSignRequest;

    if (!signRequest) {
      throw new Error('unexpected nullish sign request');
    }

    if (publicDeriver.type === 'mnemonic') {
      await signAndBroadcastTransaction({
        signRequest,
        password,
        publicDeriverId: publicDeriver.publicDeriverId
      });
    } else {
      const signedTx = await this.hwSignTx(
        publicDeriver,
        Buffer.from(signRequest.unsignedTx.build().to_bytes())
      );
      await broadcastTransaction({
        signedTxHex: signedTx.to_hex(),
        publicDeriverId: publicDeriver.publicDeriverId,
        addressedUtxos,
      });
    }
    return RustModule.WalletV4.hash_transaction(
      signRequest.unsignedTx.build()
    ).to_hex();
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
    publicDeriver: WalletState,
    inputs: $ReadOnlyArray<TxDataInput>,
    outputs: $ReadOnlyArray<$ReadOnly<TxDataOutput>>,
    fee: {| tokenId: string, networkId: number, amount: string |},
    utxos: IGetAllUtxosResponse,
    ownAddresses: ?Set<string>
  ): Promise<{| amount: MultiToken, total: MultiToken |}> {
    if (!ownAddresses) {
      const allBaseAddresses = [
        ...publicDeriver.allAddresses.utxoAddresses,
        ...publicDeriver.allAddresses.accountingAddresses,
      ].filter(a => a.address.Type === CoreAddressTypes.CARDANO_BASE)
      ownAddresses = new Set([
        ...utxos.map(utxo => utxo.address),
        ...(await _connectorGetUsedAddressesWithPaginate(
          allBaseAddresses.filter(a => a.address.IsUsed).map(a => a.address.Hash),
          allBaseAddresses.filter(a => !a.address.IsUsed).map(a => a.address.Hash),
          new Set(_getOutputAddressesInSubmittedTxs(publicDeriver.submittedTransactions)),
          null
        )),
        ...(await _connectorGetUnusedAddresses(
          allBaseAddresses.filter(a => !a.address.IsUsed).map(a => a.address.Hash),
          publicDeriver.submittedTransactions,
        )),
        publicDeriver.receiveAddress.addr.Hash,
      ]);
    }

    const defaultToken = {
      defaultNetworkId: publicDeriver.networkId,
      defaultIdentifier: publicDeriver.defaultTokenId,
    };

    const total = new MultiToken(
      [
        {
          amount: new BigNumber('0'),
          identifier: defaultToken.defaultIdentifier,
          networkId: defaultToken.defaultNetworkId,
        },
      ],
      defaultToken,
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
        defaultToken,
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
    await removeWalletFromWhiteList({ url: request.url });
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

  @computed get connectedWallet(): ?WalletState {
    const { signingMessage } = this;
    if (signingMessage == null) {
      return null;
    }
    return this.wallets.find(
      wallet => wallet.publicDeriverId === signingMessage.publicDeriverId
    );
  }

  async hwSignTx(
    publicDeriver: WalletState,
    rawTxBody: Buffer,
    additionalRequiredSigners: Array<string> = [],
  ): Promise<RustModule.WalletV4.Transaction> {
    const ownUtxoAddressMap: {| [string]: Array<number> |} = {};
    const ownStakeAddressMap: {| [string]: Array<number> |} = {};
    for (const { address, path } of publicDeriver.allAddresses.utxoAddresses) {
      ownUtxoAddressMap[address.Hash] = path;
    }
    for (const { address, path } of publicDeriver.allAddresses.accountingAddresses) {
      ownStakeAddressMap[address.Hash] = path;
    }


    if (publicDeriver.type === 'ledger') {
      return this.ledgerSignTx(
        publicDeriver,
        rawTxBody,
        ownUtxoAddressMap,
        ownStakeAddressMap,
        additionalRequiredSigners
      );
    }
    if (publicDeriver.type === 'trezor') {
      return this.trezorSignTx(
        publicDeriver,
        rawTxBody,
        ownUtxoAddressMap,
        ownStakeAddressMap,
      );
    }
    throw new Error('unexpected wallet type');
  }

  async trezorSignTx(
    publicDeriver: WalletState,
    rawTxBody: Buffer,
    ownUtxoAddressMap: {| [string]: Array<number> |},
    ownStakeAddressMap: {| [string]: Array<number> |},
  ): Promise<RustModule.WalletV4.Transaction> {
    const network = getNetworkById(publicDeriver.networkId);
    const config = getCardanoHaskellBaseConfig(network).reduce(
      (acc, next) => Object.assign(acc, next),
      {}
    );

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
    publicDeriver: WalletState,
    rawTxBody: Buffer,
    ownUtxoAddressMap: {| [string]: Array<number> |},
    ownStakeAddressMap: {| [string]: Array<number> |},
    additionalRequiredSigners: Array<string> = [],
  ): Promise<RustModule.WalletV4.Transaction> {
    const network = getNetworkById(publicDeriver.networkId);
    const config = getCardanoHaskellBaseConfig(network).reduce(
      (acc, next) => Object.assign(acc, next),
      {}
    );

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

    const expectedSerial = publicDeriver.hardwareWalletDeviceId || '';

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

    const publicKeyInfo = {
      key: RustModule.WalletV4.Bip32PublicKey.from_bytes(Buffer.from(publicDeriver.publicKey, 'hex')),
      addressing: {
        startLevel: 1,
        path: publicDeriver.pathToPublic,
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
    if (connectedWallet.type !== 'mnemonic') {
      const hwWalletError = connectedWallet.type === 'ledger'
        ? ledgerSignDataUnsupportedError
        : trezorSignDataUnsupportedError;
      runInAction(() => {
        this.hwWalletError = hwWalletError;
        this.isHwWalletErrorRecoverable = false;
      });
    }
  }

  // legacy, maybe remove
  get filteredWallets(): Array<WalletState> {
    return this.wallets;
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



