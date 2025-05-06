import type { WalletChecksum } from '@emurgo/cip4-js';
import type { MultiToken } from '../../../api/common/lib/MultiToken';
import type {
  IGetAllUtxosResponse,
  IGetAllUtxoAddressesResponse,
  BaseSingleAddressPath,
  Addressing,
} from '../../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { LastSyncInfoRow } from '../../../api/ada/lib/storage/database/walletTypes/core/tables';
import type { CoreAddressT } from '../../../api/ada/lib/storage/database/primitives/enums';
import type { AssuranceMode } from '../../../types/transactionAssurance.types';
import type { FullAddressPayload, AddressRowWithPath } from '../../../api/ada/lib/storage/bridge/traitUtils';
import type { PersistedSubmittedTransaction } from '../../../api/localStorage';

export type WalletType = 'trezor' | 'ledger' | 'mnemonic';

// Note: this is actually mapping from CoreAddressT to Array<AddressType>, but the values of
// CoreAddressT are integers 0 ~ 4 so we use an array here.
type AddressesByType = Array<Array<FullAddressPayload>>;

export interface WalletStateType {
  publicDeriverId: number;
  conceptualWalletId: number;
  utxos: IGetAllUtxosResponse;
  transactions: Array<any>;
  networkId: number;
  name: string;
  type: WalletType;
  isHardware: boolean;
  hardwareWalletDeviceId: string | null;
  plate: WalletChecksum;
  publicKey: string;
  receiveAddress: BaseSingleAddressPath;
  pathToPublic: Array<number>;
  signingKeyUpdateDate: string | null;
  stakingAddressing: Addressing;
  stakingAddress: string;
  publicDeriverLevel: number;
  lastSyncInfo: Readonly<LastSyncInfoRow>;
  balance: MultiToken;
  assetDeposits: MultiToken;
  defaultTokenId: string;
  assuranceMode: AssuranceMode;
  allAddressesByType: AddressesByType;
  foreignAddresses: Array<{ address: string; type: CoreAddressT }>;
  externalAddressesByType: AddressesByType;
  internalAddressesByType: AddressesByType;
  allAddresses: {
    utxoAddresses: Array<Readonly<AddressRowWithPath>>;
    accountingAddresses: Array<Readonly<AddressRowWithPath>>;
  };
  allUtxoAddresses: IGetAllUtxoAddressesResponse;
  isBip44Wallet: boolean;
  isTestnet: boolean;
  isCardanoHaskell: boolean;
  isRefreshing: boolean;
  submittedTransactions: Array<PersistedSubmittedTransaction>;
}

export interface WhitelistEntryType {
  url: string;
  publicDeriverId: number;
  appAuthID: string | null;
  auth: WalletAuthEntryType | null;
  image: string;
}

export interface WalletAuthEntryType {
  walletId: string;
  pubkey: string;
  privkey: string;
}
