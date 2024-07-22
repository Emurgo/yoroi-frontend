// @flow
import type { WalletChecksum } from '@emurgo/cip4-js';
import type {
  BaseSingleAddressPath,
  IGetAllUtxosResponse,
  IGetAllUtxoAddressesResponse,
  Addressing,
} from '../../../app/api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { LastSyncInfoRow, } from '../../../app/api/ada/lib/storage/database/walletTypes/core/tables';
import type { CoreAddressT } from '../../../app/api/ada/lib/storage/database/primitives/enums';
import type { AssuranceMode } from '../../../app/types/transactionAssurance.types';
import type { MultiToken } from '../../../app/api/common/lib/MultiToken';
import type { FullAddressPayload, AddressRowWithPath } from '../../../app/api/ada/lib/storage/bridge/traitUtils';
import type { PersistedSubmittedTransaction } from '../../../app/api/localStorage';

export type WalletType = 'trezor' | 'ledger' | 'mnemonic';

// Note: this is actually mapping from CoreAddressT to Array<AddressType>, but the values of
// CoreAddressT are integers 0 ~ 4 so we use an array here.
type AddressesByType = Array<Array<FullAddressPayload>>;

export type WalletState = {|
  publicDeriverId: number,
  conceptualWalletId: number,
  utxos: IGetAllUtxosResponse,
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
  publicDeriverLevel: number,
  lastSyncInfo: $ReadOnly<LastSyncInfoRow>,
  balance: MultiToken,
  assetDeposits: MultiToken,
  defaultTokenId: string,
  assuranceMode: AssuranceMode,
  // todo: probably consolidate all these "addresses" properties
  allAddressesByType: AddressesByType,
  foreignAddresses: Array<{| address: string, type: CoreAddressT |}>,
  externalAddressesByType: AddressesByType,
  internalAddressesByType: AddressesByType,
  allAddresses: {|
    utxoAddresses: Array<$ReadOnly<AddressRowWithPath>>,
    accountingAddresses: Array<$ReadOnly<AddressRowWithPath>>,
  |},
  // todo: this probably is redundent with the above
  allUtxoAddresses: IGetAllUtxoAddressesResponse,
  isBip44Wallet: boolean, // Byron wallet if true, probably no longer needed
  isTestnet: boolean,
  isCardanoHaskell: boolean,
  isRefreshing: boolean,
  submittedTransactions: Array<PersistedSubmittedTransaction>,
|};

export type ServerStatus = {|
  networkId: number,
  isServerOk: boolean,
  isMaintenance: boolean,
  clockSkew: number,
  lastUpdateTimestamp: number,
|};
