// @flow

import { action, observable, runInAction } from 'mobx';
import Store from '../base/Store';

import type {
  RestoreModeType,
  WalletRestoreMeta,
} from '../../actions/common/wallet-restore-actions';
import type { PlateResponse } from '../../api/common/lib/crypto/plate';
import { generateShelleyPlate } from '../../api/ada/lib/cardanoCrypto/plate';
import { HARD_DERIVATION_START } from '../../config/numbersConfig';
import { generateWalletRootKey as generateAdaWalletRootKey, } from '../../api/ada/lib/cardanoCrypto/cryptoWallet';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import type { $npm$ReactIntl$MessageDescriptor } from 'react-intl';
import { defineMessages } from 'react-intl';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import { isWalletExist } from '../../api/ada/lib/cardanoCrypto/utils';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';

const messages = defineMessages({
  walletRestoreVerifyAccountIdLabel: {
    id: 'wallet.restore.dialog.verify.accountId.label',
    defaultMessage: '!!!Your Wallet Account checksum:',
  },
  walletRestoreVerifyShelleyAccountIdLabel: {
    id: 'wallet.restore.dialog.verify.accountId.shelley.label',
    defaultMessage: '!!!Shelley account checksum:',
  },
  walletRestoreVerifyAddressesLabel: {
    id: 'wallet.restore.dialog.verify.addressesLabel',
    defaultMessage: '!!!Your Wallet address[es]:',
  },
  walletRestoreVerifyShelleyAddressesLabel: {
    id: 'wallet.restore.dialog.verify.shelley.addressesLabel',
    defaultMessage: '!!!Shelley Wallet address[es]:',
  },
});

export const NUMBER_OF_VERIFIED_ADDRESSES = 1;

export const RestoreSteps = Object.freeze({
  START: 0,
  WALLET_EXIST: 1,
  VERIFY_MNEMONIC: 2,
  LEGACY_EXPLANATION: 3,
  TRANSFER_TX_GEN: 4,
});
export type RestoreStepsType = $Values<typeof RestoreSteps>;
export type PlateWithMeta = {|
  ...PlateResponse,
  checksumTitle: $Exact<$npm$ReactIntl$MessageDescriptor>,
  addressMessage: $Exact<$npm$ReactIntl$MessageDescriptor>,
|};

export default class AdaWalletRestoreStore extends Store<StoresMap, ActionsMap> {
  @observable selectedAccount: number = 0 + HARD_DERIVATION_START;

  @observable step: RestoreStepsType;

  // only to handle the back button
  @observable walletRestoreMeta: void | WalletRestoreMeta;

  @observable recoveryResult: void | {|
    phrase: string,
    plates: Array<PlateWithMeta>,
  |};

  @observable duplicatedWallet: null | void | PublicDeriver<>;

  setup(): void {
    super.setup();
    this.reset();
    const actions = this.actions.walletRestore;
    actions.submitFields.listen(this._processRestoreMeta);
    actions.verifyMnemonic.listen(this._verifyMnemonic);
    actions.reset.listen(this.reset);
    actions.back.listen(this._back);
  }

  @action
  _verifyMnemonic: void => Promise<void> = async () => {
    const { selectedNetwork } = this.stores.profile;
    if (selectedNetwork == null)
      throw new Error(`${nameof(this._processRestoreMeta)} no network selected`);

    await this.actions.walletRestore.startRestore.trigger();
  };

  @action
  _processRestoreMeta: WalletRestoreMeta => Promise<void> = async restoreMeta => {
    this.walletRestoreMeta = restoreMeta;

    const resolvedRecoveryPhrase = restoreMeta.recoveryPhrase;

    const { selectedNetwork } = this.stores.profile;
    if (selectedNetwork == null)
      throw new Error(`${nameof(this._processRestoreMeta)} no network selected`);

    const plates = generatePlates(
      resolvedRecoveryPhrase,
      this.selectedAccount,
      selectedNetwork
    );

    runInAction(() => {
      this.recoveryResult = {
        phrase: resolvedRecoveryPhrase,
        plates,
      };
    });

    // Check for wallet duplication.
    const wallets = this.stores.wallets.publicDerivers;
    const accountIndex = this.stores.walletRestore.selectedAccount;
    const duplicatedWallet = await isWalletExist(
      wallets,
      resolvedRecoveryPhrase,
      accountIndex,
      selectedNetwork
    );

    runInAction(() => {
      this.step = duplicatedWallet ? RestoreSteps.WALLET_EXIST : RestoreSteps.VERIFY_MNEMONIC;
      this.duplicatedWallet = duplicatedWallet;
    });
  };

  teardown(): void {
    super.teardown();
    this.reset();
  }

  @action
  _back: void => void = () => {
    if (this.step === RestoreSteps.VERIFY_MNEMONIC || this.step === RestoreSteps.WALLET_EXIST) {
      this.recoveryResult = undefined;
      this.step = RestoreSteps.START;
      return;
    }
    if (this.step === RestoreSteps.LEGACY_EXPLANATION) {
      this.step = RestoreSteps.VERIFY_MNEMONIC;
    }
  };

  @action.bound
  reset(): void {
    this.step = RestoreSteps.START;
    this.walletRestoreMeta = undefined;
    this.recoveryResult = undefined;
    this.selectedAccount = 0 + HARD_DERIVATION_START;
  }

  isValidMnemonic: ({|
    mnemonic: string,
    // <TODO:PENDING_REMOVAL> paper
    mode: RestoreModeType,
  |}) => boolean = request => {
    const { selectedNetwork } = this.stores.profile;
    if (selectedNetwork == null) throw new Error(`${nameof(this.isValidMnemonic)} no API selected`);
    return this.stores.substores.ada.walletRestore.isValidMnemonic(request);
  };
}

export function generatePlates(
  recoveryPhrase: string,
  accountIndex: number,
  network: $ReadOnly<NetworkRow>
): Array<PlateWithMeta> {
  const shelleyPlate = generateShelleyPlate(
    generateAdaWalletRootKey(recoveryPhrase),
    accountIndex - HARD_DERIVATION_START,
    NUMBER_OF_VERIFIED_ADDRESSES,
    Number.parseInt(network.BaseConfig[0].ChainNetworkId, 10)
  );
  return [{
    ...shelleyPlate,
    checksumTitle: messages.walletRestoreVerifyShelleyAccountIdLabel,
    addressMessage: messages.walletRestoreVerifyShelleyAddressesLabel,
  }];
}
