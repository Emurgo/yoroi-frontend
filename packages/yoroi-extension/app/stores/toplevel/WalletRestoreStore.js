// @flow

import { observable, action, runInAction } from 'mobx';
import Store from '../base/Store';

import type {
  PaperWalletRestoreMeta,
  RestoreModeType,
} from '../../actions/common/wallet-restore-actions';
import type { PlateResponse } from '../../api/common/lib/crypto/plate';
import { unscramblePaperAdaMnemonic } from '../../api/ada/lib/cardanoCrypto/paperWallet';
import { generateShelleyPlate } from '../../api/ada/lib/cardanoCrypto/plate';
import { generateErgoPlate } from '../../api/ergo/lib/crypto/plate';
import { HARD_DERIVATION_START } from '../../config/numbersConfig';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import {
  generateWalletRootKey as generateAdaWalletRootKey,
  generateLedgerWalletRootKey,
} from '../../api/ada/lib/cardanoCrypto/cryptoWallet';
import { generateWalletRootKey as generateErgoWalletRootKey } from '../../api/ergo/lib/crypto/wallet';
import { getApiForNetwork } from '../../api/common/utils';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import {
  isCardanoHaskell,
  isErgo,
} from '../../api/ada/lib/storage/database/prepackaged/networks';
import { defineMessages } from 'react-intl';
import type { $npm$ReactIntl$MessageDescriptor } from 'react-intl';
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
export const NUMBER_OF_VERIFIED_ADDRESSES_PAPER = 5;

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
  @observable walletRestoreMeta: void | PaperWalletRestoreMeta;

  @observable mode: void | RestoreModeType;

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
    actions.setMode.listen(mode =>
      runInAction(() => {
        this.mode = mode;
      })
    );
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
  _processRestoreMeta: PaperWalletRestoreMeta => Promise<void> = async restoreMeta => {
    this.walletRestoreMeta = restoreMeta;

    let resolvedRecoveryPhrase = restoreMeta.recoveryPhrase;

    if (this.mode === undefined) {
      throw new Error(`${nameof(this._processRestoreMeta)} ${nameof(this.mode)} unset`);
    }
    const mode = this.mode;
    if (!mode.length) {
      throw new Error(
        `${nameof(AdaWalletRestoreStore)}::${nameof(this._processRestoreMeta)} missing length`
      );
    }
    const wordCount = mode.length;
    if (mode.extra === 'paper') {
      const [newPhrase] = unscramblePaperAdaMnemonic(
        restoreMeta.recoveryPhrase,
        wordCount,
        restoreMeta.paperPassword
      );
      if (newPhrase == null) {
        throw new Error(`
          ${nameof(
            this._processRestoreMeta
          )} Failed to restore a paper wallet! Invalid recovery phrase!
        `);
      }
      resolvedRecoveryPhrase = newPhrase;
    }

    const { selectedNetwork } = this.stores.profile;
    if (selectedNetwork == null)
      throw new Error(`${nameof(this._processRestoreMeta)} no network selected`);
    const plates = generatePlates(
      resolvedRecoveryPhrase,
      this.selectedAccount,
      mode,
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
      mode.type,
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
    this.mode = undefined;
    this.step = RestoreSteps.START;
    this.walletRestoreMeta = undefined;
    this.recoveryResult = undefined;
    this.selectedAccount = 0 + HARD_DERIVATION_START;
  }

  isValidMnemonic: ({|
    mnemonic: string,
    mode: RestoreModeType,
  |}) => boolean = request => {
    const { selectedNetwork } = this.stores.profile;
    if (selectedNetwork == null) throw new Error(`${nameof(this.isValidMnemonic)} no API selected`);
    const api = getApiForNetwork(selectedNetwork);
    return this.stores.substores[api].walletRestore.isValidMnemonic(request);
  };
}

export function generatePlates(
  recoveryPhrase: string,
  accountIndex: number,
  mode: RestoreModeType,
  network: $ReadOnly<NetworkRow>
): Array<PlateWithMeta> {
  if (mode == null) throw new Error(`${nameof(generatePlates)} restore mode unset`);
  const addressCount =
    mode.extra === 'paper' ? NUMBER_OF_VERIFIED_ADDRESSES_PAPER : NUMBER_OF_VERIFIED_ADDRESSES;

  const plates = [];

  const getCardanoKey = () => {
    return mode.extra === 'ledger'
      ? generateLedgerWalletRootKey(recoveryPhrase)
      : generateAdaWalletRootKey(recoveryPhrase);
  };

  const shouldShowShelleyPlate = (() => {
    return isCardanoHaskell(network) && mode.type === 'cip1852';
  })();

  if (shouldShowShelleyPlate) {
    const shelleyPlate = generateShelleyPlate(
      getCardanoKey(),
      accountIndex - HARD_DERIVATION_START,
      addressCount,
      Number.parseInt(network.BaseConfig[0].ChainNetworkId, 10)
    );
    plates.push({
      ...shelleyPlate,
      checksumTitle: messages.walletRestoreVerifyShelleyAccountIdLabel,
      addressMessage: messages.walletRestoreVerifyShelleyAddressesLabel,
    });
  }

  if (isErgo(network)) {
    const rootKey = generateErgoWalletRootKey(recoveryPhrase);
    const plate = generateErgoPlate(
      rootKey,
      accountIndex - HARD_DERIVATION_START,
      addressCount,
      ((Number.parseInt(network.BaseConfig[0].ChainNetworkId, 10): any): $Values<
        typeof RustModule.SigmaRust.NetworkPrefix
      >)
    );
    plates.push({
      ...plate,
      checksumTitle: messages.walletRestoreVerifyAccountIdLabel,
      addressMessage: messages.walletRestoreVerifyAddressesLabel,
    });
  }

  return plates;
}
