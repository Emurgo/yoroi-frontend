// @flow
import blakejs from 'blakejs';
import { entropyToMnemonic, generateMnemonic } from 'bip39';
import {
  Logger,
  stringifyError,
} from '../../utils/logging';
import {
  GenericApiError,
} from '../common';
import { RustModule } from '../ada/lib/cardanoCrypto/rustLoader';

/* m / utility' / purpose' / header */
const MEMO_UTILITY_INDEX = 0x80000000 + 190822;
const ENCRYPTION_PURPOSE_INDEX = 0x80000000 + 1;
const SIGNING_PURPOSE_INDEX = 0x80000000 + 2;

export type getUtilityKeyRequest = {
  headerIndex: number
}
export type getUtilityKeyResponse = {
  key: RustModule.Wallet.PrivateKey
};
export type getUtilityKeyFunc = (
  request: getUtilityKeyRequest
) => Promise<getUtilityKeyResponse>;

export type setUtilityKeyRequest = {
  publicKey?: string
}
export type setUtilityKeyResponse = void;
export type setUtilityKeyFunc = (
  request: setUtilityKeyRequest
) => Promise<setUtilityKeyResponse>;

// Note: RustModule methods are exposed through RustModule.Wallet
// but that doesn't mean the methods are wallet-specific

export default class UtilityKeyApi {

  rootKey: RustModule.Wallet.PrivateKey;

  _setRootKeyFromPublicKey = async (
    publicKey: string
  ): Promise<setUtilityKeyResponse> => {
    try {
      const blakeHash = blakejs.blake2bHex(publicKey, null, 32);
      const mnemonicFromSeed = entropyToMnemonic(blakeHash);
      const entropy = RustModule.Wallet.Entropy.from_english_mnemonics(mnemonicFromSeed);
      this.rootKey = RustModule.Wallet.PrivateKey.new(entropy, '');
    } catch (error) {
      Logger.error('UtilityKeyApi::rootKeyFromPublicKey error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  };

  _setRootKeyFromRandom = async (): Promise<setUtilityKeyResponse> => {
    try {
      const randomMnemonic = generateMnemonic(160);
      const entropy = RustModule.Wallet.Entropy.from_english_mnemonics(randomMnemonic);
      this.rootKey = RustModule.Wallet.PrivateKey.new(entropy, '');
    } catch (error) {
      Logger.error('UtilityKeyApi::randomRootKey error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  };

  _getKey = async (
    utilityIndex: number,
    purposeIndex: number,
    headerIndex: number
  ): Promise<getUtilityKeyResponse> => {
    try {
      const key = await this.rootKey
        .derive(RustModule.Wallet.DerivationScheme.v2(), utilityIndex)
        .derive(RustModule.Wallet.DerivationScheme.v2(), purposeIndex)
        .derive(RustModule.Wallet.DerivationScheme.v2(), headerIndex);
      return { key };
    } catch (error) {
      Logger.error('UtilityKeyApi::_getKey error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  setRootKey = async (
    request: setUtilityKeyRequest
  ): Promise<setUtilityKeyResponse> => {
    if (request.publicKey !== undefined) {
      return this._setRootKeyFromPublicKey(request.publicKey);
    }
    return this._setRootKeyFromRandom();
  };

  getMemoEncryptionKey = async (
    request: getUtilityKeyRequest
  ): Promise<getUtilityKeyResponse> => {
    return this._getKey(
      MEMO_UTILITY_INDEX,
      ENCRYPTION_PURPOSE_INDEX,
      request.headerIndex
    );
  }

  getMemoSigningKey = async (
    request: getUtilityKeyRequest
  ): Promise<getUtilityKeyResponse> => {
    return this._getKey(
      MEMO_UTILITY_INDEX,
      SIGNING_PURPOSE_INDEX,
      request.headerIndex
    );
  }
}
