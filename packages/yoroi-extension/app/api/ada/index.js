// @flow
import BigNumber from 'bignumber.js';
import type { lf$Database } from 'lovefield';
import { fullErrStr, Logger, stringifyData, stringifyError } from '../../utils/logging';
import CardanoByronTransaction from '../../domain/CardanoByronTransaction';
import CardanoShelleyTransaction from '../../domain/CardanoShelleyTransaction';
import { ChainDerivations, CoinTypes, HARD_DERIVATION_START, WalletTypePurpose, } from '../../config/numbersConfig';
import { createHardwareCip1852Wallet, createStandardCip1852Wallet, } from './lib/storage/bridge/walletBuilder/shelley';
import {
  getAllTransactions,
  getForeignAddresses,
  getPendingTransactions,
  updateTransactions,
  updateUtxos,
} from './lib/storage/bridge/updateTransactions';
import {
  addrContainsAccountKey,
  createCertificate,
  filterAddressesByStakingKey,
} from './lib/storage/bridge/delegationUtils';

import type { TransactionMetadata } from './lib/storage/bridge/metadataUtils';
import { createMetadata } from './lib/storage/bridge/metadataUtils';

import { Cip1852Wallet, } from './lib/storage/models/Cip1852Wallet/wrapper';
import type { HWFeatures, } from './lib/storage/database/walletTypes/core/tables';
import { Bip44DerivationLevels, flattenInsertTree, } from './lib/storage/database/walletTypes/bip44/api/utils';
import type { CoreAddressT } from './lib/storage/database/primitives/enums';
import { CoreAddressTypes, } from './lib/storage/database/primitives/enums';
import type { NetworkRow, TokenRow, } from './lib/storage/database/primitives/tables';
import { TransactionType } from './lib/storage/database/primitives/tables';
import { PublicDeriver, } from './lib/storage/models/PublicDeriver/index';
import {
  asDisplayCutoff,
  asGetAllUtxos,
  asHasUtxoChains,
} from './lib/storage/models/PublicDeriver/traits';
import { ConceptualWallet } from './lib/storage/models/ConceptualWallet/index';
import type { IHasLevels } from './lib/storage/models/ConceptualWallet/interfaces';
import type {
  Address,
  Addressing,
  AddressType,
  IDisplayCutoff,
  IGetAllUtxosResponse,
  IGetSigningKey,
  IGetStakingKey,
  IHasUtxoChains,
  IHasUtxoChainsRequest,
  IPublicDeriver,
  UsedStatus,
  Value,
  BaseSingleAddressPath,
  IGetAllUtxoAddressesResponse,
} from './lib/storage/models/PublicDeriver/interfaces';
import type {
  BaseGetTransactionsRequest,
  GetForeignAddressesRequest,
  GetForeignAddressesResponse,
  RefreshPendingTransactionsRequest,
  RefreshPendingTransactionsResponse,
  RemoveAllTransactionsRequest,
  RemoveAllTransactionsResponse,
} from '../common/index';
import { builtSendTokenList, hasSendAllDefault } from '../common/index';
import type { TxOutput } from './transactions/shelley/transactions';
import {
  newAdaUnsignedTx as shelleyNewAdaUnsignedTx,
  newAdaUnsignedTxForConnector as shelleyNewAdaUnsignedTxForConnector,
  sendAllUnsignedTx as shelleySendAllUnsignedTx,
  signTransaction as shelleySignTransaction,
} from './transactions/shelley/transactions';
import { generateAdaMnemonic, generateWalletRootKey, } from './lib/cardanoCrypto/cryptoWallet';
import { v4PublicToV2, } from './lib/cardanoCrypto/utils';
import { isValidBip39Mnemonic, } from './lib/cardanoCrypto/wallet';
import type { CardanoSignTransaction } from 'trezor-connect-flow';
import { createTrezorSignTxPayload, } from './transactions/shelley/trezorTx';
import { createLedgerSignTxPayload, } from './transactions/shelley/ledgerTx';
import {
  GenericApiError,
  IncorrectWalletPasswordError,
  InvalidWitnessError,
  NotEnoughMoneyToSendError,
  RewardAddressEmptyError,
  WalletAlreadyRestoredError,
} from '../common/errors';
import LocalizableError from '../../i18n/LocalizableError';
import { scanBip44Account, } from '../common/lib/restoration/bip44';
import { v2genAddressBatchFunc, } from './restoration/byron/scan';
import type {
  CardanoAddressedUtxo,
  CardanoUtxoScriptWitness,
  V4UnsignedTxAddressedUtxoResponse,
} from './transactions/types';
import type {
  LedgerNanoCatalystRegistrationTxSignData,
  TrezorTCatalystRegistrationTxSignData,
} from './transactions/shelley/HaskellShelleyTxSignRequest';
import { HaskellShelleyTxSignRequest, } from './transactions/shelley/HaskellShelleyTxSignRequest';
import type { SignTransactionRequest } from '@cardano-foundation/ledgerjs-hw-app-cardano';
import { WrongPassphraseError } from './lib/cardanoCrypto/cryptoErrors';

import type {
  AccountStateFunc,
  AddressUtxoFunc,
  BestBlockFunc,
  FilterFunc,
  GetRecentTransactionHashesFunc,
  GetTransactionsByHashesFunc,
  HistoryFunc,
  MultiAssetMintMetadataFunc,
  MultiAssetSupplyFunc,
  RemoteUnspentOutput,
  SendFunc,
  SignedRequest,
  SignedResponse,
  TokenInfoFunc,
} from './lib/state-fetch/types';
import { getChainAddressesForDisplay, } from './lib/storage/models/utils';
import {
  getAllAddressesForDisplay,
  getAllAddressesForWallet,
} from './lib/storage/bridge/traitUtils';
import type {
  AddressRowWithPath,
} from './lib/storage/bridge/traitUtils';
import {
  asAddressedUtxo,
  cardanoMinAdaRequiredFromAssets_coinsPerWord,
  convertAdaTransactionsToExportRows,
  multiTokenFromCardanoValue,
  multiTokenFromRemote,
} from './transactions/utils';
import type { TransactionExportRow } from '../export';

import { RustModule } from './lib/cardanoCrypto/rustLoader';
import type {
  CreateWalletRequest,
  CreateWalletResponse,
  IsValidMnemonicRequest,
  IsValidMnemonicResponse,
  RestoreWalletRequest,
  RestoreWalletResponse,
  SendTokenList,
} from '../common/types';
import {
  getCardanoHaskellBaseConfig,
  getNetworkById,
} from './lib/storage/database/prepackaged/networks';
import { toSenderUtxos, } from './transactions/transfer/utils';
import type { DefaultTokenEntry } from '../common/lib/MultiToken';
import { MultiToken } from '../common/lib/MultiToken';
import { getReceiveAddress } from '../../stores/stateless/addressStores';
import { generateRegistrationMetadata } from './lib/cardanoCrypto/catalyst';
import { bytesToHex, hexToBytes, hexToUtf } from '../../coreUtils';
import type { PersistedSubmittedTransaction } from '../localStorage';
import type { ForeignUtxoFetcher } from '../../connector/stores/ConnectorStore';
import type WalletTransaction from '../../domain/WalletTransaction';
import { derivePrivateByAddressing, derivePublicByAddressing } from './lib/cardanoCrypto/deriveByAddressing';
import type { WalletState } from '../../../chrome/extension/background/types';
import TimeUtils from './lib/storage/bridge/timeUtils';
import { removeAllTransactions } from '../thunk';

// ADA specific Request / Response params

export type AddressDetails = {|
  ...Address, ...Value, ...Addressing, ...UsedStatus, ...AddressType,
|};

// getAllAddressesForDisplay

export type GetAllAddressesForDisplayRequest = {|
  publicDeriver: IPublicDeriver<>,
  type: CoreAddressT,
|};
export type GetAllAddressesForDisplayResponse = Array<AddressDetails>;
export type GetAllAddressesForDisplayFunc = (
  request: GetAllAddressesForDisplayRequest
) => Promise<GetAllAddressesForDisplayResponse>;

// getChainAddressesForDisplay

export type GetChainAddressesForDisplayRequest = {|
  publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels> & IHasUtxoChains & IDisplayCutoff,
  chainsRequest: IHasUtxoChainsRequest,
  type: CoreAddressT,
|};
export type GetChainAddressesForDisplayResponse = Array<AddressDetails>;
export type GetChainAddressesForDisplayFunc = (
  request: GetChainAddressesForDisplayRequest
) => Promise<GetChainAddressesForDisplayResponse>;

// refreshTransactions

export type AdaGetTransactionsRequest = {|
  checkAddressesInUse: FilterFunc,
  getBestBlock: BestBlockFunc,
  getTokenInfo: TokenInfoFunc,
  getMultiAssetMetadata: MultiAssetMintMetadataFunc,
  getMultiAssetSupply: MultiAssetSupplyFunc,
  afterTx?: ?WalletTransaction,
  getRecentTransactionHashes: GetRecentTransactionHashesFunc,
  getTransactionsByHashes: GetTransactionsByHashesFunc,
  getTransactionHistory: HistoryFunc,
|};

// signAndBroadcast

export type SignAndBroadcastRequest = {|
  publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels> & IGetSigningKey,
  signRequest: {
    senderUtxos: Array<CardanoAddressedUtxo>,
    +unsignedTx: RustModule.WalletV4.TransactionBuilder |
      RustModule.WalletV4.TransactionBody |
      Buffer |
      Uint8Array,
    metadata: void | RustModule.WalletV4.AuxiliaryData,
    +neededStakingKeyHashes: {
      wits: Set<string>, // Vkeywitness
      ...
    },
    ...
  },
  password: string,
  sendTx: SendFunc,
|};
export type SignAndBroadcastResponse = {| txId: string, signedTxHex: string |};
export type SignAndBroadcastFunc = (
  request: SignAndBroadcastRequest
) => Promise<SignAndBroadcastResponse>;

// createTrezorSignTxData

export type CreateTrezorSignTxDataRequest = {|
  signRequest: HaskellShelleyTxSignRequest,
  network: $ReadOnly<NetworkRow>,
|};
export type CreateTrezorSignTxDataResponse = {|
  // https://github.com/trezor/connect/blob/develop/docs/methods/cardanoSignTransaction.md
  trezorSignTxPayload: $Exact<CardanoSignTransaction>,
|};
export type CreateTrezorSignTxDataFunc = (
  request: CreateTrezorSignTxDataRequest
) => Promise<CreateTrezorSignTxDataResponse>;

// broadcastTrezorSignedTx

export type BroadcastTrezorSignedTxRequest = {|
  signedTxRequest: SignedRequest,
  sendTx: SendFunc,
|};
export type BroadcastTrezorSignedTxResponse = SignedResponse;
export type BroadcastTrezorSignedTxFunc = (
  request: BroadcastTrezorSignedTxRequest
) => Promise<BroadcastTrezorSignedTxResponse>;

// createLedgerSignTxData

