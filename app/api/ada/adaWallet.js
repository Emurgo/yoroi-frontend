// @flow
import _ from 'lodash';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import {
  Logger,
  stringifyError
} from '../../utils/logging';
import {
  generateWalletMasterKey,
  generateAdaMnemonic,
  isValidAdaMnemonic,
  updateWalletMasterKeyPassword,
} from './lib/cardanoCrypto/cryptoWallet';
import { toAdaWallet } from './lib/cardanoCrypto/cryptoToModel';
import {
  getAdaAddressesList,
  newAdaAddress
} from './adaAddress';
import { newCryptoAccount } from './adaAccount';
import type {
  AdaWallet,
  UpdateAdaWalletParams,
} from './adaTypes';
import type {
  AdaWalletParams,
  ChangeAdaWalletPassphraseParams,
  AdaWalletRecoveryPhraseResponse,
} from './index';
import {
  getUTXOsSumsForAddresses
} from './lib/yoroi-backend-api';
import type {
  SumForAddressesResult
} from './lib/yoroi-backend-api';
import { UpdateAdaWalletError, GetBalanceError } from './errors';
import { saveAdaWallet, getAdaWallet, getWalletMasterKey } from './adaLocalStorage';
import type { ConfigType } from '../../../config/config-types';

declare var CONFIG : ConfigType;
const addressesLimit = CONFIG.app.addressRequestSize;

/* Create and save a wallet with your master key, and a SINGLE account with one address */
export async function newAdaWallet({
  walletPassword,
  walletInitData
}: AdaWalletParams): Promise<AdaWallet> {
  const [adaWallet, masterKey] = createAdaWallet({ walletPassword, walletInitData });
  const cryptoAccount = newCryptoAccount(masterKey, walletPassword);
  await newAdaAddress(cryptoAccount, [], 'External');
  saveAdaWallet(adaWallet, masterKey);
  return Promise.resolve(adaWallet);
}

export const updateAdaWallet = async (
  { walletMeta }: UpdateAdaWalletParams
): Promise<?AdaWallet> => {
  const persistentWallet = getAdaWallet();
  if (!persistentWallet) return Promise.resolve();
  try {
    const updatedWallet = Object.assign({}, persistentWallet, { cwMeta: walletMeta });
    _saveAdaWalletKeepingMasterKey(updatedWallet);
    return updatedWallet;
  } catch (error) {
    Logger.error('adaWallet::updateAdaWallet error: ' + stringifyError(error));
    throw new UpdateAdaWalletError();
  }
};

export const updateAdaWalletBalance = async (): Promise<?BigNumber> => {
  const persistentWallet = getAdaWallet();
  if (!persistentWallet) return Promise.resolve();
  const adaAddresses = await getAdaAddressesList();
  const addresses = adaAddresses.map(address => address.cadId);
  // Update wallet balance
  try {
    const updatedWallet = Object.assign({}, persistentWallet, {
      cwAmount: {
        getCCoin: await getBalance(addresses)
      }
    });
    _saveAdaWalletKeepingMasterKey(updatedWallet);
    return updatedWallet.cwAmount.getCCoin;
  } catch (error) {
    Logger.error('adaWallet::updateAdaWalletBalance error: ' + stringifyError(error));
    throw new UpdateAdaWalletError();
  }
};

export function createAdaWallet({
  walletPassword,
  walletInitData
}: AdaWalletParams) {
  const adaWallet = toAdaWallet(walletInitData);
  const mnemonic = walletInitData.cwBackupPhrase.bpToList;
  const masterKey = generateWalletMasterKey(mnemonic, walletPassword);
  return [adaWallet, masterKey];
}

export const isValidMnemonic = (phrase: string, numberOfWords: ?number) => (
  isValidAdaMnemonic(phrase, numberOfWords)
);

export const getAdaAccountRecoveryPhrase = (): AdaWalletRecoveryPhraseResponse => (
  generateAdaMnemonic()
);

/** Call backend-service to get the balances of addresses and then sum them */
export async function getBalance(
  addresses: Array<string>
): Promise<BigNumber> {
  try {
    // batch all addresses into chunks for API
    const groupsOfAddresses = _.chunk(addresses, addressesLimit);
    const promises =
      groupsOfAddresses.map(groupOfAddresses => getUTXOsSumsForAddresses(groupOfAddresses));
    const partialAmounts: Array<SumForAddressesResult> = await Promise.all(promises);

    // sum all chunks together
    return partialAmounts.reduce(
      (acc: BigNumber, partialAmount) => (
        acc.plus(
          partialAmount.sum // null if no addresses in the batch has any balance in them
            ? new BigNumber(partialAmount.sum)
            : new BigNumber(0)
        )
      ),
      new BigNumber(0)
    );
  } catch (error) {
    Logger.error('adaWallet::getBalance error: ' + stringifyError(error));
    throw new GetBalanceError();
  }
}

export const changeAdaWalletPassphrase = (
  { oldPassword, newPassword }: ChangeAdaWalletPassphraseParams
): Promise<AdaWallet> => {
  const walletMasterKey = getWalletMasterKey();
  const updatedWalletMasterKey =
    updateWalletMasterKeyPassword(walletMasterKey, oldPassword, newPassword);
  const wallet = getAdaWallet();
  const updatedWallet = Object.assign(
    {},
    wallet ? wallet : {},
    { cwPassphraseLU: moment().format() }
  );
  saveAdaWallet(updatedWallet, updatedWalletMasterKey);
  return Promise.resolve(updatedWallet);
};

function _saveAdaWalletKeepingMasterKey(adaWallet: AdaWallet): void {
  const masterKey = getWalletMasterKey();
  saveAdaWallet(adaWallet, masterKey);
}
