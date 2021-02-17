// @flow

import BigNumber from 'bignumber.js';
import { observable, action, runInAction, reaction } from 'mobx';
import Store from '../base/Store';
import { Logger } from '../../utils/logging';
import { encryptWithPassword } from '../../utils/catalystCipher';
import LocalizedRequest from '../lib/LocalizedRequest';
import type { CreateVotingRegTxFunc } from '../../api/ada';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetAllUtxos,
  asHasUtxoChains,
  asGetSigningKey,
  asGetAllAccounting,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import {
  isCardanoHaskell,
  getCardanoHaskellBaseConfig,
} from '../../api/ada/lib/storage/database/prepackaged/networks';
import { genTimeToSlot } from '../../api/ada/lib/storage/bridge/timeUtils';
import { generatePrivateKeyForCatalyst } from '../../api/ada/lib/cardanoCrypto/cryptoWallet';
import {
  isLedgerNanoWallet,
  isTrezorTWallet,
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';
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

export default class VotingStore extends Store {
  @observable progressInfo: ProgressInfo
  @observable encryptedKey: string | null = null;
  @observable catalystPrivateKey: RustModule.WalletV4.PrivateKey | void;
  @observable pin: Array<number>;
  @observable error: ?LocalizableError;

  @observable
  createVotingRegTx: LocalizedRequest<CreateVotingRegTxFunc> = new LocalizedRequest<CreateVotingRegTxFunc>(
    this.api.ada.createVotingRegTx
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
  }

  get isActionProcessing(): boolean {
    return this.progressInfo.stepState === StepState.PROCESS;
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

  @action _submitConfirm: void => void = () => {
    this.progressInfo.currentStep = ProgressStep.REGISTER;
    this.progressInfo.stepState = StepState.LOAD;
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
    this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ROOT });
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

  // we need password for transaction building to sign the voting key with stake key
  // as part of metadata
  @action
  _createTransaction: string => Promise<void> = async spendingPassword => {
    this.progressInfo.stepState = StepState.PROCESS;
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) {
      return;
    }

    const withSigning = asGetSigningKey(publicDeriver);
    if (withSigning == null) {
      throw new Error(
        `${nameof(this._createTransaction)} public deriver missing signing functionality.`
      );
    }
    const withStakingKey = asGetAllAccounting(withSigning);
    if (withStakingKey == null) {
      throw new Error(`${nameof(this._createTransaction)} missing staking key functionality`);
    }
    const stakingKey = await genOwnStakingKey({
      publicDeriver: withStakingKey,
      password: spendingPassword,
    });
    const stakeKeyPub = Buffer.from(
      RustModule.WalletV4.StakeCredential.from_keyhash(stakingKey.to_public().hash()).to_bytes()
    ).toString('hex');

    const withUtxos = asGetAllUtxos(publicDeriver);
    if (withUtxos == null) {
      throw new Error(`${nameof(this._createTransaction)} missing utxo functionality`);
    }

    const network = withUtxos.getParent().getNetworkInfo();
    if (isCardanoHaskell(network)) {
      const withHasUtxoChains = asHasUtxoChains(withUtxos);
      if (withHasUtxoChains == null) {
        throw new Error(`${nameof(this._createTransaction)} missing chains functionality`);
      }
      const fullConfig = getCardanoHaskellBaseConfig(
        withHasUtxoChains.getParent().getNetworkInfo()
      );
      const timeToSlot = await genTimeToSlot(fullConfig);
      const absSlotNumber = new BigNumber(
        timeToSlot({
          // use server time for TTL if connected to server
          time: this.stores.serverConnectionStore.serverTime ?? new Date(),
        }).slot
      );

      if(this.catalystPrivateKey === undefined){
        throw new Error(`${nameof(this._createTransaction)} should never happen`);
      }
      const catalystPrivateKeyBytes = this.catalystPrivateKey.to_public().as_bytes();
      const catalystPubKey = Buffer.from(catalystPrivateKeyBytes)
        .toString('hex');
      const catalystSignature = stakingKey
        .sign(catalystPrivateKeyBytes)
        .to_hex();

      const withChains = asHasUtxoChains(publicDeriver);
      if (!withChains) throw new Error(`${nameof(this._createTransaction)} missing chains functionality`);
      const nextInternal = await withChains.nextInternal();
      if (nextInternal.addressInfo == null) {
        throw new Error(`${nameof(this._createTransaction)} no internal addresses left. Should never happen`);
      }

      /**
       * Catalyst follows a certain standard to prove the voting power
       * A transaction is submitted with following metadata format for the registration process
       * label: 61284
       * {
       *   1: "pubkey generated for catalyst app",
       *   2: "stake key public key",
       *   3: "address to receive rewards to"
       * }
       * label: 61285
       * {
       *   1: "pubkey signed using stakekey"
       * }
       */
      const trxMeta = [
        {
          label: '61284',
          data: {
            '1': `0x${catalystPubKey}`,
            '2': `0x${stakeKeyPub}`,
            '3': `0x${nextInternal.addressInfo.addr.Hash}`,
          },
        },
        {
          label: '61285',
          data: { '1': `0x${catalystSignature}` },
        },
      ];

      const votingRegTxPromise = this.createVotingRegTx.execute({
        publicDeriver: withHasUtxoChains,
        absSlotNumber,
        metadata: trxMeta,
      }).promise;
      if (votingRegTxPromise == null) {
        throw new Error(`${nameof(this._createTransaction)} should never happen`);
      }
      await votingRegTxPromise;
      this.markStale(false);
    } else {
      throw new Error(
        `${nameof(VotingStore)}::${nameof(this._createTransaction)} network not supported`
      );
    }
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
      return;
    }
    if (isTrezorTWallet(request.publicDeriver.getParent())) {
      await this.stores.substores.ada.wallets.adaSendAndRefresh({
        broadcastRequest: {
          trezor: {
            signRequest: result,
            publicDeriver: request.publicDeriver,
          },
        },
        refreshWallet: () => this.stores.wallets.refreshWalletFromRemote(request.publicDeriver),
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
          publicDeriver: request.publicDeriver,
          password: request.password,
          signRequest: result,
        },
      },
      refreshWallet: () => this.stores.wallets.refreshWalletFromRemote(request.publicDeriver),
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