export type CreateLedgerSignTxDataRequest = {|
  signRequest: HaskellShelleyTxSignRequest,
  network: $ReadOnly<NetworkRow>,
  addressingMap: string => (void | $PropertyType<Addressing, 'addressing'>),
  cip36: boolean,
|};
export type CreateLedgerSignTxDataResponse = {|
  ledgerSignTxPayload: SignTransactionRequest,
|};
export type CreateLedgerSignTxDataFunc = (
  request: CreateLedgerSignTxDataRequest
) => Promise<CreateLedgerSignTxDataResponse>;

// broadcastLedgerSignedTx

export type BroadcastLedgerSignedTxRequest = {|
  signedTxRequest: SignedRequest,
  sendTx: SendFunc,
|};
export type BroadcastLedgerSignedTxResponse = SignedResponse;
export type BroadcastLedgerSignedTxFunc = (
  request: BroadcastLedgerSignedTxRequest
) => Promise<BroadcastLedgerSignedTxResponse>;

// createUnsignedTx

export type CreateUnsignedTxRequest = {|
  publicDeriver: {
    networkId: number,
    utxos: IGetAllUtxosResponse,
    defaultTokenId: string,
    receiveAddress: BaseSingleAddressPath,
    ...
  },
  absSlotNumber: BigNumber,
  receiver: string,
  filter: ElementOf<IGetAllUtxosResponse> => boolean,
  tokens: SendTokenList,
  metadata: Array<TransactionMetadata> | void,
|};
export type CardanoTxRequestMintMetadata = {|
  tag: number | string, // the metadata tag, e.g. 721 for NFTs
  json: string, // JSON string with the metadata
|};
export type CardanoTxRequestMint = {|
  script: string, // the HEX of the policy script,
  storeScriptOnChain?: boolean, // whether to include the script into auxiliary data
  assetName: string, // HEX
  amount?: string, // default to 1 for NFTs
  // This metadata will be wrapped into { tag: { [policyId]: { [assetName]: json } } }
  metadata?: CardanoTxRequestMintMetadata,
|};
type CardanoTxRequestInput =
  string | // UTxO ID
  {|
    id: string, // UTxO ID
    witness: CardanoUtxoScriptWitness,
  |};
export type CardanoTxRequest = {|
  includeInputs?: Array<CardanoTxRequestInput>,
  includeOutputs?: Array<string>, // HEX of WASM TransactionOutput values
  includeTargets?: Array<{|
    address: string,
    value?: string,
    isForeign: ?boolean,
    assets?: {| [assetId: string]: string |},
    dataHash?: string,
    mintRequest?: Array<CardanoTxRequestMint>, // this mint is sent directly to the target
    ensureRequiredMinimalValue?: boolean,
  |}>,
  mintRequest?: Array<CardanoTxRequestMint>, // this ming must be manually set to the outputs
  onlyInputsIntended?: boolean,
  validityIntervalStart?: number,
  ttl?: number,
  // HEX of WASM key-hashes, or HEX of WASM addresses, or beck32 addresses
  requiredSigners?: Array<string>,
|};
export type CreateUnsignedTxForConnectorRequest = {|
  cardanoTxRequest: CardanoTxRequest,
  publicDeriver: PublicDeriver<>,
  absSlotNumber: BigNumber,
  submittedTxs: Array<PersistedSubmittedTransaction>,
  utxos: Array<CardanoAddressedUtxo>,
|};
export type CreateUnsignedTxResponse = HaskellShelleyTxSignRequest;
export type CreateVotingRegTxResponse = HaskellShelleyTxSignRequest;

// createUnsignedTxForUtxos

export type CreateUnsignedTxForUtxosRequest = {|
  absSlotNumber: BigNumber,
  receivers: Array<{|
    ...Address,
    ...InexactSubset<Addressing>,
  |}>,
  network: $ReadOnly<NetworkRow>,
  defaultToken: DefaultTokenEntry,
  tokens: SendTokenList,
  utxos: Array<CardanoAddressedUtxo>,
  metadata: Array<TransactionMetadata> | void,
|};
export type CreateUnsignedTxForUtxosResponse = HaskellShelleyTxSignRequest;
export type CreateUnsignedTxForUtxosFunc = (
  request: CreateUnsignedTxForUtxosRequest
) => Promise<CreateUnsignedTxForUtxosResponse>;

// createDelegationTx

export type CreateDelegationTxRequest = {|
 wallet: WalletState,
  absSlotNumber: BigNumber,
  registrationStatus: boolean,
  poolRequest: void | string,
  valueInAccount: MultiToken,
|};

type CreateVotingRegTxRequestCommon = {|
  wallet: WalletState,
  absSlotNumber: BigNumber,
|};

export type CreateVotingRegTxRequest = {|
  ...CreateVotingRegTxRequestCommon,
  normalWallet: {|
    metadata: RustModule.WalletV4.AuxiliaryData,
  |}
|} | {|
  ...CreateVotingRegTxRequestCommon,
  trezorTWallet: TrezorTCatalystRegistrationTxSignData,
|} | {|
  ...CreateVotingRegTxRequestCommon,
  ledgerNanoWallet: LedgerNanoCatalystRegistrationTxSignData,
|};

export type CreateSimpleTxRequest = {|
  +publicDeriver: {
    networkId: number,
    utxos: IGetAllUtxosResponse,
    receiveAddress: BaseSingleAddressPath,
    ...
  },
  entries: Array<TxOutput>,
  metadata: RustModule.WalletV4.AuxiliaryData,
|};

export type CreateDelegationTxResponse = {|
  signTxRequest: HaskellShelleyTxSignRequest,
  totalAmountToDelegate: MultiToken,
|};

export type CreateDelegationTxFunc = (
  request: CreateDelegationTxRequest
) => Promise<CreateDelegationTxResponse>;

export type CreateVotingRegTxFunc = (
  request: CreateVotingRegTxRequest
) => Promise<CreateVotingRegTxResponse>;

// createWithdrawalTx

export type CreateWithdrawalTxRequest = {|
  wallet: WalletState,
  absSlotNumber: BigNumber,
  getAccountState: AccountStateFunc,
  withdrawals: Array<{|
    ...({| privateKey: RustModule.WalletV4.PrivateKey |} | {| ...Addressing |}),
    rewardAddress: string, // address you're withdrawing from (hex)
    /**
     * you need to withdraw all ADA before deregistering
     * but you don't need to deregister in order to withdraw
     * deregistering gives you back the key deposit
     * so it makes sense if you don't intend to stake on the wallet anymore
     */
    shouldDeregister: boolean,
  |}>,
|};
export type CreateWithdrawalTxResponse = HaskellShelleyTxSignRequest;

export type CreateWithdrawalTxFunc = (
  request: CreateWithdrawalTxRequest
) => Promise<CreateWithdrawalTxResponse>;

// saveLastReceiveAddressIndex

export type SaveLastReceiveAddressIndexRequest = {|
  publicDeriver: PublicDeriver<>,
  index: number,
|};
export type SaveLastReceiveAddressIndexResponse = void;
export type SaveLastReceiveAddressIndexFunc = (
  request: SaveLastReceiveAddressIndexRequest
) => Promise<SaveLastReceiveAddressIndexResponse>;


// generateWalletRecoveryPhrase

export type GenerateWalletRecoveryPhraseRequest = {||};
export type GenerateWalletRecoveryPhraseResponse = Array<string>;
export type GenerateWalletRecoveryPhraseFunc = (
  request: GenerateWalletRecoveryPhraseRequest
) => Promise<GenerateWalletRecoveryPhraseResponse>;

// restoreWalletForTransfer

export type RestoreWalletForTransferRequest = {|
  accountPubKey: RustModule.WalletV4.Bip32PublicKey,
  accountIndex: number,
  checkAddressesInUse: FilterFunc,
  network: $ReadOnly<NetworkRow>,
|};
export type RestoreWalletForTransferResponse = {|
  addresses: Array<{| ...Address, ...Addressing |}>,
|};
export type RestoreWalletForTransferFunc = (
  request: RestoreWalletForTransferRequest
) => Promise<RestoreWalletForTransferResponse>;

// transferToCip1852

export type TransferToCip1852Request = {|
  cip1852AccountPubKey: RustModule.WalletV4.Bip32PublicKey,
  bip44AccountPubKey: RustModule.WalletV4.Bip32PublicKey,
  accountIndex: number,
  checkAddressesInUse: FilterFunc,
  absSlotNumber: BigNumber,
  getUTXOsForAddresses: AddressUtxoFunc,
  network: $ReadOnly<NetworkRow>,
  defaultToken: $ReadOnly<TokenRow>,
|};
export type TransferToCip1852Response = {|
  signRequest: CreateUnsignedTxResponse,
  publicKey: {|
    key: RustModule.WalletV4.Bip32PublicKey,
    ...Addressing,
  |},
|};
export type TransferToCip1852Func = (
  request: TransferToCip1852Request
) => Promise<TransferToCip1852Response>;


// createHardwareWallet

export type CreateHardwareWalletRequest = {|
  db: lf$Database,
  walletName: string,
  publicKey: string,
  ...Addressing,
  hwFeatures: HWFeatures,
  checkAddressesInUse: FilterFunc,
  network: $ReadOnly<NetworkRow>,
|};
export type CreateHardwareWalletResponse = {|
  publicDeriver: PublicDeriver<>,
|};
export type CreateHardwareWalletFunc = (
  request: CreateHardwareWalletRequest
) => Promise<CreateHardwareWalletResponse>;

// getTransactionRowsToExport

export type GetTransactionRowsToExportRequest = {|
  publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels>,
  getDefaultToken: number => $ReadOnly<TokenRow>,
|};
export type GetTransactionRowsToExportResponse = Array<TransactionExportRow>;
export type GetTransactionRowsToExportFunc = (
  request: GetTransactionRowsToExportRequest
) => Promise<GetTransactionRowsToExportResponse>;

export const FETCH_TXS_BATCH_SIZE = 20;
const MIN_REORG_OUTPUT_AMOUNT  = '1000000';

export default class AdaApi {

