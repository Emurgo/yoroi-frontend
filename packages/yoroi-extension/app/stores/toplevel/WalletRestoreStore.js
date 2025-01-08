// @flow

import { action, observable, runInAction } from 'mobx';
import Store from '../base/Store';

import type { PlateResponse } from '../../api/ada/lib/cardanoCrypto/plate';
import { generateShelleyPlate } from '../../api/ada/lib/cardanoCrypto/plate';
import { CoinTypes, HARD_DERIVATION_START, WalletTypePurpose } from '../../config/numbersConfig';
import {
  generateWalletRootKey as cardanoGenerateWalletRootKey,
  generateWalletRootKey as generateAdaWalletRootKey,
} from '../../api/ada/lib/cardanoCrypto/cryptoWallet';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import type { $npm$ReactIntl$MessageDescriptor } from 'react-intl';
import { defineMessages } from 'react-intl';
import type { StoresMap } from '../index';
import AdaApi from '../../api/ada';
import type { WalletState } from '../../../chrome/extension/background/types';
import { bytesToHex } from '../../coreUtils';
import config from '../../config';

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
  TRANSFER_TX_GEN: 4,
});
export type RestoreStepsType = $Values<typeof RestoreSteps>;
export type PlateWithMeta = {|
  ...PlateResponse,
  checksumTitle: $Exact<$npm$ReactIntl$MessageDescriptor>,
  addressMessage: $Exact<$npm$ReactIntl$MessageDescriptor>,
|};

export async function isWalletExist(
  wallets: Array<WalletState>,
  recoveryPhrase: string,
  accountIndex: number,
  selectedNetwork: $ReadOnly<NetworkRow>
): Promise<WalletState | void> {
  const rootPk = cardanoGenerateWalletRootKey(recoveryPhrase);
  const accountPublicKey = rootPk
    .derive(WalletTypePurpose.CIP1852)
    .derive(CoinTypes.CARDANO)
    .derive(accountIndex)
    .to_public();
  const publicKey = bytesToHex(accountPublicKey.as_bytes());

  for (const wallet of wallets) {
    const existedPublicKey = wallet.publicKey;
    const walletNetworkId = wallet.networkId
    /**
     * We will still allow to restore the wallet on a different networks even they are
     * sharing the same recovery phrase but we are treating them differently
     */
    if (
      publicKey === existedPublicKey &&
      walletNetworkId === selectedNetwork.NetworkId
    ) {
      return wallet;
    }
  }
}

// <TODO:PENDING_REMOVAL> BIP44 , PAPER
export type RestoreModeType =
  | {|
  type: 'bip44',
  extra: void,
  length: typeof config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT,
|}
  | {|
  type: 'cip1852',
  extra: void,
  chain?: number,
  length:
    | typeof config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT
    | typeof config.wallets.DAEDALUS_SHELLEY_RECOVERY_PHRASE_WORD_COUNT,
|}
  | {|
  // note: we didn't allow paper wallet creation during the ITN
  // but we did allow paper wallet restoration
  type: 'bip44' | 'cip1852',
  extra: 'paper',
  length: typeof config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT,
  chain?: number,
|}
  | {|
  type: 'bip44' | 'cip1852',
  extra: 'ledger' | 'trezor',
|};

export type WalletRestoreMeta = {|
  recoveryPhrase: string,
  walletName: string,
  walletPassword: string,
|};

export default class AdaWalletRestoreStore extends Store<StoresMap> {
  @observable selectedAccount: number = 0 + HARD_DERIVATION_START;

  @observable step: RestoreStepsType;

  // only to handle the back button
  @observable walletRestoreMeta: void | WalletRestoreMeta;

  @observable recoveryResult: void | {|
    phrase: string,
    plates: Array<PlateWithMeta>,
  |};

  @observable duplicatedWallet: null | void | WalletState;

  setup(): void {
    super.setup();
    this.reset();
  }

  @action
  verifyMnemonic: void => Promise<void> = async () => {
    const { selectedNetwork } = this.stores.profile;
    if (selectedNetwork == null)
      throw new Error(`${nameof(this.submitWalletRestoringFields)} no network selected`);

    await this.stores.substores.ada.walletRestore.startWalletRestore();
  };

  @action
  submitWalletRestoringFields: WalletRestoreMeta => Promise<void> = async restoreMeta => {
    this.walletRestoreMeta = restoreMeta;

    const resolvedRecoveryPhrase = restoreMeta.recoveryPhrase;

    const { selectedNetwork } = this.stores.profile;
    if (selectedNetwork == null)
      throw new Error(`${nameof(this.submitWalletRestoringFields)} no network selected`);

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
    const wallets = this.stores.wallets.wallets;
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
  back: void => void = () => {
    if (this.step === RestoreSteps.VERIFY_MNEMONIC || this.step === RestoreSteps.WALLET_EXIST) {
      this.recoveryResult = undefined;
      this.step = RestoreSteps.START;
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
    mode: RestoreModeType,
  |}) => boolean = request => {
    return AdaApi.isValidMnemonic({
      mnemonic: request.mnemonic,
      // $FlowIgnore[prop-missing]
      numberOfWords: request.mode.length ?? 0,
    });
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
