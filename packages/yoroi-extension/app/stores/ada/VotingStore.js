// @flow

import BigNumber from 'bignumber.js';
import { observable, action, runInAction, reaction } from 'mobx';
import Store from '../base/Store';
import LocalizedRequest from '../lib/LocalizedRequest';
import type { CreateVotingRegTxFunc } from '../../api/ada';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetAllUtxos,
  asHasUtxoChains,
  asGetSigningKey,
  asGetAllAccounting,
  asGetStakingKey,
  asGetPublicKey,
  asHasLevels,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import {
  isCardanoHaskell,
  getCardanoHaskellBaseConfig,
  isErgo,
} from '../../api/ada/lib/storage/database/prepackaged/networks';
import { genTimeToSlot } from '../../api/ada/lib/storage/bridge/timeUtils';
import {
  isLedgerNanoWallet,
  isTrezorTWallet,
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import { WalletTypeOption } from '../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import {
  genOwnStakingKey,
  getCip36VotingKey,
} from '../../api/ada/index';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import type { StepStateEnum } from '../../components/widgets/ProgressSteps';
import { StepState } from '../../components/widgets/ProgressSteps';
import { ROUTES } from '../../routes-config';
import {
  convertToLocalizableError
} from '../../domain/LedgerLocalizedError';
import LocalizableError from '../../i18n/LocalizableError';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import {
  generateRegistration,
  VoteKeyDerivationPath,
} from '../../api/ada/lib/cardanoCrypto/catalyst';
import { derivePublicByAddressing } from '../../api/ada/lib/cardanoCrypto/utils'
import type { ConceptualWallet } from '../../api/ada/lib/storage/models/ConceptualWallet'
import type { CatalystRoundInfoResponse } from '../../api/ada/lib/state-fetch/types'
import { trackCatalystRegistration } from '../../api/analytics';
import {
  loadCatalystRoundInfo,
  saveCatalystRoundInfo,
} from '../../api/localStorage';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';

export const ProgressStep = Object.freeze({
  TRANSACTION: 1,
  DONE: 2,
});
export type ProgressStepEnum = $Values<typeof ProgressStep>;
export interface ProgressInfo {
  currentStep: ProgressStepEnum,
  stepState: StepStateEnum,
}

export default class VotingStore extends Store<StoresMap, ActionsMap> {
  @observable progressInfo: ProgressInfo
  @observable error: ?LocalizableError;
  @observable catalystRoundInfo: ?CatalystRoundInfoResponse;
  @observable loadingCatalystRoundInfo: boolean = false;
  @observable
  createVotingRegTx: LocalizedRequest<CreateVotingRegTxFunc>
    = new LocalizedRequest<CreateVotingRegTxFunc>(
      this.api.ada.createVotingRegTx
    );
  @observable
  generateVotingRegTx: LocalizedRequest<(?string) => Promise<void>>
    = new LocalizedRequest<(?string) => Promise<void>>(
      this._createTransaction
    );
  /** tracks if wallet balance changed during confirmation screen */
  @observable isStale: boolean = false;

  // eslint-disable-next-line no-restricted-syntax
  _updateTxBuilderReaction: void => mixed = reaction(
    () => [
      this.stores.wallets.selected,
      // update if tx history changes
      this.stores.transactions.hash,
    ],
    () => {
      if (this.createVotingRegTx.wasExecuted) {
        this.markStale(true);
      }
    }
  );

  @action.bound
  markStale: boolean => void = status => {
    this.isStale = status;
  };

  setup(): void {
    super.setup();
    const { voting: votingActions } = this.actions.ada;
    this.reset({ justTransaction: false });
    votingActions.signTransaction.listen(this._signTransaction);
    votingActions.finishDone.listen(this._finishDone);
    votingActions.submitTransaction.listen(this._submitTransaction);
    votingActions.submitTransactionError.listen(this._submitTransactionError);
    votingActions.cancel.listen(this._cancel);
    votingActions.generatePlaceholderTransaction.listen(async () => {
      this.generateVotingRegTx.reset();
      this.generateVotingRegTx.execute();
    });
    this.actions.wallets.setActiveWallet.listen(() => {this._updateCatalystRoundInfo()});
    this._loadCatalystRoundInfo();
    this._updateCatalystRoundInfo();
  }

