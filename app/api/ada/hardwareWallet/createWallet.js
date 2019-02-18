// @flow

// Handles Connecting Trezor with Yoroi that follow the v2 addressing scheme (bip44)

import {
  restoreTransactionsAndSave
} from '../restoreAdaWallet';
import type {
  AdaWallet,
  AdaHardwareWalletParams
} from '../adaTypes';
import {
  Logger,
  stringifyError
} from '../../../utils/logging';
import { createAdaHardwareWallet } from '../adaWallet';
import { createHardwareWalletAccount } from '../adaAccount';

/** Creates and stores(into local storage) a new/empty AdaWallet and CryptoAccount
 * Fetches all related addresses
 * Caches the fetched address results locally (into lovefieldDatabase)
 * @returns a new AdaWallet
 */
export async function createWallet({
  walletInitData
}: AdaHardwareWalletParams): Promise<AdaWallet> {
  try {
    Logger.debug('createTrezorWallet::createTrezorWallet called');

    // create ada wallet object for hardware wallet
    const [adaWallet] = createAdaHardwareWallet({ walletInitData });
    // create crypto account object for hardware wallet
    // eslint-disable-next-line max-len
    const cryptoAccount = createHardwareWalletAccount(walletInitData.cwHardwareInfo.publicMasterKey);

    // Restore transactions and Save wallet + cryptoAccount to localstorage
    await restoreTransactionsAndSave(cryptoAccount, adaWallet);

    Logger.debug('createTrezorWallet::createTrezorWallet success');
    return adaWallet;
  } catch (error) {
    Logger.error(`createTrezorWallet::createTrezorWallet error: ${stringifyError(error)}`);
    throw error;
  }
}
