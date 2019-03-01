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
    Logger.debug('hardwareWallet::createWallet called');

    // create ada wallet object for hardware wallet
    const [hardwareWallet] = createAdaHardwareWallet({ walletInitData });

    // create crypto account object for hardware wallet
    const { publicMasterKey } = walletInitData.cwHardwareInfo;
    const cryptoAccount = createHardwareWalletAccount(publicMasterKey);

    // Restore transactions and Save wallet + cryptoAccount to localstorage
    await restoreTransactionsAndSave(cryptoAccount, hardwareWallet);

    Logger.debug('hardwareWallet::createWallet success');
    return hardwareWallet;
  } catch (error) {
    Logger.error(`hardwareWallet::createWallet error: ${stringifyError(error)}`);
    throw error;
  }
}
