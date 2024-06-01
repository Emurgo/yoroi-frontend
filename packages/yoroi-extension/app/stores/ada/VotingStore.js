// @flow

import BigNumber from 'bignumber.js';
import { observable, action, runInAction, reaction } from 'mobx';
import Store from '../base/Store';
import { Logger } from '../../utils/logging';
import { encryptWithPassword } from '../../utils/catalystCipher';
import LocalizedRequest from '../lib/LocalizedRequest';
import type { CreateVotingRegTxFunc } from '../../api/ada';
import {
  isCardanoHaskell,
  getCardanoHaskellBaseConfig,
  getNetworkById,
} from '../../api/ada/lib/storage/database/prepackaged/networks';
import { genTimeToSlot } from '../../api/ada/lib/storage/bridge/timeUtils';
import { generatePrivateKeyForCatalyst } from '../../api/ada/lib/cardanoCrypto/cryptoWallet';
import {
  isLedgerNanoWallet,
  isTrezorTWallet,
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import { WalletTypeOption } from '../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import { genOwnStakingKey } from '../../api/ada/index';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import type { StepStateEnum } from '../../components/widgets/ProgressSteps';
import { StepState } from '../../components/widgets/ProgressSteps';
import { ROUTES } from '../../routes-config';
import {
  convertToLocalizableError
} from '../../domain/LedgerLocalizedError';
import LocalizableError from '../../i18n/LocalizableError';
import cryptoRandomString from 'crypto-random-string';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import { generateRegistration } from '../../api/ada/lib/cardanoCrypto/catalyst';
import type { ConceptualWallet } from '../../api/ada/lib/storage/models/ConceptualWallet'
import type { CatalystRoundInfoResponse } from '../../api/ada/lib/state-fetch/types'
import {
  loadCatalystRoundInfo,
  saveCatalystRoundInfo,
} from '../../api/localStorage';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';
import { derivePublicByAddressing } from '../../api/ada/lib/cardanoCrypto/deriveByAddressing';
import type { WalletState } from '../../../chrome/extension/background/types';
import { getPrivateStakingKey } from '../../api/thunk';

export const ProgressStep = Object.freeze({
  GENERATE: 0,
  CONFIRM: 1,
  REGISTER: 2,
  TRANSACTION: 3,
  QR_CODE: 4,
});
export type ProgressStepEnum = $Values<typeof ProgressStep>;
export interface ProgressInfo {
  currentStep: ProgressStepEnum,
  stepState: StepStateEnum,
}

export default class VotingStore extends Store<StoresMap, ActionsMap> {
  @observable progressInfo: ProgressInfo
  @observable encryptedKey: string | null = null;
  @observable catalystPrivateKey: RustModule.WalletV4.PrivateKey | void;
  @observable pin: Array<number>;
  @observable error: ?LocalizableError;
  @observable catalystRoundInfo: ?CatalystRoundInfoResponse;
  @observable loadingCatalystRoundInfo: boolean = false;
  @observable
  createVotingRegTx: LocalizedRequest<CreateVotingRegTxFunc>
    = new LocalizedRequest<CreateVotingRegTxFunc>(
      this.api.ada.createVotingRegTx
    );

  /** tracks if wallet balance changed during confirmation screen */
  @observable isStale: boolean = false;

  // eslint-disable-next-line no-restricted-syntax
  _updateTxBuilderReaction: void => mixed = reaction(
    () => [
      this.stores.wallets.selected,
      // update if tx history changes
      this.stores.transactions.recent,
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
    votingActions.generateCatalystKey.listen(this._generateCatalystKey);
    votingActions.createTransaction.listen(this._createTransaction);
    votingActions.signTransaction.listen(this._signTransaction);
    votingActions.submitRegister.listen(this._submitRegister);
    votingActions.submitRegisterError.listen(this._submitRegisterError);
    votingActions.finishQRCode.listen(this._finishQRCode);
    votingActions.goBackToGenerate.listen(this._goBackToGenerate);
    votingActions.submitConfirm.listen(this._submitConfirm);
    votingActions.submitConfirmError.listen(this._submitConfirmError);
    votingActions.goBackToRegister.listen(this._goBackToRegister);
    votingActions.submitGenerate.listen(this._submitGenerate);
    votingActions.submitTransaction.listen(this._submitTransaction);
    votingActions.submitTransactionError.listen(this._submitTransactionError);
    votingActions.cancel.listen(this._cancel);
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
    if (!publicDeriver) {
      runInAction(() => {
        this.loadingCatalystRoundInfo = false
      })
      return;
    }
    const network = getNetworkById(publicDeriver.networkId);
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

  @action _goBackToRegister: void => void = () => {
    this.createVotingRegTx.reset();
    this.error = null;
    this.progressInfo.currentStep = ProgressStep.REGISTER;
    this.progressInfo.stepState = StepState.LOAD;
  };

  @action _submitTransaction: void => void = () => {
    this.progressInfo.currentStep = ProgressStep.QR_CODE;
    this.progressInfo.stepState = StepState.LOAD;
  };

  @action _submitGenerate: void => void = () => {
    this.progressInfo.currentStep = ProgressStep.CONFIRM;
    this.progressInfo.stepState = StepState.LOAD;
  };

  @action _submitConfirm: void => Promise<void> = async () => {
    const selected = this.stores.wallets.selected;
    if (!selected) {
      throw new Error(`${nameof(this._submitConfirm)} no public deriver. Should never happen`);
    }
    let nextStep;
    if (
      selected.type !== 'mnemonic'
    ) {
      await this.actions.ada.voting.createTransaction.trigger(null);
      nextStep = ProgressStep.TRANSACTION;
    } else {
      nextStep = ProgressStep.REGISTER;
    }
    runInAction(() => {
      this.progressInfo.currentStep = nextStep;
      this.progressInfo.stepState = StepState.LOAD;
    })
  };

  @action _submitConfirmError: void => void = () => {
    this.progressInfo.currentStep = ProgressStep.CONFIRM;
    this.progressInfo.stepState = StepState.ERROR;
  };

  @action _goBackToGenerate: void => void = () => {
    this.progressInfo.currentStep = ProgressStep.GENERATE;
    this.progressInfo.stepState = StepState.LOAD;
  };


  @action _finishQRCode: void => void = () => {
    this.actions.dialogs.closeActiveDialog.trigger();
    this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.TRANSACTIONS });
    this.reset({ justTransaction: false });
  }

  @action _submitRegister: void => void = () => {
    this.progressInfo.currentStep = ProgressStep.TRANSACTION;
    this.progressInfo.stepState = StepState.LOAD;
  };

  @action _submitRegisterError: Error => void = (error) => {
    this.error = convertToLocalizableError(error);
    this.progressInfo.currentStep = ProgressStep.REGISTER;
    this.progressInfo.stepState = StepState.ERROR;
  };

  @action _submitTransactionError: Error => void = (error) => {
    this.error = convertToLocalizableError(error);
    this.progressInfo.currentStep = ProgressStep.TRANSACTION;
    this.progressInfo.stepState = StepState.ERROR;
  };

  // For mnemonic wallet, we need password for transaction building to sign
  // the voting key with stake key as part of metadata.
  @action
  _createTransaction: (null | string) => Promise<void> = async spendingPassword => {
    this.progressInfo.stepState = StepState.PROCESS;
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) {
      return;
    }
    const network = getNetworkById(publicDeriver.networkId);
    const fullConfig = getCardanoHaskellBaseConfig(network);

    const timeToSlot = await genTimeToSlot(fullConfig);
    const absSlotNumber = new BigNumber(
      timeToSlot({
        // use server time for TTL if connected to server
        time: this.stores.serverConnectionStore.serverTime ?? new Date(),
      }).slot
    );

    const catalystPrivateKey = this.catalystPrivateKey;
    if(catalystPrivateKey === undefined){
      throw new Error(`${nameof(this._createTransaction)} should never happen`);
    }

    const nonce = timeToSlot({ time: new Date() }).slot;

    const firstExternalAddress = publicDeriver.externalAddressesByType[CoreAddressTypes.CARDANO_BASE][0];

    let votingRegTxPromise;

    if (publicDeriver.type !== 'mnemonic') {
      const votingPublicKey = `0x${Buffer.from(catalystPrivateKey.to_public().as_bytes()).toString('hex')}`;

      const publicKey = RustModule.WalletV4.Bip32PublicKey.from_bytes(
        Buffer.from(publicDeriver.publicKey, 'hex')
      );

      const stakingKey = derivePublicByAddressing({
        addressing: publicDeriver.stakingAddressing.addressing,
        startingFrom: {
          level: publicDeriver.publicDeriverLevel,
          key: publicKey,
        },
      }).to_raw_key();


      if (publicDeriver.type === 'trezor') {
        votingRegTxPromise = this.createVotingRegTx.execute({
          wallet: publicDeriver,
          absSlotNumber,
          trezorTWallet: {
            votingPublicKey,
            stakingKeyPath: publicDeriver.stakingAddressing.addressing.path,
            stakingKey: Buffer.from(stakingKey.as_bytes()).toString('hex'),
            paymentKeyPath: firstExternalAddress.addressing.path,
            paymentAddress: firstExternalAddress.address,
            nonce,
          },
        }).promise;
      } else if (publicDeriver.type === 'ledger') {
        votingRegTxPromise = this.createVotingRegTx.execute({
          wallet: publicDeriver,
          absSlotNumber,
          ledgerNanoWallet: {
            votingPublicKey,
            stakingKeyPath: publicDeriver.stakingAddressing.addressing.path,
            stakingKey: Buffer.from(stakingKey.as_bytes()).toString('hex'),
            paymentKeyPath: firstExternalAddress.addressing.path,
            paymentAddress: firstExternalAddress.address,
            nonce,
          },
        }).promise;
      } else {
        throw new Error(`${nameof(this._createTransaction)} unexpected hardware wallet type`);
      }

    } else {
      if (spendingPassword === null) {
        throw new Error(`${nameof(this._createTransaction)} expect a password`);
      }
      // todo: optimize this away, use one round-trip
      const stakingKey = await getPrivateStakingKey({
        publicDeriverId: publicDeriver.publicDeriverId,
        password: spendingPassword,
      });
      if (!stakingKey) {
        throw new Error('expect mnemonic wallet to have private staking key');
      }
      const trxMeta = generateRegistration({
        stakePrivateKey: RustModule.WalletV4.PrivateKey.from_hex(stakingKey),
        catalystPrivateKey,
        receiverAddress: firstExternalAddress.address,
        slotNumber: nonce,
      });

      votingRegTxPromise = this.createVotingRegTx.execute({
        wallet: publicDeriver,
        absSlotNumber,
        normalWallet: { metadata: trxMeta },
      }).promise;
    }

    if (votingRegTxPromise == null) {
      throw new Error(`${nameof(this._createTransaction)} should never happen`);
    }
    await votingRegTxPromise;
    this.markStale(false);
  };

  @action
  _signTransaction: ({|
    password?: string,
    wallet: WalletState,
  |}) => Promise<void> = async request => {
    const result = this.createVotingRegTx.result;
    if (result == null) {
      throw new Error(`${nameof(this._signTransaction)} no tx to broadcast`);
    }
    if (request.wallet.type === 'ledger') {
      await this.stores.substores.ada.wallets.adaSendAndRefresh({
        broadcastRequest: {
          ledger: {
            signRequest: result,
            wallet: request.wallet,
          },
        },
        refreshWallet: () => this.stores.wallets.refreshWalletFromRemote(request.wallet.publicDeriverId),
      });
      return;
    }
    if (request.wallet.type === 'trezor') {
      await this.stores.substores.ada.wallets.adaSendAndRefresh({
        broadcastRequest: {
          trezor: {
            signRequest: result,
            wallet: request.wallet,
          },
        },
        refreshWallet: () => this.stores.wallets.refreshWalletFromRemote(request.wallet.publicDeriverId),
      });
      return;
    }

    // normal password-based wallet
    if (request.password == null) {
      throw new Error(`${nameof(this._signTransaction)} missing password for non-hardware signing`);
    }
    await this.stores.substores.ada.wallets.adaSendAndRefresh({
      broadcastRequest: {
        normal: {
          wallet: request.wallet,
          password: request.password,
          signRequest: result,
        },
      },
      refreshWallet: () => this.stores.wallets.refreshWalletFromRemote(request.wallet),
    });
  };

  @action _generateCatalystKey: void => Promise<void> = async () => {
    Logger.info(
      `${nameof(VotingStore)}::${nameof(this._generateCatalystKey)} called`
    );

    const pin = cryptoRandomString({ length: 4, type: 'numeric' });
    const pinArray = pin.split('').map(Number);

    const passBuff = Buffer.from(pinArray);
    const rootKey = generatePrivateKeyForCatalyst();
    const key = await encryptWithPassword(passBuff, rootKey.to_raw_key().as_bytes());
    runInAction(() => {
      this.encryptedKey = key;
      this.pin = pinArray;
      this.catalystPrivateKey = RustModule.WalletV4.PrivateKey.from_extended_bytes(
        rootKey.to_raw_key().as_bytes()
      );
    });
  };

  @action _cancel: void => void = () => {
    this.reset({ justTransaction: false });
  }
  @action.bound
  reset(request: {| justTransaction: boolean |}): void {
    this.progressInfo = {
      currentStep: ProgressStep.GENERATE,
      stepState: StepState.LOAD,
    };
    this.error = null;
    this.stores.wallets.sendMoneyRequest.reset();
    this.createVotingRegTx.reset();
    if (!request.justTransaction) {
      this.isStale = false;
    }
    this.encryptedKey = null;
    this.catalystPrivateKey = undefined;
    this.pin = [];
  }
}
