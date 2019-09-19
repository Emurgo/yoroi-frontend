// @flow

// Handle restoring wallets that follow the v2 addressing scheme (bip44)

import _ from 'lodash';
import {
  discoverAllAddressesFrom,
  generateAddressBatch
} from './lib/adaAddressProcessing';
import type {
  AddressType,
  AdaWallet,
} from './adaTypes';
import type { ConfigType } from '../../../config/config-types';
import type { FilterFunc } from './lib/state-fetch/types';
import type {
  SaveAsAdaAddressesFunc,
} from './lib/storage/types';

import { RustModule } from './lib/cardanoCrypto/rustLoader';

declare var CONFIG: ConfigType;
const addressScanSize = CONFIG.app.addressScanSize;
const addressRequestSize = CONFIG.app.addressRequestSize;

/** Restore transaction and address history */
export async function restoreBip44Wallet(
  accountPublicKey: RustModule.Wallet.Bip44AccountPublic,
  accountIndex: number,
  adaWallet: AdaWallet,
  masterKey?: string,
  checkAddressesInUse: FilterFunc,
  saveAsAdaAddresses: SaveAsAdaAddressesFunc,
): Promise<void> {
  /**
   * If the user has no internet connection and scanning fails,
   * we need to initialize our wallets with the bip44 gap size directly
   *
   * Otherwise the generated addresses won't be added to the wallet at all.
   * This would violate our bip44 obligation to maintain a unused address gap
   *
   * Example:
   * If we throw, no new addresses will be added
   * so the user's balance would be stuck at 0 until they reinstall Yoroi.
   */
  await saveInitialAddresses(accountPublicKey, accountIndex, 'External', saveAsAdaAddresses);
  await saveInitialAddresses(accountPublicKey, accountIndex, 'Internal', saveAsAdaAddresses);

  await scanAndSaveAddresses(accountPublicKey, accountIndex, 'External', -1, checkAddressesInUse, saveAsAdaAddresses);
  await scanAndSaveAddresses(accountPublicKey, accountIndex, 'Internal', -1, checkAddressesInUse, saveAsAdaAddresses);
}

async function saveInitialAddresses(
  accountPublicKey: RustModule.Wallet.Bip44AccountPublic,
  accountIndex: number,
  addressType: AddressType,
  saveAsAdaAddresses: SaveAsAdaAddressesFunc,
) {
  const addressesIndex = _.range(
    0,
    addressScanSize
  );

  const initialAddresses = generateAddressBatch(
    addressesIndex,
    accountPublicKey,
    addressType
  );

  await saveAsAdaAddresses({
    accountIndex,
    addresses: initialAddresses,
    offset: 0,
    addressType
  });
}

/**
 * Find new addresses beyond last known used address
 * @param {*} startIndex optimize by only scanning addresses we know aren't used
 */
export async function scanAndSaveAddresses(
  accountPublicKey: RustModule.Wallet.Bip44AccountPublic,
  accountIndex: number,
  addressType: AddressType,
  startIndex: number,
  checkAddressesInUse: FilterFunc,
  saveAsAdaAddresses: SaveAsAdaAddressesFunc,
): Promise<void> {
  const addressesToSave = await discoverAllAddressesFrom(
    accountPublicKey,
    addressType,
    startIndex,
    addressScanSize,
    addressRequestSize,
    checkAddressesInUse,
  );

  // Save all addresses in local DB
  if (addressesToSave.length !== 0) {
    await saveAsAdaAddresses({
      accountIndex,
      addresses: addressesToSave,
      offset: startIndex + 1,
      addressType
    });
  }
}