  get isActionProcessing(): boolean {
    return this.progressInfo.stepState === StepState.PROCESS;
  }

  _loadCatalystRoundInfo: void => Promise<void> = async () => {
    const data = await loadCatalystRoundInfo();
    runInAction(() => {
      this.catalystRoundInfo = data;
    });
  }

  @action _updateCatalystRoundInfo: void => Promise<void> = async () => {
    runInAction(() => {
      this.loadingCatalystRoundInfo = true
    })
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver || isErgo(publicDeriver.getParent().getNetworkInfo())) {
      runInAction(() => {
        this.loadingCatalystRoundInfo = false
      })
      return;
    }
    const network = publicDeriver.getParent().getNetworkInfo()
    const res = await this.stores.substores.ada.stateFetchStore.fetcher
                .getCatalystRoundInfo({ network })
    runInAction(() => {
      this.catalystRoundInfo = res
      this.loadingCatalystRoundInfo = false
    })
    if (res) {
      await saveCatalystRoundInfo(res);
    }
  }

  @action _submitTransaction: void => void = () => {
    this.progressInfo.currentStep = ProgressStep.DONE;
    this.progressInfo.stepState = StepState.LOAD;
  };

  @action _finishDone: void => void = () => {
    this.actions.dialogs.closeActiveDialog.trigger();
    this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.TRANSACTIONS });
    this.reset({ justTransaction: false });
  }

  @action _submitTransactionError: Error => void = (error) => {
    this.error = convertToLocalizableError(error);
    this.progressInfo.currentStep = ProgressStep.TRANSACTION;
    this.progressInfo.stepState = StepState.ERROR;
  };

  @action
  _createTransaction: () => Promise<void> = async () => {
    this.progressInfo.stepState = StepState.PROCESS;
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) {
      return;
    }

    const withUtxos = asGetAllUtxos(publicDeriver);
    if (withUtxos == null) {
      throw new Error(`${nameof(this._createTransaction)} missing utxo functionality`);
    }

    const network = withUtxos.getParent().getNetworkInfo();
    if (!isCardanoHaskell(network)) {
      throw new Error(
        `${nameof(VotingStore)}::${nameof(this._createTransaction)} network not supported`
      );
    }

    const withHasUtxoChains = asHasUtxoChains(withUtxos);
    if (withHasUtxoChains == null) {
      throw new Error(`${nameof(this._createTransaction)} missing chains functionality`);
    }

    const fullConfig = getCardanoHaskellBaseConfig(
      publicDeriver.getParent().getNetworkInfo()
    );

    const timeToSlot = await genTimeToSlot(fullConfig);
    const absSlotNumber = new BigNumber(
      timeToSlot({
        // use server time for TTL if connected to server
        time: this.stores.serverConnectionStore.serverTime ?? new Date(),
      }).slot
    );

    const nonce = timeToSlot({ time: new Date() }).slot;

    const allAddresses = await this.api.ada.getAllAddressesForDisplay({
      publicDeriver,
      type: CoreAddressTypes.CARDANO_BASE,
    });
    const paymentAddress = allAddresses[0].address;

    const metadata = generateRegistration({
      stakePrivateKey: null,
      votingPublicKey: null,
      receiverAddress: paymentAddress,
      slotNumber: nonce,
    });

    const withStakingKey = asGetStakingKey(publicDeriver);
    if (!withStakingKey) {
      throw new Error(`${nameof(this._createTransaction)} can't get staking key`);
    }
    const stakingKeyResp = await withStakingKey.getStakingKey();

    const asGetPublicKeyInstance = asGetPublicKey(publicDeriver);
    if (!asGetPublicKeyInstance) {
      throw new Error('Cannot get public key. Should never happen');
    }
    const publicKeyResp = await asGetPublicKeyInstance.getPublicKey();
    const publicKey = RustModule.WalletV4.Bip32PublicKey.from_bytes(
      Buffer.from(publicKeyResp.Hash, 'hex')
    );

    const withLevels = asHasLevels<ConceptualWallet>(publicDeriver);
    if (!withLevels) {
      throw new Error('Cannot get level. Should never happen');
    }
    const stakingKey = derivePublicByAddressing({
      addressing: stakingKeyResp.addressing,
      startingFrom: {
        level: withLevels.getParent().getPublicDeriverLevel(),
        key: publicKey,
      },
    }).to_raw_key();

    const votingRegTxPromise = this.createVotingRegTx.execute({
      publicDeriver: withHasUtxoChains,
      absSlotNumber,
      metadata,
      cip36Data: {
        paymentAddress,
        paymentAddressPath: allAddresses[0].addressing.path,
        nonce,
        stakingPublicKey: stakingKey.to_hex(), 
        stakingKeyPath: stakingKeyResp.addressing.path,
        votingPublicKeyPath: VoteKeyDerivationPath,
      }
    }).promise;

    if (votingRegTxPromise == null) {
      throw new Error(`${nameof(this._createTransaction)} should never happen`);
    }
    await votingRegTxPromise;
    this.markStale(false);
  };

  @action
  _signTransaction: ({|
    password?: string,
    publicDeriver: PublicDeriver<>,
  |}) => Promise<void> = async request => {
    const result = this.createVotingRegTx.result;
    if (result == null) {
      throw new Error(`${nameof(this._signTransaction)} no tx to broadcast`);
    }
    if (isLedgerNanoWallet(request.publicDeriver.getParent())) {
      await this.stores.substores.ada.wallets.adaSendAndRefresh({
        broadcastRequest: {
          ledger: {
            signRequest: result,
            publicDeriver: request.publicDeriver,
          },
        },
        refreshWallet: () => this.stores.wallets.refreshWalletFromRemote(request.publicDeriver),
      });
    } else if (isTrezorTWallet(request.publicDeriver.getParent())) {
      await this.stores.substores.ada.wallets.adaSendAndRefresh({
        broadcastRequest: {
          trezor: {
            signRequest: result,
            publicDeriver: request.publicDeriver,
          },
        },
        refreshWallet: () => this.stores.wallets.refreshWalletFromRemote(request.publicDeriver),
      });
    } else {
      // normal password-based wallet
      const { cip36Data } = result;
      if (!cip36Data) {
        throw new Error('unexpectedly missing cip36 data');
      }

      const withSigning = asGetSigningKey(request.publicDeriver);
      if (withSigning == null) {
        throw new Error(
          `${nameof(this._signTransaction)} public deriver missing signing functionality.`
        );
      }
      const withStakingKey = asGetAllAccounting(withSigning);
      if (withStakingKey == null) {
        throw new Error(`${nameof(this._signTransaction)} missing staking key functionality`);
      }

      const { password } = request;
      if (password == null) {
        throw new Error(`${nameof(this._signTransaction)} missing password for non-hardware signing`);
      }

      const stakePrivateKey = await genOwnStakingKey({
        publicDeriver: withStakingKey,
        password,
      });

      const votingPrivateKey = await getCip36VotingKey({
        publicDeriver: withSigning,
        password,
      });

      const trxMeta = generateRegistration({
        stakePrivateKey,
        votingPublicKey: votingPrivateKey.to_public(),
        receiverAddress: cip36Data.paymentAddress,
        slotNumber: cip36Data.nonce,
      });
      
      await this.stores.substores.ada.wallets.adaSendAndRefresh({
        broadcastRequest: {
          normal: {
            publicDeriver: request.publicDeriver,
            password,
            signRequest: result,
          },
        },
        refreshWallet: () => this.stores.wallets.refreshWalletFromRemote(request.publicDeriver),
      });
    }
    trackCatalystRegistration();
  };

  @action _cancel: void => void = () => {
    this.reset({ justTransaction: false });
  }
  @action.bound
  reset(request: {| justTransaction: boolean |}): void {
    this.progressInfo = {
      currentStep: ProgressStep.TRANSACTION,
      stepState: StepState.LOAD,
    };
    this.error = null;
    this.stores.wallets.sendMoneyRequest.reset();
    this.createVotingRegTx.reset();
    if (!request.justTransaction) {
      this.isStale = false;
    }
  }
}
