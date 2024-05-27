// @flow
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { BaseSingleAddressPath } from '../../../app/api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { Addressing } from '../../../app/api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { LastSyncInfoRow, } from '../../../app/api/ada/lib/storage/database/walletTypes/core/tables';
import type { CoreAddressT } from '../../../app/api/ada/lib/storage/database/primitives/enums';
import type { IHasUtxoChainsRequest } from '../../../app/api/ada/lib/storage/models/PublicDeriver/interfaces.js';
export type WalletType = 'trezor' | 'ledger' | 'mnemonic';

export type WalletState = {|
  publicDeriverId: number,
  conceptualWalletId: number,
/*
  const withUtxos = asGetAllUtxos(publicDeriver);
  if (withUtxos == null) {
    return publicDeriver.getParent().getDefaultMultiToken();
  }
  const basePubDeriver = withUtxos;

  // TODO: need to also deal with pointer address summing
  // can get most recent pointer from getCurrentDelegation result

  const stakingKey = unwrapStakingKey(stakingAddress);
  const allUtxo = await basePubDeriver.getAllUtxos();
*/
  utxos: Array<any>, // fixme
  transactions: Array<any>,
  networkId: number,
  name: string,
  type: WalletType,
  // request.publicDeriver.getParent().hardwareInfo?.DeviceId
  hardwareWalletDeviceId: ?string,
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
//AdaDelegationTransactionStore.js
  stakingAddressing: Addressing,
  stakingAddress: string,
  stakingKey: string,
  //publicDeriver.getParent().getPublicDeriverLevel(),
  publicDeriverLevel: number,
  // ?? need?
  lastSyncInfo: $ReadOnly<LastSyncInfoRow>,
  balance: MultiToken,
  defaultTokenId: string,
  // delegation store stuff

  //import type { AssuranceMode, } from '../../types/transactionAssurance.types';
  assuranceMode: AssuranceMode,
/*
    const allAddresses = await this.api.ada.getAllAddressesForDisplay({
      publicDeriver,
      type: CoreAddressTypes.CARDANO_BASE,
    });
*/
  allAddresses: Map<CoreAddressT, Array<any>>,
  foreignAddresses: Array<any>,
  chainAddresses: Map<IHasUtxoChainsRequest, Map<CoreAddressT, Array<any>>>,
|};
