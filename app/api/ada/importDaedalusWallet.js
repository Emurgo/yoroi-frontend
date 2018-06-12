// @flow
import {
  RandomAddressChecker
} from 'rust-cardano-crypto';

export function importDaedalusWallet(
  secretWords: string,
  receiverAddress: string,
  allAddresses: Array<string>
): void {
  const checker = RandomAddressChecker.newCheckerFromMnemonics(secretWords).result;
  const walletAddresses = RandomAddressChecker.checkAddresses(checker, allAddresses).result;
  console.log('[importDaedalusWallet] Daedalues wallet addresses:', walletAddresses);
  /*
    TODO: Generate a tx from all funds to the new address.
    Obs: Current method "newAdaTransaction" doesn't apply for doing this task.
  */
}
