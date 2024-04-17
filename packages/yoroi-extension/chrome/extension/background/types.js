// @flow
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { BaseSingleAddressPath } from '../../../app/api/ada/lib/storage/models/PublicDeriver/interfaces'

export type WalletType = 'trezor' | 'ledger' | 'mnemonic';

export type WalletState = {|
  publicDeriverId: number,
  conceptualWalletId: number,
  utxos: Array<any>, // fixme
  transactions: Array<any>,
  networkId: number,
  name: string,
  type: WalletType,
  // cache
  plate: WalletChecksum,
  publicKey: string,
/*
  app/stores/stateless/addressStores.js getReceiveAddress
      const anAddressFormatted = addressToDisplayString(
        receiveAddress.addr.Hash,
        parent.getNetworkInfo()
      );
*/
  receiveAddress: BaseSingleAddressPath,
/*
    const withPublicKey = asGetPublicKey(selected);
    if (withPublicKey == null) {
      return null;
    }
    withPublicKey.pathToPublic
*/
  pathToPublic: Array<number>,
/*
              this.props.stores.wallets.getSigningKeyCache(withSigning).signingKeyUpdateDate
*/
  signingKeyUpdateDate: string,
|};