  /**
   * addresses get cutoff if there is a DisplayCutoff set
   */
  async getAllAddressesForDisplay(
    request: GetAllAddressesForDisplayRequest
  ): Promise<GetAllAddressesForDisplayResponse> {
    Logger.debug(`${nameof(AdaApi)}::${nameof(this.getAllAddressesForDisplay)} called`);
    try {
      return await getAllAddressesForDisplay(request);
    } catch (error) {
      Logger.error(`${nameof(AdaApi)}::${nameof(this.getAllAddressesForDisplay)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  /**
   * for the external chain, we truncate based on cutoff
   * for the internal chain, we truncate based on the last used
   */
  async getChainAddressesForDisplay(
    request: GetChainAddressesForDisplayRequest
  ): Promise<GetChainAddressesForDisplayResponse> {
    Logger.debug(`${nameof(AdaApi)}::${nameof(this.getChainAddressesForDisplay)} called`);
    try {
      return await getChainAddressesForDisplay(request);
    } catch (error) {
      Logger.error(`${nameof(AdaApi)}::${nameof(this.getChainAddressesForDisplay)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  /*
    3 scenarios when this function is invoked:
    1. To load locally the initial txs: isLocalRequest === true, afterTx == null, beforeTx == null;
    2. To fetch the newest transactions from network: isLocalRequest === false, afterTx != null,
    3. To fetch older transactions: isLocalRequest = false, beforeTx != null
   */
  async refreshTransactions(
    request: {|
      ...BaseGetTransactionsRequest,
      ...AdaGetTransactionsRequest,
    |},
  ): Promise<Array<WalletTransaction>> {
    try {
      let fetchedTxs;
      if (request.isLocalRequest) {
        fetchedTxs = await getAllTransactions({
          publicDeriver: request.publicDeriver,
          skip: request.skip || 0,
          limit: request.limit || FETCH_TXS_BATCH_SIZE,
        });
      } else {
        if (!request.beforeTx) {
          // we are "loading more" old transactions, no need to update utxos
          await updateUtxos(
            request.publicDeriver.getDb(),
            request.publicDeriver,
            request.checkAddressesInUse,
            request.getTokenInfo,
            request.getMultiAssetMetadata,
            request.getMultiAssetSupply,
          );
        }

        const resolveReference = ref => {
          return ref?.block ? {
            blockHash: ref.block.Hash,
            txHash: ref.txid,
          } : undefined;
        };

        fetchedTxs = await updateTransactions(
          request.publicDeriver.getDb(),
          request.publicDeriver,
          request.checkAddressesInUse,
          request.getTransactionHistory,
          request.getRecentTransactionHashes,
          request.getTransactionsByHashes,
          request.getBestBlock,
          request.getTokenInfo,
          request.getMultiAssetMetadata,
          request.getMultiAssetSupply,
          resolveReference(request.afterTx),
          resolveReference(request.beforeTx),
        );
      }

      const mappedTransactions = fetchedTxs.txs.map(tx => {
        if (tx.txType === TransactionType.CardanoByron) {
          return CardanoByronTransaction.fromAnnotatedTx({
            tx,
            addressLookupMap: fetchedTxs.addressLookupMap,
            network: request.publicDeriver.getParent().getNetworkInfo(),
            defaultToken: request.publicDeriver.getParent().getDefaultToken(),
          });
        }
        if (tx.txType === TransactionType.CardanoShelley) {
          return CardanoShelleyTransaction.fromAnnotatedTx({
            tx,
            addressLookupMap: fetchedTxs.addressLookupMap,
            network: request.publicDeriver.getParent().getNetworkInfo(),
            defaultToken: request.publicDeriver.getParent().getDefaultToken(),
          });
        }
        throw new Error(`${nameof(this.refreshTransactions)} unknown tx type ${tx.type}`);
      });
      return mappedTransactions;
    } catch (error) {
      Logger.error(`${nameof(AdaApi)}::${nameof(this.refreshTransactions)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async refreshPendingTransactions(
    request: RefreshPendingTransactionsRequest
  ): Promise<RefreshPendingTransactionsResponse> {
    Logger.debug(`${nameof(AdaApi)}::${nameof(this.refreshPendingTransactions)} called`);
    try {
      const fetchedTxs = await getPendingTransactions({
        publicDeriver: request.publicDeriver,
      });
      Logger.debug(`${nameof(AdaApi)}::${nameof(this.refreshPendingTransactions)} success: ` + stringifyData(fetchedTxs));

      const mappedTransactions = fetchedTxs.txs.map(tx => {
        if (tx.txType === TransactionType.CardanoByron) {
          return CardanoByronTransaction.fromAnnotatedTx({
            tx,
            addressLookupMap: fetchedTxs.addressLookupMap,
            network: request.publicDeriver.getParent().getNetworkInfo(),
            defaultToken: request.publicDeriver.getParent().getDefaultToken(),
          });
        }
        if (tx.txType === TransactionType.CardanoShelley) {
          return CardanoShelleyTransaction.fromAnnotatedTx({
            tx,
            addressLookupMap: fetchedTxs.addressLookupMap,
            network: request.publicDeriver.getParent().getNetworkInfo(),
            defaultToken: request.publicDeriver.getParent().getDefaultToken(),
          });
        }
        throw new Error(`${nameof(this.refreshPendingTransactions)} unknown tx type ${tx.type}`);
      });
      return mappedTransactions;
    } catch (error) {
      Logger.error(`${nameof(AdaApi)}::${nameof(this.refreshPendingTransactions)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async removeAllTransactions(
    request: RemoveAllTransactionsRequest
  ): Promise<RemoveAllTransactionsResponse> {
    try {
      // 1) clear existing history
      await removeAllTransactions({ publicDeriverId: request.publicDeriver.publicDeriverId });

      // 2) trigger a history sync
      try {
        await request.refreshWallet();
      } catch (_e) {
        Logger.warn(`${nameof(this.removeAllTransactions)} failed to connect to remote to resync. Data was still cleared locally`);
      }
    } catch (error) {
      Logger.error(`${nameof(AdaApi)}::${nameof(this.removeAllTransactions)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async getForeignAddresses(
    request: GetForeignAddressesRequest
  ): Promise<GetForeignAddressesResponse> {
    try {
      return await getForeignAddresses({ publicDeriver: request.publicDeriver });
    } catch (error) {
      Logger.error(`${nameof(AdaApi)}::${nameof(this.getForeignAddresses)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async createWallet(
    request: CreateWalletRequest,
  ): Promise<CreateWalletResponse> {
    // creating a wallet is the same as restoring a wallet
    return await this.restoreWallet(request);
  }

  async signAndBroadcast(
    request: SignAndBroadcastRequest
  ): Promise<SignAndBroadcastResponse> {
    Logger.debug(`${nameof(AdaApi)}::${nameof(this.signAndBroadcast)} called`);
    const { password } = request;
    try {
      const signingKey = await request.publicDeriver.getSigningKey();
      const normalizedKey = await request.publicDeriver.normalizeKey({
        ...signingKey,
        password,
      });

      const { txHash, encodedTx } = RustModule.WasmScope(Scope => {
        const signedTx = shelleySignTransaction(
          request.signRequest.senderUtxos,
          request.signRequest.unsignedTx,
          request.publicDeriver.getParent().getPublicDeriverLevel(),
          Scope.WalletV4.Bip32PrivateKey.from_bytes(
            Buffer.from(normalizedKey.prvKeyHex, 'hex')
          ),
          request.signRequest.neededStakingKeyHashes.wits,
          request.signRequest.metadata,
        );

        return {
          txHash: Buffer.from(
            Scope.WalletV4.hash_transaction(signedTx.body()).to_bytes()
          ).toString('hex'),
          encodedTx: signedTx.to_bytes(),
        }
      })

      const { txId } = await request.sendTx({
        network: request.publicDeriver.getParent().getNetworkInfo(),
        id: txHash,
        encodedTx,
      });

      Logger.debug(
        `${nameof(AdaApi)}::${nameof(this.signAndBroadcast)} success: ` + stringifyData({ txId })
      );
      return { txId, signedTxHex: Buffer.from(encodedTx).toString('hex') };
    } catch (error) {
      if (error instanceof WrongPassphraseError) {
        throw new IncorrectWalletPasswordError();
      }

      Logger.error(`${nameof(AdaApi)}::${nameof(this.signAndBroadcast)} error: ${fullErrStr(error)}` );
      if (error instanceof InvalidWitnessError) {
        throw new InvalidWitnessError();
      }
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async createTrezorSignTxData(
    request: CreateTrezorSignTxDataRequest
  ): Promise<CreateTrezorSignTxDataResponse> {
    try {
      Logger.debug(`${nameof(AdaApi)}::${nameof(this.createTrezorSignTxData)} called`);

      const config = getCardanoHaskellBaseConfig(
        request.network
      ).reduce((acc, next) => Object.assign(acc, next), {});

      const trezorSignTxPayload = await createTrezorSignTxPayload(
        request.signRequest,
        config.ByronNetworkId,
        Number.parseInt(config.ChainNetworkId, 10),
      );
      Logger.debug(`${nameof(AdaApi)}::${nameof(this.createTrezorSignTxData)} success: ` + stringifyData(trezorSignTxPayload));
      return {
        trezorSignTxPayload,
      };
    } catch (error) {
      Logger.error(`${nameof(AdaApi)}::${nameof(this.createTrezorSignTxData)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async createLedgerSignTxData(
    request: CreateLedgerSignTxDataRequest
  ): Promise<CreateLedgerSignTxDataResponse> {
    try {
      Logger.debug(`${nameof(AdaApi)}::${nameof(this.createLedgerSignTxData)} called`);

      const config = getCardanoHaskellBaseConfig(
        request.network
      ).reduce((acc, next) => Object.assign(acc, next), {});

      const ledgerSignTxPayload = await createLedgerSignTxPayload({
        signRequest: request.signRequest,
        byronNetworkMagic: config.ByronNetworkId,
        networkId: Number.parseInt(config.ChainNetworkId, 10),
        addressingMap: request.addressingMap,
        cip36: request.cip36,
      });

      Logger.debug(`${nameof(AdaApi)}::${nameof(this.createLedgerSignTxData)} success: ` + stringifyData(ledgerSignTxPayload));
      return {
        ledgerSignTxPayload
      };
    } catch (error) {
      Logger.error(`${nameof(AdaApi)}::${nameof(this.createLedgerSignTxData)} error: ` + stringifyError(error));

      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async createUnsignedTxForUtxos(
    request: CreateUnsignedTxForUtxosRequest
  ): Promise<CreateUnsignedTxForUtxosResponse> {
    Logger.debug(`${nameof(AdaApi)}::${nameof(this.createUnsignedTxForUtxos)} called`);
    try {
      const config = getCardanoHaskellBaseConfig(
        request.network
      ).reduce((acc, next) => Object.assign(acc, next), {});

      let unsignedTxResponse;
      const trxMetadata =
        request.metadata !== undefined ? createMetadata(request.metadata): undefined;

      if (hasSendAllDefault(request.tokens)) {
        if (request.receivers.length !== 1) {
          throw new Error(`${nameof(this.createUnsignedTxForUtxos)} wrong output size for sendAll`);
        }
        const receiver = request.receivers[0];
        unsignedTxResponse = shelleySendAllUnsignedTx(
          receiver,
          request.utxos,
          request.absSlotNumber,
          {
            keyDeposit: RustModule.WalletV4.BigNum.from_str(config.KeyDeposit),
            linearFee: RustModule.WalletV4.LinearFee.new(
              RustModule.WalletV4.BigNum.from_str(config.LinearFee.coefficient),
              RustModule.WalletV4.BigNum.from_str(config.LinearFee.constant),
            ),
            coinsPerUtxoWord: RustModule.WalletV4.BigNum.from_str(config.CoinsPerUtxoWord),
            poolDeposit: RustModule.WalletV4.BigNum.from_str(config.PoolDeposit),
            networkId: request.network.NetworkId,
          },
          trxMetadata,
        );
      } else {
        const changeAddresses = request.receivers.reduce(
          (arr, next) => {
            if (next.addressing != null) {
              arr.push({
                address: next.address,
                addressing: next.addressing,
              });
              return arr;
            }
            return arr;
          },
          ([]: Array<{| ...Address, ...Addressing |}>)
        );
        if (changeAddresses.length !== 1) {
          throw new Error(`${nameof(this.createUnsignedTxForUtxos)} needs exactly one change address`);
        }
        const changeAddr = changeAddresses[0];
        const otherAddresses: Array<{| ...Address, |}> = request.receivers.reduce(
          (arr, next) => {
            if (next.addressing == null) {
              arr.push({ address: next.address });
              return arr;
            }
            return arr;
          },
          ([]: Array<{| ...Address, |}>)
        );
        if (otherAddresses.length > 1) {
          throw new Error(`${nameof(this.createUnsignedTxForUtxos)} can't send to more than one address`);
        }
        unsignedTxResponse = await shelleyNewAdaUnsignedTx(
          otherAddresses.length === 1
            ? [{
              address: otherAddresses[0].address,
              amount: builtSendTokenList(
                request.defaultToken,
                request.tokens,
                request.utxos.map(utxo => multiTokenFromRemote(utxo, request.network.NetworkId)),
              ),
            }]
            : [],
          {
            address: changeAddr.address,
            addressing: changeAddr.addressing,
          },
          request.utxos,
          request.absSlotNumber,
          {
            keyDeposit: config.KeyDeposit,
            linearFeeCoefficient: config.LinearFee.coefficient,
            linearFeeConstant: config.LinearFee.constant,
            coinsPerUtxoWord: config.CoinsPerUtxoWord,
            poolDeposit: config.PoolDeposit,
            networkId: request.network.NetworkId,
          },
          [],
          [],
          false,
          trxMetadata,
        );
      }
      Logger.debug(
        `${nameof(AdaApi)}::${nameof(this.createUnsignedTxForUtxos)} success: ` + stringifyData(unsignedTxResponse)
      );
      return new HaskellShelleyTxSignRequest({
        senderUtxos: unsignedTxResponse.senderUtxos,
        unsignedTx: unsignedTxResponse.txBuilder,
        changeAddr: unsignedTxResponse.changeAddr,
        metadata: trxMetadata,
        networkSettingSnapshot: {
          ChainNetworkId: Number.parseInt(config.ChainNetworkId, 10),
          KeyDeposit: new BigNumber(config.KeyDeposit),
          PoolDeposit: new BigNumber(config.PoolDeposit),
          NetworkId: request.network.NetworkId,
        },
        neededStakingKeyHashes: {
          neededHashes: new Set(),
          wits: new Set(),
        },
      });
    } catch (error) {
      Logger.error(
        `${nameof(AdaApi)}::${nameof(this.createUnsignedTxForUtxos)} error: ` + stringifyError(error)
      );
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async createUnsignedTx(
    request: CreateUnsignedTxRequest
  ): Promise<CreateUnsignedTxResponse> {
    const filteredUtxos = request.publicDeriver.utxos.filter(utxo => request.filter(utxo));

    const addressedUtxo = asAddressedUtxo(filteredUtxos);

    const receivers = [{
      address: request.receiver
    }];

    // note: we need to create a change address IFF we're not sending all of the default asset
    if (!hasSendAllDefault(request.tokens)) {
      const internal = request.publicDeriver.receiveAddress;
      receivers.push({
        address: internal.addr.Hash,
        addressing: internal.addressing,
      });
    }
    return this.createUnsignedTxForUtxos({
      absSlotNumber: request.absSlotNumber,
      receivers,
      network: getNetworkById(request.publicDeriver.networkId),
      defaultToken: {
        defaultNetworkId: request.publicDeriver.networkId,
        defaultIdentifier: request.publicDeriver.defaultTokenId
      },
      utxos: addressedUtxo,
      tokens: request.tokens,
      metadata: request.metadata,
    });
  }

  async createUnsignedTxForConnector(
    request: CreateUnsignedTxForConnectorRequest,
    foreignUtxoFetcher: ?ForeignUtxoFetcher,
  ): Promise<CreateUnsignedTxResponse> {
    const withUtxos = asGetAllUtxos(request.publicDeriver);
    if (!withUtxos) {
      throw new Error('unable to get UTxO addresses from public deriver');
    }
    const allUtxoAddresses = await withUtxos.getAllUtxoAddresses();

    const internal = await getReceiveAddress(request.publicDeriver);
    if (internal == null) {
      throw new Error(`no internal addresses left. Should never happen`);
    }

    return this._createUnsignedTxForConnector(
      request.cardanoTxRequest,
      request.publicDeriver.getParent().getDefaultToken(),
      request.publicDeriver.publicDeriverId,
      allUtxoAddresses,
      internal,
      request.publicDeriver.getParent().getNetworkInfo(),
      request.absSlotNumber,
      request.submittedTxs,
      request.utxos,
      foreignUtxoFetcher
    );
  }

  async _createUnsignedTxForConnector(
    cardanoTxRequest: CardanoTxRequest,
    defaultToken: DefaultTokenEntry,
    publicDeriverId: number,
    allUtxoAddresses: IGetAllUtxoAddressesResponse,
    receiveAddress: BaseSingleAddressPath,
    network: $ReadOnly<NetworkRow>,
    absSlotNumber: BigNumber,
    submittedTxs: Array<PersistedSubmittedTransaction>,
    committedUtxos: Array<CardanoAddressedUtxo>,
    foreignUtxoFetcher: ?ForeignUtxoFetcher,
  ): Promise<CreateUnsignedTxResponse> {
    const {
      includeInputs,
      includeOutputs,
      includeTargets,
      mintRequest,
      onlyInputsIntended,
      validityIntervalStart,
      ttl,
      requiredSigners,
    } = cardanoTxRequest;
    const noneOrEmpty = a => {
      if (a != null && !Array.isArray(a)) {
        throw new Error(`Array is expected, got: ${JSON.stringify(a)}`);
      }
      return a == null || a.length === 0;
    }

    const noInputs = noneOrEmpty(includeInputs);
    const noOutputs = noneOrEmpty(includeOutputs) && noneOrEmpty(includeTargets);

    if (noOutputs) {
      if (noInputs) {
        throw new Error('Invalid tx-build request, must specify inputs, outputs, or targets');
      }
      if (Boolean(onlyInputsIntended) === false) {
        throw new Error('No outputs is specified and `onlyInputsIntended` flag is false');
      }
    }

    const utxos = await this._addressedUtxosWithSubmittedTxs(
      committedUtxos,
      publicDeriverId,
      allUtxoAddresses,
      submittedTxs
    );

    const allUtxoIds = new Set(utxos.map(utxo => utxo.utxo_id));
    const foreignUtxoIds: Array<string> = [];
    const includeInputMap = (includeInputs||[]).reduce((acc, e: CardanoTxRequestInput) => {
      // eslint-disable-next-line no-nested-ternary
      const id = typeof e === 'string' ? e
        : (typeof e.id === 'string' ? e.id : null);
      if (id == null) {
        throw new Error(`Unrecognised input request format: ${JSON.stringify(e)}`);
      }
      if (!allUtxoIds.has(id)) {
        foreignUtxoIds.push(id);
      }
      acc[id] = e;
      return acc;
    }, {})

    const foreignUtxos = [];
    if (foreignUtxoIds.length > 0) {
      if (foreignUtxoFetcher == null) {
        throw new Error('Foreign utxos are present, but foreign utxo fetcher is missing!');
      }
      foreignUtxos.push(...await foreignUtxoFetcher(foreignUtxoIds));
      foreignUtxos.forEach((u, i) => {
        if (u == null) {
          throw new Error(`No UTxO found for input id: ${JSON.stringify(foreignUtxoIds[i])}`);
        }
      });
    }

    const mustIncludeUtxos: Array<[CardanoAddressedUtxo, ?CardanoUtxoScriptWitness]> = [];
    const coinSelectUtxos: Array<CardanoAddressedUtxo> = [];
    for (const utxo of [...foreignUtxos, ...utxos]) {
      const includeInputEntry = includeInputMap[utxo.utxo_id];
      if (includeInputEntry != null) {
        mustIncludeUtxos.push([utxo, includeInputEntry.witness]);
      } else {
        coinSelectUtxos.push(utxo);
      }
    }


    const changeAdaAddr = {
      address: receiveAddress.addr.Hash,
      addressing: receiveAddress.addressing,
    };

    const config = getCardanoHaskellBaseConfig(
      network
    ).reduce((acc, next) => Object.assign(acc, next), {});

    const protocolParams = {
      keyDeposit: config.KeyDeposit,
      linearFeeCoefficient: config.LinearFee.coefficient,
      linearFeeConstant: config.LinearFee.constant,
      coinsPerUtxoWord: config.CoinsPerUtxoWord,
      poolDeposit: config.PoolDeposit,
      networkId: network.NetworkId,
    };

    const outputs = [];
    const mint = [];
    const mintMetadata = {};
    const nativeScripts = [];

    function appendMintMetadata(
      metadata: ?CardanoTxRequestMintMetadata,
      policyId: string,
      assetName: string,
    ): void {
      if (metadata) {
        const tag = new BigNumber(metadata.tag).toString();
        const tagGroup = mintMetadata[tag] = mintMetadata[tag] || {
          version: '1.0',
        };
        const policyGroup = tagGroup[policyId] = tagGroup[policyId] || {};
        policyGroup[hexToUtf(assetName)] = JSON.parse(metadata.json);
      }
    }

    function mintEntryToIdentifier(mintEntry: CardanoTxRequestMint): {|
      policyId: string, assetId: string,
    |} {
      const { script, assetName } = mintEntry;
      const policyId = RustModule.WasmScope(Scope => {
        return bytesToHex(
          Scope.WalletV4.NativeScript
            .from_bytes(hexToBytes(script))
            .hash()
            .to_bytes()
        );
      });

      const assetId = `${policyId}.${assetName}`;
      return { policyId, assetId };
    }

    RustModule.WasmScope(Scope => {
      for (const outputHex of (includeOutputs ?? [])) {
        const output = Scope.WalletV4.TransactionOutput.from_bytes(hexToBytes(outputHex))
        const newOutput = {
          address: bytesToHex(output.address().to_bytes()),
          amount: multiTokenFromCardanoValue(output.amount(), defaultToken),
        };
        const outputDataHash = output.data_hash();
        if (outputDataHash != null) {
          // $FlowFixMe[prop-missing]
          newOutput.dataHash = bytesToHex(outputDataHash.to_bytes());
        }
        outputs.push(newOutput);
      }
    });

    for (const target of (includeTargets ?? [])) {
      const targetAssets = { ...(target.assets || {}) };
      const makeMultiToken = (adaValue: string) => {
        const values = [
          {
            identifier: defaultToken.defaultIdentifier,
            networkId: protocolParams.networkId,
            amount: new BigNumber(adaValue),
          },
        ];
        for (const assetId of Object.keys(targetAssets)) {
          const assetValue = targetAssets[assetId];
          if (assetValue != null) {
            values.push({
              identifier: assetId,
              networkId: protocolParams.networkId,
              amount: new BigNumber(assetValue),
            });
          }
        }
        return new MultiToken(
          values,
          {
            defaultNetworkId: protocolParams.networkId,
            defaultIdentifier: defaultToken.defaultIdentifier,
          },
        );
      };

      const targetMintRequest = target.mintRequest;
      if (targetMintRequest != null && targetMintRequest.length > 0) {
        if ((target.address || '').trim().length === 0) {
          throw new Error('A transaction target must include a valid non-empty address `address`!');
        }
        for (const mintEntry of targetMintRequest) {
          const { script, assetName, amount, metadata, storeScriptOnChain } = mintEntry;
          const { policyId, assetId } = mintEntryToIdentifier(mintEntry);
          const assetAmountBignum = new BigNumber(targetAssets[assetId] ?? '0')
            .plus(new BigNumber(amount ?? '1'));
          if (!assetAmountBignum.isPositive()) {
            throw new Error('Target mint cannot sum to a non-positive amount! Use root mint-request for burning!')
          }
          const assetAmount = assetAmountBignum.toString();
          // Adding minting request
          mint.push({
            policyScript: script,
            assetName,
            amount: assetAmount,
          });
          // Set the new amount to the target assets
          targetAssets[assetId] = assetAmount;
          appendMintMetadata(metadata, policyId, assetName);
          if (Boolean(storeScriptOnChain) === true) {
            nativeScripts.push(script);
          }
        }
      }

      let amount = makeMultiToken(target.value ?? '1000000');
      const dataHash = target.dataHash;
      const ensureMinValue = target.ensureRequiredMinimalValue;
      if (ensureMinValue == null || ensureMinValue === false) {
        if (target.value == null) {
          throw new Error(`Value is required for a valid tx output, got: ${JSON.stringify(target)}`);
        }
      } else {

        const minAmount =
          cardanoMinAdaRequiredFromAssets_coinsPerWord(amount, new BigNumber(protocolParams.coinsPerUtxoWord));
        if (minAmount.gt(target.value ?? '0')) {
          amount = makeMultiToken(minAmount.toString());
        }
      }
      outputs.push({
        address: target.address,
        amount,
        dataHash,
      });
    }

    for (const mintEntry of (mintRequest || [])) {
      const { script, assetName, amount, metadata } = mintEntry;
      const { policyId } = mintEntryToIdentifier(mintEntry);
      // Adding minting request
      mint.push({
        policyScript: script,
        assetName,
        amount: amount ?? '1',
      });
      appendMintMetadata(metadata, policyId, assetName);
    }

    const txMetadata = {};
    for (const metaTag of Object.keys(mintMetadata)) {
      txMetadata[String(metaTag)] = JSON.stringify(mintMetadata[metaTag]);
    }

    const auxiliaryData = {
      metadata: txMetadata,
      nativeScripts,
    };

    const unsignedTxResponse = await shelleyNewAdaUnsignedTxForConnector(
      outputs,
      mint,
      auxiliaryData,
      changeAdaAddr,
      mustIncludeUtxos,
      coinSelectUtxos,
      absSlotNumber,
      validityIntervalStart,
      ttl,
      requiredSigners,
      protocolParams,
    );

    return new HaskellShelleyTxSignRequest({
      senderUtxos: unsignedTxResponse.senderUtxos,
      unsignedTx: unsignedTxResponse.txBuilder,
      changeAddr: unsignedTxResponse.changeAddr,
      metadata: undefined,
      networkSettingSnapshot: {
        ChainNetworkId: Number.parseInt(config.ChainNetworkId, 10),
        KeyDeposit: new BigNumber(config.KeyDeposit),
        PoolDeposit: new BigNumber(config.PoolDeposit),
        NetworkId: protocolParams.networkId,
      },
      neededStakingKeyHashes: {
        neededHashes: new Set(),
        wits: new Set(),
      },
    });
  }

  async createDelegationTx(
    request: CreateDelegationTxRequest
  ): Promise<CreateDelegationTxResponse> {
    Logger.debug(`${nameof(AdaApi)}::${nameof(this.createDelegationTx)} called`);

    try {
      const { wallet } = request;
      const networkInfo = getNetworkById(wallet.networkId);
      const config = getCardanoHaskellBaseConfig(networkInfo)
        .reduce((acc, next) => Object.assign(acc, next), {});

      const protocolParams = {
        keyDeposit: config.KeyDeposit,
        linearFeeCoefficient: config.LinearFee.coefficient,
        linearFeeConstant: config.LinearFee.constant,
        coinsPerUtxoWord: config.CoinsPerUtxoWord,
        poolDeposit: config.PoolDeposit,
        networkId: networkInfo.NetworkId,
      };

      const publicKey = RustModule.WalletV4.Bip32PublicKey.from_bytes(
        Buffer.from(wallet.publicKey, 'hex')
      );

      const stakingKey = derivePublicByAddressing({
        addressing: wallet.stakingAddressing.addressing,
        startingFrom: {
          level: wallet.publicDeriverLevel,
          key: publicKey,
        },
      }).to_raw_key();

      const stakeDelegationCert = createCertificate(
        stakingKey,
        request.registrationStatus,
        request.poolRequest
      );

      const allUtxo = wallet.utxos;
      const addressedUtxo = asAddressedUtxo(allUtxo);
      const changeAddr = await wallet.receiveAddress;

      const unsignedTx = await shelleyNewAdaUnsignedTx(
        [],
        {
          address: changeAddr.addr.Hash,
          addressing: changeAddr.addressing,
        },
        addressedUtxo,
        request.absSlotNumber,
        protocolParams,
        stakeDelegationCert,
        [],
        false,
      );

      const allUtxosForKey = filterAddressesByStakingKey<ElementOf<IGetAllUtxosResponse>>(
        RustModule.WalletV4.Credential.from_keyhash(stakingKey.hash()),
        allUtxo,
        false,
      );

      const defaultToken = {
        defaultNetworkId: wallet.networkId,
        defaultIdentifier: wallet.defaultTokenId,
      };

      const utxoSum = allUtxosForKey.reduce(
        (sum, utxo) => sum.joinAddMutable(new MultiToken(
          utxo.output.tokens.map(token => ({
            identifier: token.Token.Identifier,
            amount: new BigNumber(token.TokenList.Amount),
            networkId: token.Token.NetworkId,
          })),
          defaultToken,
        )),
        new MultiToken([], defaultToken),
      );

      const differenceAfterTx = getDifferenceAfterTx(
        unsignedTx,
        allUtxo,
        stakingKey,
        defaultToken,
      );

      const totalAmountToDelegate = utxoSum
        .joinAddCopy(differenceAfterTx) // subtract any part of the fee that comes from UTXO
        .joinAddCopy(request.valueInAccount); // recall: rewards are compounding

      const stakeCredentialHex = RustModule.WasmScope(Scope => {
        return Buffer.from(
            Scope.WalletV4.Credential
              .from_keyhash(stakingKey.hash())
              .to_bytes()
          ).toString('hex')
      });

      const signTxRequest = new HaskellShelleyTxSignRequest({
        senderUtxos: unsignedTx.senderUtxos,
        unsignedTx: unsignedTx.txBuilder,
        changeAddr: unsignedTx.changeAddr,
        metadata: undefined,
        networkSettingSnapshot: {
          ChainNetworkId: Number.parseInt(config.ChainNetworkId, 10),
          KeyDeposit: new BigNumber(config.KeyDeposit),
          PoolDeposit: new BigNumber(config.PoolDeposit),
          NetworkId: networkInfo.NetworkId,
        },
        neededStakingKeyHashes: {
          neededHashes: new Set([stakeCredentialHex]),
          wits: new Set(),
        },
      });
      return {
        signTxRequest,
        totalAmountToDelegate
      };
    } catch (error) {
      Logger.error(`${nameof(AdaApi)}::${nameof(this.createDelegationTx)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async createWithdrawalTx(
    request: CreateWithdrawalTxRequest
  ): Promise<CreateWithdrawalTxResponse> {
    Logger.debug(`${nameof(AdaApi)}::${nameof(this.createUnsignedTx)} called`);
    try {
      const network = getNetworkById(request.wallet.networkId);
      const config = getCardanoHaskellBaseConfig(
        network,
      ).reduce((acc, next) => Object.assign(acc, next), {});

      const protocolParams = {
        keyDeposit: config.KeyDeposit,
        linearFeeCoefficient: config.LinearFee.coefficient,
        linearFeeConstant: config.LinearFee.constant,
        coinsPerUtxoWord: config.CoinsPerUtxoWord,
        poolDeposit: config.PoolDeposit,
        networkId: request.wallet.networkId,
      };

      const utxos = request.wallet.utxos;
      const addressedUtxo = asAddressedUtxo(utxos);

      const changeAddr = request.wallet.receiveAddress;

      const certificates = [];
      const neededKeys = {
        neededHashes: new Set(),
        wits: new Set(),
      };

      const requiredWits: Array<RustModule.WalletV4.Ed25519KeyHash> = [];
      for (const withdrawal of request.withdrawals) {
        const wasmAddr = RustModule.WalletV4.RewardAddress.from_address(
          RustModule.WalletV4.Address.from_bytes(
            Buffer.from(withdrawal.rewardAddress, 'hex')
          )
        );
        if (wasmAddr == null) throw new Error(`${nameof(AdaApi)}::${nameof(this.createUnsignedTx)} withdrawal not a reward address`);
        const paymentCred = wasmAddr.payment_cred();

        const keyHash = paymentCred.to_keyhash();
        if (keyHash == null) throw new Error(`Unexpected: withdrawal from a script hash`);
        requiredWits.push(keyHash);

        if (withdrawal.shouldDeregister) {
          certificates.push(RustModule.WalletV4.Certificate.new_stake_deregistration(
            RustModule.WalletV4.StakeDeregistration.new(paymentCred)
          ));
          neededKeys.neededHashes.add(Buffer.from(paymentCred.to_bytes()).toString('hex'));
        }
      }
      const accountStates = await request.getAccountState({
        network,
        addresses: request.withdrawals.map(withdrawal => withdrawal.rewardAddress)
      });
      const finalWithdrawals = Object.keys(accountStates).reduce(
        (list, address) => {
          const rewardForAddress = accountStates[address];
          // if key is not registered, we just skip this withdrawal
          if (rewardForAddress == null) {
            return list;
          }

          const rewardBalance = new BigNumber(rewardForAddress.remainingAmount);

          // if the reward address is empty, we filter it out of the withdrawal list
          // although the protocol allows withdrawals of 0 ADA, it's pointless to do
          // recall: you may want to undelegate the ADA even if there is 0 ADA in the reward address
          // since you may want to get back your deposit
          if (rewardBalance.eq(0)) {
            return list;
          }

          const rewardAddress = RustModule.WalletV4.RewardAddress.from_address(
            RustModule.WalletV4.Address.from_bytes(
              Buffer.from(address, 'hex')
            )
          );
          if (rewardAddress == null) {
            throw new Error(`${nameof(AdaApi)}::${nameof(this.createUnsignedTx)} withdrawal not a reward address`);
          }
          {
            const stakeCredential = rewardAddress.payment_cred();
            neededKeys.neededHashes.add(Buffer.from(stakeCredential.to_bytes()).toString('hex'));
          }
          list.push({
            address: rewardAddress,
            amount: RustModule.WalletV4.BigNum.from_str(rewardForAddress.remainingAmount)
          });
          return list;
        },
        ([]: Array<{|
          address:RustModule.WalletV4. RewardAddress,
          amount: RustModule.WalletV4.BigNum,
        |}>)
      );
      // if the end result is no withdrawals and no deregistrations, throw an error
      if (finalWithdrawals.length === 0 && certificates.length === 0) {
        throw new RewardAddressEmptyError();
      }
      const unsignedTxResponse = await shelleyNewAdaUnsignedTx(
        [],
        {
          address: changeAddr.addr.Hash,
          addressing: changeAddr.addressing,
        },
        addressedUtxo,
        request.absSlotNumber,
        protocolParams,
        certificates,
        finalWithdrawals,
        false,
      );
      // there wasn't enough in the withdrawal to send anything to us
      if (unsignedTxResponse.changeAddr.length === 0) {
        throw new NotEnoughMoneyToSendError();
      }
      Logger.debug(
        `${nameof(AdaApi)}::${nameof(this.createWithdrawalTx)} success: ` + stringifyData(unsignedTxResponse)
      );

      {
        const body = unsignedTxResponse.txBuilder.build();
        for (const withdrawal of request.withdrawals) {
          if (withdrawal.privateKey != null) {
            const { privateKey } = withdrawal;
            neededKeys.wits.add(
              Buffer.from(RustModule.WalletV4.make_vkey_witness(
                RustModule.WalletV4.hash_transaction(body),
                privateKey
              ).to_bytes()).toString('hex')
            );
          }
        }
      }
      const result = new HaskellShelleyTxSignRequest({
        senderUtxos: unsignedTxResponse.senderUtxos,
        unsignedTx: unsignedTxResponse.txBuilder,
        changeAddr: unsignedTxResponse.changeAddr,
        metadata: undefined,
        networkSettingSnapshot: {
          ChainNetworkId: Number.parseInt(config.ChainNetworkId, 10),
          KeyDeposit: new BigNumber(config.KeyDeposit),
          PoolDeposit: new BigNumber(config.PoolDeposit),
          NetworkId: request.wallet.networkId,
        },
        neededStakingKeyHashes: neededKeys,
      });
      return result;
    } catch (error) {
      Logger.error(
        `${nameof(AdaApi)}::${nameof(this.createWithdrawalTx)} error: ` + stringifyError(error)
      );
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async createSimpleTx(
    request: CreateSimpleTxRequest,
  ): Promise<HaskellShelleyTxSignRequest> {
    Logger.debug(`${nameof(AdaApi)}::${nameof(this.createSimpleTx)} called`);

    try {
      const fullConfig = getCardanoHaskellBaseConfig(getNetworkById(request.publicDeriver.networkId));
      const config = fullConfig.reduce((acc, next) => Object.assign(acc, next), {});

      const protocolParams = {
        keyDeposit: config.KeyDeposit,
        linearFeeCoefficient: config.LinearFee.coefficient,
        linearFeeConstant: config.LinearFee.constant,
        coinsPerUtxoWord: config.CoinsPerUtxoWord,
        poolDeposit: config.PoolDeposit,
        networkId: request.publicDeriver.networkId,
      };

      const addressedUtxo = asAddressedUtxo(request.publicDeriver.utxos);
      const changeAddr = request.publicDeriver.receiveAddress;
      const absSlotNumber = new BigNumber(TimeUtils.timeToAbsoluteSlot(fullConfig, new Date()));

      const unsignedTx = await shelleyNewAdaUnsignedTx(
        request.entries,
        {
          address: changeAddr.addr.Hash,
          addressing: changeAddr.addressing,
        },
        addressedUtxo,
        absSlotNumber,
        protocolParams,
        [],
        [],
        false,
        request.metadata,
      );

      return new HaskellShelleyTxSignRequest({
        senderUtxos: unsignedTx.senderUtxos,
        unsignedTx: unsignedTx.txBuilder,
        changeAddr: unsignedTx.changeAddr,
        metadata: request.metadata,
        networkSettingSnapshot: {
          ChainNetworkId: Number.parseInt(config.ChainNetworkId, 10),
          KeyDeposit: new BigNumber(config.KeyDeposit),
          PoolDeposit: new BigNumber(config.PoolDeposit),
          NetworkId: request.publicDeriver.networkId,
        },
        neededStakingKeyHashes: {
          neededHashes: new Set(),
          wits: new Set(),
        },
        trezorTCatalystRegistrationTxSignData: undefined,
        ledgerNanoCatalystRegistrationTxSignData: undefined,
      });
    } catch (error) {
      Logger.error(`${nameof(AdaApi)}::${nameof(this.createSimpleTx)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }

  }

  async createVotingRegTx(
    request: CreateVotingRegTxRequest
  ): Promise<CreateVotingRegTxResponse> {
    Logger.debug(`${nameof(AdaApi)}::${nameof(this.createVotingRegTx)} called`);

    try {
      const config = getCardanoHaskellBaseConfig(
        getNetworkById(request.wallet.networkId)
      ).reduce((acc, next) => Object.assign(acc, next), {});

      const protocolParams = {
        keyDeposit: config.KeyDeposit,
        linearFeeCoefficient: config.LinearFee.coefficient,
        linearFeeConstant: config.LinearFee.constant,
        coinsPerUtxoWord: config.CoinsPerUtxoWord,
        poolDeposit: config.PoolDeposit,
        networkId: request.wallet.networkId,
      };

      const allUtxo = await request.wallet.utxos;
      const addressedUtxo = asAddressedUtxo(allUtxo);
      const changeAddr = request.wallet.receiveAddress;
      if (changeAddr == null) {
        throw new Error(`${nameof(this.createVotingRegTx)} no internal addresses left. Should never happen`);
      }
      let trxMetadata;
      if (request.trezorTWallet || request.ledgerNanoWallet) {
        // Pass a placeholder metadata so that the tx fee is correctly
        // calculated.
        const hwWallet = request.trezorTWallet || request.ledgerNanoWallet;
        trxMetadata = generateRegistrationMetadata(
          hwWallet.votingPublicKey,
          hwWallet.stakingKey,
          hwWallet.paymentAddress,
          hwWallet.nonce,
          (_hashedMetadata) => {
            return '0'.repeat(64 * 2)
          },
        );
      } else {
        // Mnemonic wallet
        trxMetadata = request.normalWallet.metadata;
      }

      const unsignedTx = await shelleyNewAdaUnsignedTx(
        [],
        {
          address: changeAddr.addr.Hash,
          addressing: changeAddr.addressing,
        },
        addressedUtxo,
        request.absSlotNumber,
        protocolParams,
        [],
        [],
        false,
        trxMetadata,
      );

      return new HaskellShelleyTxSignRequest({
        senderUtxos: unsignedTx.senderUtxos,
        unsignedTx: unsignedTx.txBuilder,
        changeAddr: unsignedTx.changeAddr,
        metadata: trxMetadata,
        networkSettingSnapshot: {
          ChainNetworkId: Number.parseInt(config.ChainNetworkId, 10),
          KeyDeposit: new BigNumber(config.KeyDeposit),
          PoolDeposit: new BigNumber(config.PoolDeposit),
          NetworkId: request.wallet.networkId,
        },
        neededStakingKeyHashes: {
          neededHashes: new Set(),
          wits: new Set(),
        },
        trezorTCatalystRegistrationTxSignData:
          request.trezorTWallet ? request.trezorTWallet : undefined,
        ledgerNanoCatalystRegistrationTxSignData:
          request.ledgerNanoWallet ? request.ledgerNanoWallet: undefined,
      });
    } catch (error) {
      Logger.error(`${nameof(AdaApi)}::${nameof(this.createVotingRegTx)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  /** Note: This method is exposed to allow injecting data when testing */
  async saveLastReceiveAddressIndex(
    request: SaveLastReceiveAddressIndexRequest
  ): Promise<SaveLastReceiveAddressIndexResponse> {
    Logger.debug(`${nameof(AdaApi)}::${nameof(this.saveLastReceiveAddressIndex)} called`);
    try {
      // note: it's better to take a DisplayCutoff as a parameter to the function directly
      // but this would be kind of ugly to do from the test code
      // so we just pass a public deriver instead
      const withDisplayCutoff = asDisplayCutoff(request.publicDeriver);
      if (withDisplayCutoff == null) return;
      await withDisplayCutoff.setCutoff({
        newIndex: request.index
      });
    } catch (error) {
      Logger.error(`${nameof(AdaApi)}::${nameof(this.saveLastReceiveAddressIndex)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  static isValidMnemonic(
    request: IsValidMnemonicRequest,
  ): IsValidMnemonicResponse {
    return isValidBip39Mnemonic(request.mnemonic, request.numberOfWords);
  }

  generateWalletRecoveryPhrase(): Promise<GenerateWalletRecoveryPhraseResponse> {
    Logger.debug(`${nameof(AdaApi)}::${nameof(this.generateWalletRecoveryPhrase)} called`);
    try {
      const response = new Promise(
        resolve => resolve(generateAdaMnemonic())
      );
      Logger.debug(`${nameof(AdaApi)}::${nameof(this.generateWalletRecoveryPhrase)} success`);
      return response;
    } catch (error) {
      Logger.error(
        `${nameof(AdaApi)}::${nameof(this.generateWalletRecoveryPhrase)} error: ` + stringifyError(error)
      );
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  /**
   * Creates wallet and saves result to DB
  */
  async restoreWallet(
    request: RestoreWalletRequest
  ): Promise<RestoreWalletResponse> {
    Logger.debug(`${nameof(AdaApi)}::${nameof(this.restoreWallet)} called`);
    const { recoveryPhrase, walletName, walletPassword, } = request;

    if (request.accountIndex < HARD_DERIVATION_START) {
      throw new Error(`${nameof(this.restoreWallet)} needs hardened index`);
    }
    try {
      // Note: we only restore for 0th account
      const rootPk = generateWalletRootKey(recoveryPhrase);
      const newPubDerivers = [];
      const wallet = await createStandardCip1852Wallet({
        db: request.db,
        rootPk,
        password: walletPassword,
        accountIndex: request.accountIndex,
        walletName,
        accountName: '', // set account name empty now
        network: request.network,
      });
      const cip1852Wallet = await Cip1852Wallet.createCip1852Wallet(
        request.db,
        wallet.cip1852WrapperRow,
      );
      for (const pubDeriver of wallet.publicDeriver) {
        newPubDerivers.push(await PublicDeriver.createPublicDeriver(
          pubDeriver.publicDeriverResult,
          cip1852Wallet,
        ));
      }
      Logger.debug(`${nameof(AdaApi)}::${nameof(this.restoreWallet)} success`);
      return {
        publicDerivers: newPubDerivers,
      };
    } catch (error) {
      Logger.error(`${nameof(AdaApi)}::${nameof(this.restoreWallet)} error: ` + stringifyError(error));
      // TODO: handle case where wallet already exists (this if case is never hit)
      if (error.message != null && error.message.includes('Wallet with that mnemonics already exists')) {
        throw new WalletAlreadyRestoredError();
      }

      // Refer: https://github.com/Emurgo/yoroi-frontend/pull/1055
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  /**
   * Restore all addresses like restoreWallet() but do not touch storage.
   */
  // <TODO:PENDING_REMOVAL> paper
  async restoreWalletForTransfer(
    request: RestoreWalletForTransferRequest
  ): Promise<RestoreWalletForTransferResponse> {
    Logger.debug(`${nameof(AdaApi)}::${nameof(this.restoreWalletForTransfer)} called`);
    const { checkAddressesInUse } = request;

    const config = getCardanoHaskellBaseConfig(
      request.network
    ).reduce((acc, next) => Object.assign(acc, next), {});

    try {
      // need this to persist outside the scope of the hashToIds lambda
      // since the lambda is called multiple times
      // and we need keep a globally unique index
      const reverseAddressLookup = new Map<number, Array<string>>();
      const foundAddresses = new Set<string>();

      const addByHash = (address) => {
        if (!foundAddresses.has(address.address.data)) {
          let family = reverseAddressLookup.get(address.keyDerivationId);
          if (family == null) {
            family = [];
            reverseAddressLookup.set(address.keyDerivationId, family);
          }
          family.push(address.address.data);
          foundAddresses.add(address.address.data);
        }
        return Promise.resolve();
      };

      const key = RustModule.WalletV2.Bip44AccountPublic.new(
        v4PublicToV2(request.accountPubKey),
        RustModule.WalletV2.DerivationScheme.v2(),
      );
      const insertTree = await scanBip44Account({
        network: request.network,
        generateInternalAddresses: v2genAddressBatchFunc(
          key.bip44_chain(false),
          config.ByronNetworkId,
        ),
        generateExternalAddresses: v2genAddressBatchFunc(
          key.bip44_chain(true),
          config.ByronNetworkId,
        ),
        lastUsedInternal: -1,
        lastUsedExternal: -1,
        checkAddressesInUse,
        addByHash,
        type: CoreAddressTypes.CARDANO_LEGACY,
      });
      const flattenedTree = flattenInsertTree(insertTree);

      const addressResult = [];
      for (let i = 0; i < flattenedTree.length; i++) {
        const leaf = flattenedTree[i];
        // triggers the insert
        await leaf.insert({
          // this is done in-memory so no need for a real DB
          db: (null: any),
          tx: (null: any),
          lockedTables: [],
          keyDerivationId: i
        });
        const family = reverseAddressLookup.get(i);
        if (family == null) throw new Error(`${nameof(this.restoreWalletForTransfer)} should never happen`);
        const result = family.map(address => ({
          address,
          addressing: {
            startLevel: Bip44DerivationLevels.ACCOUNT.level,
            path: [request.accountIndex].concat(leaf.path),
          },
        }));
        addressResult.push(...result);
      }

      Logger.debug(`${nameof(this.restoreWalletForTransfer)} success`);

      return {
        addresses: addressResult,
      };
    } catch (error) {
      Logger.error(`${nameof(this.restoreWalletForTransfer)} error: ` + stringifyError(error));
      // TODO: backend will return something different here, if multiple wallets
      // are restored from the key and if there are duplicate wallets we will get
      // some kind of error and present the user with message that some wallets
      // where not imported/restored if some where. if no wallets are imported
      // we will error out completely with throw block below
      // TODO: use error ID instead of error message
      if (error.message != null && error.message.includes('Wallet with that mnemonics already exists')) {
        throw new WalletAlreadyRestoredError();
      }
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async transferToCip1852(
    request: TransferToCip1852Request
  ): Promise<TransferToCip1852Response> {
    try {
      const bip44Addresses = await this.restoreWalletForTransfer({
        accountPubKey: request.bip44AccountPubKey,
        accountIndex: request.accountIndex,
        checkAddressesInUse: request.checkAddressesInUse,
        network: request.network,
      });

      const firstInternalPayment = request
        .cip1852AccountPubKey
        .derive(ChainDerivations.INTERNAL)
        .derive(0)
        .to_raw_key()
        .hash();
      const stakingKey = request
        .cip1852AccountPubKey
        .derive(ChainDerivations.CHIMERIC_ACCOUNT)
        .derive(0)
        .to_raw_key()
        .hash();

      const config = getCardanoHaskellBaseConfig(
        request.network
      ).reduce((acc, next) => Object.assign(acc, next), {});

      const chainNetworkId = Number.parseInt(config.ChainNetworkId, 10);
      const receiveAddress = RustModule.WalletV4.BaseAddress.new(
        chainNetworkId,
        RustModule.WalletV4.Credential.from_keyhash(firstInternalPayment),
        RustModule.WalletV4.Credential.from_keyhash(stakingKey),
      );

      const addresses = [
        ...bip44Addresses.addresses,
      ].map(address => ({
        address: address.address,
        addressing: {
          // add the missing addressing information
          path: [WalletTypePurpose.BIP44, CoinTypes.CARDANO, ...address.addressing.path],
          startLevel: Bip44DerivationLevels.PURPOSE.level,
        }
      }));
      const utxos = await toSenderUtxos({
        network: request.network,
        addresses,
        getUTXOsForAddresses: request.getUTXOsForAddresses,
      });

      return {
        publicKey: {
          key: request.bip44AccountPubKey,
          addressing: {
            startLevel: 1,
            path: [
              WalletTypePurpose.CIP1852,
              CoinTypes.CARDANO,
              request.accountIndex,
            ],
          },
        },
        signRequest: await this.createUnsignedTxForUtxos({
          absSlotNumber: request.absSlotNumber,
          receivers: [{
            address: Buffer.from(receiveAddress.to_address().to_bytes()).toString('hex'),
            addressing: {
              path: [
                WalletTypePurpose.CIP1852,
                CoinTypes.CARDANO,
                request.accountIndex,
                ChainDerivations.INTERNAL,
                0,
              ],
              startLevel: 1,
            },
          }],
          network: request.network,
          defaultToken: {
            defaultIdentifier: request.defaultToken.Identifier,
            defaultNetworkId: request.defaultToken.NetworkId,
          },
          tokens: [{
            // note: sending all of the default token will cause UTXOs to be consumed
            shouldSendAll: true,
            token: request.defaultToken,
          }],
          utxos,
          metadata: undefined,
        })
      };
    } catch (error) {
      Logger.error(`${nameof(this.transferToCip1852)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async createHardwareWallet(
    request: CreateHardwareWalletRequest
  ): Promise<CreateHardwareWalletResponse> {
    try {
      Logger.debug(`${nameof(AdaApi)}::${nameof(this.createHardwareWallet)} called`);
      if (request.addressing.startLevel !== Bip44DerivationLevels.PURPOSE.level) {
        throw new Error(`${nameof(AdaApi)}::${nameof(this.createHardwareWallet)} bad addressing start level`);
      }
      if (request.addressing.path[0] !== WalletTypePurpose.CIP1852) {
        throw new Error(`${nameof(this.createHardwareWallet)} unknown restoration mode`);
      }
      const wallet = await createHardwareCip1852Wallet({
        db: request.db,
        accountPublicKey: RustModule.WalletV4.Bip32PublicKey.from_bytes(
          Buffer.from(request.publicKey, 'hex')
        ),
        accountIndex: request.addressing.path[
        Bip44DerivationLevels.ACCOUNT.level - request.addressing.startLevel
          ],
        walletName: request.walletName,
        accountName: '',
        hwWalletMetaInsert: request.hwFeatures,
        network: request.network,
      });

      const cip1852Wallet = await Cip1852Wallet.createCip1852Wallet(
        request.db,
        wallet.cip1852WrapperRow,
      );

      if (wallet.publicDeriver.length !== 1) {
        throw new Error(`${nameof(AdaApi)}::${nameof(this.createHardwareWallet)} should only do 1 HW derivation at a time`);
      }
      const pubDeriverResult = wallet.publicDeriver[0].publicDeriverResult;
      const newPubDeriver = await PublicDeriver.createPublicDeriver(
        pubDeriverResult,
        cip1852Wallet,
      );
      Logger.debug(`${nameof(AdaApi)}::${nameof(this.restoreWallet)} success`);
      return {
        publicDeriver: newPubDeriver,
      };
    } catch (error) {
      Logger.error(`${nameof(AdaApi)}::${nameof(this.createHardwareWallet)} error: ` + stringifyError(error));

      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  // noinspection JSMethodCanBeStatic
  // TODO: https://github.com/Emurgo/yoroi-frontend/pull/222
  async getTransactionRowsToExport(
    request: GetTransactionRowsToExportRequest
  ): Promise<GetTransactionRowsToExportResponse> {
    try {
      const fetchedTxs = await getAllTransactions({
        publicDeriver: request.publicDeriver,
      });
      Logger.debug(`${nameof(AdaApi)}::${nameof(this.getTransactionRowsToExport)}: success`);
      return convertAdaTransactionsToExportRows(
        fetchedTxs.txs,
        request.getDefaultToken(request.publicDeriver.getParent().getNetworkInfo().NetworkId)
      );
    } catch (error) {
      Logger.error(`${nameof(AdaApi)}::${nameof(this.getTransactionRowsToExport)}: ` + stringifyError(error));

      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  utxosWithSubmittedTxs(
    originalUtxos: Array<RemoteUnspentOutput>,
    publicDeriverId: number,
    submittedTxs: Array<PersistedSubmittedTransaction>,
  ): Array<RemoteUnspentOutput> {
    const filteredSubmittedTxs = submittedTxs.filter(
      submittedTxRecord => submittedTxRecord.publicDeriverId === publicDeriverId
    );
    const usedUtxoIds = new Set(
      filteredSubmittedTxs.flatMap(({ usedUtxos }) =>
        (usedUtxos || []).map(({ txHash, index }) => `${txHash}${index}`)
      )
    );
    // take out UTxOs consumed by submitted transactions
    const utxos = originalUtxos.filter(utxo => !usedUtxoIds.has(utxo.utxo_id));
    // put in UTxOs produced by submitted transactions
    for (const { transaction } of filteredSubmittedTxs) {
      for (const [index, { address, value }] of transaction.addresses.to.entries()) {
        if (utxos.find(utxo => utxo.utxo_id === `${transaction.txid}${index}`)) {
          // this output is already included
          continue;
        }

        const amount =  value.values.find(
          ({ identifier }) => identifier === value.defaults.defaultIdentifier
        )?.amount.toString() || '0';
        const assets = value.values
          .filter(({ identifier }) => identifier !== value.defaults.defaultIdentifier)
          .map(v => {
            const [policyId, name = ''] = v.identifier.split('.');
            return {
              policyId,
              name,
              amount: v.amount.toString(),
              assetId: v.identifier,
            };
          });
        utxos.push({
          utxo_id: `${transaction.txid}${index}`,
          tx_hash: transaction.txid,
          tx_index: index,
          receiver: address,
          amount,
          assets,
        });
      }
    }
    return utxos;
  }

  async addressedUtxosWithSubmittedTxs(
    originalUtxos: Array<CardanoAddressedUtxo>,
    publicDeriver: PublicDeriver<>,
    submittedTxs: Array<PersistedSubmittedTransaction>,
  ): Promise<Array<CardanoAddressedUtxo>> {
    const withUtxos = asGetAllUtxos(publicDeriver);
    if (!withUtxos) {
      throw new Error('unable to get UTxO addresses from public deriver');
    }
    const allUtxoAddresses = await withUtxos.getAllUtxoAddresses();

    return this._addressedUtxosWithSubmittedTxs(
      originalUtxos,
      publicDeriver.publicDeriverId,
      allUtxoAddresses,
      submittedTxs
    );
  }

  // fixme: refactor this tmp function
  async _addressedUtxosWithSubmittedTxs(
    originalUtxos: Array<CardanoAddressedUtxo>,
    publicDeriverId: number,
    allUtxoAddresses: IGetAllUtxoAddressesResponse,
    submittedTxs: Array<PersistedSubmittedTransaction>,
  ): Promise<Array<CardanoAddressedUtxo>> {
    const filteredSubmittedTxs = submittedTxs.filter(
      submittedTxRecord => submittedTxRecord.publicDeriverId === publicDeriverId
    );
    const usedUtxoIds = new Set(
      filteredSubmittedTxs.flatMap(({ usedUtxos }) =>
        (usedUtxos || []).map(({ txHash, index }) => `${txHash}${index}`)
      )
    );
    // take out UTxOs consumed by submitted transactions
    const utxos = originalUtxos.filter(utxo => !usedUtxoIds.has(utxo.utxo_id));
    // put in UTxOs produced by submitted transactions
    for (const { transaction } of filteredSubmittedTxs) {
      for (const [index, { address, value }] of transaction.addresses.to.entries()) {
        if (utxos.find(utxo => utxo.utxo_id === `${transaction.txid}${index}`)) {
          // this output is already included
          continue;
        }

        const amount =  value.values.find(
          ({ identifier }) => identifier === value.defaults.defaultIdentifier
        )?.amount.toString() || '0';
        const assets = value.values
          .filter(({ identifier }) => identifier !== value.defaults.defaultIdentifier)
          .map(v => {
            const [policyId, name = ''] = v.identifier.split('.');
            return {
              policyId,
              name,
              amount: v.amount.toString(),
              assetId: v.identifier,
            };
          });
        const findAddressing = () => {
          for (const { addrs, addressing } of allUtxoAddresses) {
            for (const { Hash } of addrs) {
              if (Hash === address) {
                return addressing;
              }
            }
          }
        };
        const addressing = findAddressing();
        if (addressing) {
          utxos.push({
            utxo_id: `${transaction.txid}${index}`,
            tx_hash: transaction.txid,
            tx_index: index,
            receiver: address,
            amount,
            assets,
            addressing,
          });
        } // else { should not happen }
      }
    }
    return utxos;
  }

  async getAllUsedAddresses(
    wallet: PublicDeriver<>,
    submittedTransactions: Array<PersistedSubmittedTransaction>,
  ): Promise<string[]> {
    const allAddresses  = await getAllAddressesForWallet(wallet);
    return this._getAllUsedAddresses({
      allAddresses,
      submittedTransactions,
      publicDeriverId: wallet.getPublicDeriverId(),
    });

  }

  async _getAllUsedAddresses(wallet: {
    publicDeriverId: number,
    +allAddresses: { utxoAddresses: Array<$ReadOnly<AddressRowWithPath>>, ... },
    submittedTransactions: Array<PersistedSubmittedTransaction>,
    ...
  }): Promise<string[]> {
    const usedAddresses = wallet.allAddresses.utxoAddresses.filter(a => a.address.IsUsed).map(
      a => a.address.Hash
    );
    const unusedAddresses = wallet.allAddresses.utxoAddresses.filter(a => !a.address.IsUsed).map(
      a => a.address.Hash
    );

    const outputAddressesInSubmittedTxs = new Set(
      wallet.submittedTransactions
        .filter(submittedTxRecord => submittedTxRecord.publicDeriverId === wallet.publicDeriverId)
        .flatMap(({ transaction }) => {
          return transaction.addresses.to.map(({ address }) => address);
        })
    );
    const usedInSubmittedTxs = unusedAddresses.filter(
      address => outputAddressesInSubmittedTxs.has(address)
    );
    return [...usedAddresses, ...usedInSubmittedTxs];
  }

  async createReorgTx(
    publicDeriver: PublicDeriver<>,
    usedUtxoIds: Array<string>,
    reorgTargetAmount: string,
    utxos: Array<CardanoAddressedUtxo>,
    submittedTxs: Array<PersistedSubmittedTransaction>,
    reorgTargetAddress?: string,
  ): Promise<{|
    unsignedTx: HaskellShelleyTxSignRequest,
    collateralOutputAddressSet: Set<string>,
  |}> {
    const network = publicDeriver.getParent().getNetworkInfo();

    const withUtxos = asGetAllUtxos(publicDeriver);
    if (withUtxos == null) {
      throw new Error(`missing utxo functionality`);
    }

    const withHasUtxoChains = asHasUtxoChains(withUtxos);
    if (withHasUtxoChains == null) {
      throw new Error(`missing chains functionality`);
    }

    const receiveAddress = await getReceiveAddress(publicDeriver);
    if (receiveAddress == null) {
      throw new Error(`no receive addresses. Should never happen`);
    }

    const usedAddresses = await this.getAllUsedAddresses(publicDeriver, submittedTxs);
    const targetAddress = reorgTargetAddress || usedAddresses[0];
    if (!targetAddress) {
      throw new Error('unexpected: no target address or used addresses available');
    }

    return this._createReorgTx(
      network,
      publicDeriver.getParent().getDefaultToken(),
      publicDeriver.getPublicDeriverId(),
      await withUtxos.getAllUtxoAddresses(),
      receiveAddress,
      usedUtxoIds,
      reorgTargetAmount,
      utxos,
      submittedTxs,
      targetAddress,
    );
  }

  async _createReorgTx(
    network: $ReadOnly<NetworkRow>,
    defaultToken: DefaultTokenEntry,
    publicDeriverId: number,
    allUtxoAddresses: IGetAllUtxoAddressesResponse,
    receiveAddress: BaseSingleAddressPath,
    usedUtxoIds: Array<string>,
    reorgTargetAmount: string,
    utxos: Array<CardanoAddressedUtxo>,
    submittedTxs: Array<PersistedSubmittedTransaction>,
    targetAddress: string,
  ): Promise<{|
    unsignedTx: HaskellShelleyTxSignRequest,
    collateralOutputAddressSet: Set<string>,
  |}> {
    const fullConfig = getCardanoHaskellBaseConfig(network);
    const absSlotNumber = new BigNumber(TimeUtils.timeToAbsoluteSlot(fullConfig, new Date()));
    const dontUseUtxoIds = new Set(usedUtxoIds);

    const reorgOutputValue = BigNumber
      .max(reorgTargetAmount, MIN_REORG_OUTPUT_AMOUNT)
      .toString();
    const includeTargets = [{
      address: targetAddress,
      isForeign: false,
      value: reorgOutputValue,
    }];

    const unsignedTx = await this._createUnsignedTxForConnector(
      { includeTargets, },
      defaultToken,
      publicDeriverId,
      allUtxoAddresses,
      receiveAddress,
      network,
      absSlotNumber,
      submittedTxs,
      (await this._addressedUtxosWithSubmittedTxs(
        utxos,
        publicDeriverId,
        allUtxoAddresses,
        submittedTxs,
      )).filter(utxo => !dontUseUtxoIds.has(utxo.utxo_id)),
      null,
    );

    const collateralOutputAddressSet = new Set<string>([targetAddress]);

    return { unsignedTx, collateralOutputAddressSet };
  }
}
// ========== End of class AdaApi =========

/**
 * Sending the transaction may affect the amount delegated in a few ways:
 * 1) The transaction fee for the transaction
 *  - may be paid with UTXO that either does or doesn't belong to our staking key.
 * 2) The change for the transaction
 *  - may get turned into a group address for our staking key
 */
function getDifferenceAfterTx(
  utxoResponse: V4UnsignedTxAddressedUtxoResponse,
  allUtxos: IGetAllUtxosResponse,
  stakingKey: RustModule.WalletV4.PublicKey,
  defaultToken: DefaultTokenEntry,
): MultiToken {

  const accountKeyString = RustModule.WasmScope(Scope => {
    const stakeCredential = Scope.WalletV4.Credential.from_keyhash(stakingKey.hash());
    return Buffer.from(stakeCredential.to_bytes()).toString('hex')
  })

  const sumInForKey = new MultiToken([], defaultToken);
  {
    // note senderUtxos.length is approximately 1
    // since it's just to cover transaction fees
    // so this for loop is faster than building a map
    for (const senderUtxo of utxoResponse.senderUtxos) {
      const match = allUtxos.find(utxo => (
        utxo.output.Transaction.Hash === senderUtxo.tx_hash &&
        utxo.output.UtxoTransactionOutput.OutputIndex === senderUtxo.tx_index
      ));
      if (match == null) {
        throw new Error(`${nameof(getDifferenceAfterTx)} utxo not found. Should not happen`);
      }
      const address = match.address;
      if (addrContainsAccountKey(address, accountKeyString, true)) {
        sumInForKey.joinAddMutable(new MultiToken(
          match.output.tokens.map(token => ({
            identifier: token.Token.Identifier,
            amount: new BigNumber(token.TokenList.Amount),
            networkId: token.Token.NetworkId,
          })),
          defaultToken
        ));
      }
    }
  }

  const sumOutForKey = new MultiToken([], defaultToken);
  {
    const txBody = utxoResponse.txBuilder.build();
    const outputs = txBody.outputs();
    for (let i = 0; i < outputs.len(); i++) {
      const output = outputs.get(i);
      const address = Buffer.from(output.address().to_bytes()).toString('hex');
      if (addrContainsAccountKey(address, accountKeyString, true)) {
        sumOutForKey.joinAddMutable(multiTokenFromCardanoValue(output.amount(), defaultToken));
      }
    }
  }

  return sumOutForKey.joinSubtractCopy(sumInForKey);
}

export async function genOwnStakingKey(request: {|
  publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels> & IGetSigningKey & IGetStakingKey,
  password: string,
|}): Promise<RustModule.WalletV4.PrivateKey> {
  try {
    const signingKeyFromStorage = await request.publicDeriver.getSigningKey();
    const stakingAddr = await request.publicDeriver.getStakingKey();
    const normalizedKey = await request.publicDeriver.normalizeKey({
      ...signingKeyFromStorage,
      password: request.password,
    });
    const normalizedSigningKey = RustModule.WalletV4.Bip32PrivateKey.from_bytes(
      Buffer.from(normalizedKey.prvKeyHex, 'hex')
    );
    const normalizedStakingKey = derivePrivateByAddressing({
      addressing: stakingAddr.addressing,
      startingFrom: {
        key: normalizedSigningKey,
        level: request.publicDeriver.getParent().getPublicDeriverLevel(),
      },
    }).to_raw_key();

    return normalizedStakingKey;
  } catch (error) {
    Logger.error(`${nameof(genOwnStakingKey)} error: ` + stringifyError(error));
    if (error instanceof WrongPassphraseError) {
      throw new IncorrectWalletPasswordError();
    }
    if (error instanceof LocalizableError) throw error;
    throw new GenericApiError();
  }
}
