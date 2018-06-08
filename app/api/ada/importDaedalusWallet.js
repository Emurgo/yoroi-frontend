// @flow
import {
  HdWallet,
  RandomAddressChecker
} from 'cardano-crypto';
import {
  generateDaedalusSeed
} from './lib/crypto-wallet';

export function importDaedalusWallet(
  secretWords: string,
  receiverAddress: string,
  allAddresses: Array<string>
): void {
  const seed = generateDaedalusSeed(secretWords);
  const xprvArray = HdWallet.fromSeed(seed);
  const xprv = _toHexString(xprvArray);
  const checker = RandomAddressChecker.newChecker(xprv).result;
  const walletAddresses = RandomAddressChecker.checkAddresses(checker, allAddresses);
  console.log('[importDaedalusWallet] Daedalues wallet addresses:', walletAddresses);
  /*
    TODO: Generate a tx from all funds to the new address.
    Obs: Current method "newAdaTransaction" doesn't apply for doing this task.
  */
}

function _toHexString(byteArray) {
  return Array.from(byteArray, (byte) => (
    '0' + (byte & 0xFF).toString(16)).slice(-2)
  ).join('');
}
