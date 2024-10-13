// @flow

import BigNumber from 'bignumber.js';
import { action, observable, reaction, runInAction } from 'mobx';
import Store from '../base/Store';
import { Logger } from '../../utils/logging';
import { encryptWithPassword } from '../../utils/catalystCipher';
import LocalizedRequest from '../lib/LocalizedRequest';
import type { CreateVotingRegTxFunc } from '../../api/ada';
import {
  getCardanoHaskellBaseConfig,
  getNetworkById,
} from '../../api/ada/lib/storage/database/prepackaged/networks';
import TimeUtils from '../../api/ada/lib/storage/bridge/timeUtils';
import { generatePrivateKeyForCatalyst } from '../../api/ada/lib/cardanoCrypto/cryptoWallet';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import type { StepStateEnum } from '../../components/widgets/ProgressSteps';
import { StepState } from '../../components/widgets/ProgressSteps';
import { ROUTES } from '../../routes-config';
import { convertToLocalizableError } from '../../domain/LedgerLocalizedError';
import LocalizableError from '../../i18n/LocalizableError';
import cryptoRandomString from 'crypto-random-string';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import { generateRegistration } from '../../api/ada/lib/cardanoCrypto/catalyst';
import type { CatalystRoundInfoResponse } from '../../api/ada/lib/state-fetch/types'
import { loadCatalystRoundInfo, saveCatalystRoundInfo, } from '../../api/localStorage';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';
import { derivePublicByAddressing } from '../../api/ada/lib/cardanoCrypto/deriveByAddressing';
import type { WalletState } from '../../../chrome/extension/background/types';
import { getPrivateStakingKey, getProtocolParameters } from '../../api/thunk';
import { bytesToHex, noop } from '../../coreUtils';

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
    this.reset({ justTransaction: false });
    noop(this.loadCatalystRoundInfo());
    noop(this.updateCatalystRoundInfo());
  }

  get isActionProcessing(): boolean {
    return this.progressInfo.stepState === StepState.PROCESS;
  }

  loadCatalystRoundInfo: void => Promise<void> = async () => {
    const data = await loadCatalystRoundInfo();
    runInAction(() => {
      this.catalystRoundInfo = data;
    });
  }

  @action updateCatalystRoundInfo: void => Promise<void> = async () => {
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

  @action goBackToRegister: void => void = () => {
    this.createVotingRegTx.reset();
    this.error = null;
    this.progressInfo.currentStep = ProgressStep.REGISTER;
    this.progressInfo.stepState = StepState.LOAD;
  };

  @action submitTransaction: void => void = () => {
    this.progressInfo.currentStep = ProgressStep.QR_CODE;
    this.progressInfo.stepState = StepState.LOAD;
  };

  @action submitGenerate: void => void = () => {
    this.progressInfo.currentStep = ProgressStep.CONFIRM;
    this.progressInfo.stepState = StepState.LOAD;
  };

  @action submitConfirm: void => Promise<void> = async () => {
    const selected = this.stores.wallets.selected;
    if (!selected) {
      throw new Error(`${nameof(this.submitConfirm)} no public deriver. Should never happen`);
    }
    let nextStep;
    if (
      selected.type !== 'mnemonic'
    ) {
      await this.createTransaction(null);
      nextStep = ProgressStep.TRANSACTION;
    } else {
      nextStep = ProgressStep.REGISTER;
    }
    runInAction(() => {
      this.progressInfo.currentStep = nextStep;
      this.progressInfo.stepState = StepState.LOAD;
    })
  };

  @action submitConfirmError: void => void = () => {
    this.progressInfo.currentStep = ProgressStep.CONFIRM;
    this.progressInfo.stepState = StepState.ERROR;
  };

  @action goBackToGenerate: void => void = () => {
    this.progressInfo.currentStep = ProgressStep.GENERATE;
    this.progressInfo.stepState = StepState.LOAD;
  };


  @action finishQRCode: void => void = () => {
    this.actions.dialogs.closeActiveDialog.trigger();
    this.stores.app.goToRoute({ route: ROUTES.WALLETS.TRANSACTIONS });
    this.reset({ justTransaction: false });
  }

  @action submitRegister: void => void = () => {
    this.progressInfo.currentStep = ProgressStep.TRANSACTION;
    this.progressInfo.stepState = StepState.LOAD;
  };

  @action submitRegisterError: Error => void = (error) => {
    this.error = convertToLocalizableError(error);
    this.progressInfo.currentStep = ProgressStep.REGISTER;
    this.progressInfo.stepState = StepState.ERROR;
  };

  @action submitTransactionError: Error => void = (error) => {
    this.error = convertToLocalizableError(error);
    this.progressInfo.currentStep = ProgressStep.TRANSACTION;
    this.progressInfo.stepState = StepState.ERROR;
  };

  // For mnemonic wallet, we need password for transaction building to sign
  // the voting key with stake key as part of metadata.
  @action
  createTransaction: (null | string) => Promise<void> = async spendingPassword => {
    this.progressInfo.stepState = StepState.PROCESS;
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) {
      return;
    }
    const network = getNetworkById(publicDeriver.networkId);
    const fullConfig = getCardanoHaskellBaseConfig(network);

    // use server time for TTL if connected to server
    const currentTime = this.stores.serverConnectionStore.serverTime ?? new Date();
    const currentAbsoluteSlot = TimeUtils.timeToAbsoluteSlot(fullConfig, currentTime);
    const absSlotNumber = new BigNumber(currentAbsoluteSlot);

    const catalystPrivateKey = this.catalystPrivateKey;
    if(catalystPrivateKey === undefined){
      throw new Error(`${nameof(this.createTransaction)} should never happen`);
    }

    const firstAddress = publicDeriver.externalAddressesByType[CoreAddressTypes.CARDANO_BASE][0];

    const protocolParameters = await getProtocolParameters(publicDeriver);

    let votingRegTxPromise;

    if (publicDeriver.type !== 'mnemonic') {
      const votingPublicKey = `0x${bytesToHex(catalystPrivateKey.to_public().as_bytes())}`;

      const publicKey = RustModule.WalletV4.Bip32PublicKey.from_hex(publicDeriver.publicKey);

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
            stakingKey: bytesToHex(stakingKey.as_bytes()),
            paymentKeyPath: firstAddress.addressing.path,
            paymentAddress: firstAddress.address,
            nonce: currentAbsoluteSlot,
          },
          protocolParameters,
        }).promise;
      } else if (publicDeriver.type === 'ledger') {
        votingRegTxPromise = this.createVotingRegTx.execute({
          wallet: publicDeriver,
          absSlotNumber,
          ledgerNanoWallet: {
            votingPublicKey,
            stakingKeyPath: publicDeriver.stakingAddressing.addressing.path,
            stakingKey: bytesToHex(stakingKey.as_bytes()),
            paymentKeyPath: firstAddress.addressing.path,
            paymentAddress: firstAddress.address,
            nonce: currentAbsoluteSlot,
          },
          protocolParameters,
        }).promise;
      } else {
        throw new Error(`${nameof(this.createTransaction)} unexpected hardware wallet type`);
      }

    } else {
      if (spendingPassword === null) {
        throw new Error(`${nameof(this.createTransaction)} expect a password`);
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
        receiverAddress: firstAddress.address,
        slotNumber: currentAbsoluteSlot,
      });

      votingRegTxPromise = this.createVotingRegTx.execute({
        wallet: publicDeriver,
        absSlotNumber,
        normalWallet: { metadata: trxMeta },
        protocolParameters,
      }).promise;
    }

    if (votingRegTxPromise == null) {
      throw new Error(`${nameof(this.createTransaction)} should never happen`);
    }
    await votingRegTxPromise;
    this.markStale(false);
  };

  @action
  signTransaction: ({|
    password?: string,
    wallet: WalletState,
  |}) => Promise<void> = async request => {
    const result = this.createVotingRegTx.result;
    if (result == null) {
      throw new Error(`${nameof(this.signTransaction)} no tx to broadcast`);
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
      throw new Error(`${nameof(this.signTransaction)} missing password for non-hardware signing`);
    }
    await this.stores.substores.ada.wallets.adaSendAndRefresh({
      broadcastRequest: {
        normal: {
          wallet: request.wallet,
          password: request.password,
          signRequest: result,
        },
      },
      refreshWallet: () => this.stores.wallets.refreshWalletFromRemote(request.wallet.publicDeriverId),
    });
  };

  @action generateCatalystKey: void => Promise<void> = async () => {
    Logger.info(
      `${nameof(VotingStore)}::${nameof(this.generateCatalystKey)} called`
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

  @action cancel: void => void = () => {
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
