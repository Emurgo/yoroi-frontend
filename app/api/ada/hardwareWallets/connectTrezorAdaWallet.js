// @flow

// Handles Connecting Trezor with Yoroi that follow the v2 addressing scheme (bip44)

import {
  discoverAllAddressesFrom
} from '../lib/adaAddressProcessing';
import {
  saveAsAdaAddresses,
  newAdaAddress
} from '../adaAddress';
import type {
  AdaWallet,
  AdaHardwareWalletParams
} from '../adaTypes';
import {
  Logger,
  stringifyError
} from '../../../utils/logging';
import { saveCryptoAccount, saveAdaWallet } from '../adaLocalStorage';
import { createAdaHardwareWallet } from '../adaWallet';
import { createHardwareWalletAccount } from '../adaAccount';
import type { ConfigType } from '../../../../config/config-types';

declare var CONFIG: ConfigType;
const addressScanSize = CONFIG.app.addressScanSize;
const addressRequestSize = CONFIG.app.addressRequestSize;

/** Creates and stores(into local storage) a new/empty AdaWallet and CryptoAccount
 * Fetches all related addresses
 * Caches the fetched address results locally (into lovefieldDatabase)
 * @returns a new AdaWallet
 */
export async function connectTrezorAdaWallet({
  walletInitData
}: AdaHardwareWalletParams): Promise<AdaWallet> {
  try {
    Logger.debug('connectTrezorAdaWallet::connectTrezorAdaWallet called');

    // create ada wallet object for hardware wallet
    const [adaWallet] = createAdaHardwareWallet({ walletInitData });
    // create crypto account object for hardware wallet
    // eslint-disable-next-line max-len
    const cryptoAccount = createHardwareWalletAccount(walletInitData.cwHardwareInfo.publicMasterKey);

    // fetch all External addresses
    const externalAddressesToSave =
      await discoverAllAddressesFrom(cryptoAccount, 'External', -1, addressScanSize, addressRequestSize);

    // fetch all Internal addresses
    const internalAddressesToSave =
      await discoverAllAddressesFrom(cryptoAccount, 'Internal', -1, addressScanSize, addressRequestSize);

    // store wallet related addresses to lovefieldDatabase
    if (externalAddressesToSave.length !== 0 || internalAddressesToSave.length !== 0) {
      await Promise.all([
        saveAsAdaAddresses(cryptoAccount, externalAddressesToSave, 'External'),
        saveAsAdaAddresses(cryptoAccount, internalAddressesToSave, 'Internal')
      ]);
    } else {
      // no related addresses found, give it a new address and save it to lovefieldDatabase
      await newAdaAddress(cryptoAccount, [], 'External');
    }

    // save crypto account to the local storage
    saveCryptoAccount(cryptoAccount);

    // save ada wallet to the local storage
    saveAdaWallet(adaWallet);

    Logger.debug('connectTrezorAdaWallet::connectTrezorAdaWallet success');
    return adaWallet;
  } catch (error) {
    Logger.error(`connectTrezorAdaWallet::connectTrezorAdaWallet error: ${stringifyError(error)}`);
    throw error;
  }
}
