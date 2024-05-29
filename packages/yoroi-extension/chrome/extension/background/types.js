// @flow
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { BaseSingleAddressPath } from '../../../app/api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { Addressing } from '../../../app/api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { LastSyncInfoRow, } from '../../../app/api/ada/lib/storage/database/walletTypes/core/tables';
import type { CoreAddressT } from '../../../app/api/ada/lib/storage/database/primitives/enums';
import type { IHasUtxoChainsRequest } from '../../../app/api/ada/lib/storage/models/PublicDeriver/interfaces.js';
import type { AssuranceMode } from '../../../app/types/transactionAssurance.types';
import type { MultiToken } from '../../../app/api/common/lib/MultiToken';

export type WalletType = 'trezor' | 'ledger' | 'mnemonic';

// Note: this is actually mapping from CoreAddressT to Array<AddressType>, but the values of
// CoreAddressT are integers 0 ~ 4 so we use an array here.
type AddressesByType = Array<Array<FullAddressPayload>>;

export type WalletState = {|
  publicDeriverId: number,
  conceptualWalletId: number,
  utxos: Array<any>, // fixme
  transactions: Array<any>,
  networkId: number,
  name: string,
  type: WalletType,
  hardwareWalletDeviceId: ?string,
  plate: WalletChecksum,
  publicKey: string,
  receiveAddress: BaseSingleAddressPath,
  pathToPublic: Array<number>,
  signingKeyUpdateDate: ?string,
  stakingAddressing: Addressing,
  stakingAddress: string,
  stakingKey: string,
  publicDeriverLevel: number,
  lastSyncInfo: $ReadOnly<LastSyncInfoRow>,
  balance: MultiToken,
  defaultTokenId: string,
  assuranceMode: AssuranceMode,
  allAddressesByType: AddressesByType,
  foreignAddresses: Array<{| address: string, type: CoreAddressT |}>,
  externalAddressesByType: AddressesByType,
  internalAddressesByType: AddressesByType,
|};
