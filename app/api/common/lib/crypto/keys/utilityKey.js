// @flow
import blakejs from 'blakejs';
import { encryptWithPassword, decryptWithPassword } from '../../../../../utils/passwordCipher';
import { RustModule } from '../../../../ada/lib/cardanoCrypto/rustLoader';

/* m / utility' / purpose' / header */
const MEMO_UTILITY_INDEX = 0x80000000 + 190822;
const ENCRYPTION_PURPOSE_INDEX = 0x80000000 + 1;
const SIGNING_PURPOSE_INDEX = 0x80000000 + 2;

export type GetUtilityKeyRequest = {|
  rootKey: RustModule.WalletV4.Bip32PrivateKey,
  headerIndex: number
|}
export type GetUtilityKeyResponse = {|
  key: RustModule.WalletV4.Bip32PrivateKey
|};
export type GetUtilityKeyFunc = (
  request: GetUtilityKeyRequest
) => Promise<GetUtilityKeyResponse>;

export type GenRootUtilityKeyRequest = {|
  // note: doesn't matter the type of the key passed in since it gets hashed anyway
  publicKey: string
|}
export type GenRootUtilityKeyResponse = RustModule.WalletV4.Bip32PrivateKey;
export type GenRootUtilityKeyFunc = (
  request: GenRootUtilityKeyRequest
) => GenRootUtilityKeyResponse;

export type EncryptMemoMessageRequest = {|
  rootKey: RustModule.WalletV4.Bip32PrivateKey,
  content: string,
  headerIndex: number
|}
export type EncryptMemoMessageResponse = {|
  content: string
|}
export type EncryptMemoMessageFunc = (
  request: EncryptMemoMessageRequest
) => Promise<EncryptMemoMessageResponse>;

export type DecryptMemoMessageRequest = {|
  rootKey: RustModule.WalletV4.Bip32PrivateKey,
  content: string,
  headerIndex: number
|}
export type DecryptMemoMessageResponse = {|
  content: string
|}
export type DecryptMemoMessageFunc = (
  request: DecryptMemoMessageRequest
) => Promise<DecryptMemoMessageResponse>;

export const genRootKeyFromPublicKey: GenRootUtilityKeyFunc = (
  request
) => {
  const blakeHash = blakejs.blake2bHex(Buffer.from(request.publicKey, 'hex'), null, 32);
  const EMPTY_PASSWORD = Buffer.from('');
  const rootKey = RustModule.WalletV4.Bip32PrivateKey.from_bip39_entropy(
    blakeHash,
    EMPTY_PASSWORD
  );
  return rootKey;
}

const _getKey: {|
  rootKey: RustModule.WalletV4.Bip32PrivateKey,
  utilityIndex: number,
  purposeIndex: number,
  headerIndex: number,
|} => GetUtilityKeyResponse = (
  request,
) => {
  return {
    key: request.rootKey
      .derive(request.utilityIndex)
      .derive(request.purposeIndex)
      .derive(request.headerIndex)
  };
}

const _getMemoEncryptionKey: GetUtilityKeyFunc = async (
  request
) => {
  return _getKey({
    rootKey: request.rootKey,
    utilityIndex: MEMO_UTILITY_INDEX,
    purposeIndex: ENCRYPTION_PURPOSE_INDEX,
    headerIndex: request.headerIndex
  });
}

// eslint-next-disable-line no-unused-vars
const _getMemoSigningKey: GetUtilityKeyFunc = async (
  request
) => {
  return _getKey({
    rootKey: request.rootKey,
    utilityIndex: MEMO_UTILITY_INDEX,
    purposeIndex: SIGNING_PURPOSE_INDEX,
    headerIndex: request.headerIndex
  });
}

export const encryptMemoMessage: EncryptMemoMessageFunc = async (
  request
) => {
  // Get key and use its hash as a password
  const encryptionKey = await _getMemoEncryptionKey({
    rootKey: request.rootKey,
    headerIndex: request.headerIndex,
  });
  const password = blakejs.blake2bHex(Buffer.from(encryptionKey.key.as_bytes()), null, 16);
  const encodedMessage = Buffer.from(request.content);
  const encryptedHex = encryptWithPassword(password, encodedMessage);
  return {
    content: encryptedHex
  };
}

export const decryptMemoMessage: DecryptMemoMessageFunc = async (
  request
) => {
  // Get key and use its hash as a password
  const encryptionKey = await _getMemoEncryptionKey({
    rootKey: request.rootKey,
    headerIndex: request.headerIndex,
  });
  const password = blakejs.blake2bHex(Buffer.from(encryptionKey.key.as_bytes()), null, 16);
  const decryptedHex = decryptWithPassword(password, request.content);
  const decryptedMessage = Buffer.from(decryptedHex).toString();
  return {
    content: decryptedMessage
  };
}