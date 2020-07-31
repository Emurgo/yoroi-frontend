// @flow
import moment from 'moment';
import BigNumber from 'bignumber.js';
import type { lf$Database } from 'lovefield';
import {
  Logger,
  stringifyError,
  stringifyData
} from '../../utils/logging';
import CardanoByronTransaction from '../../domain/CardanoByronTransaction';
import CardanoShelleyTransaction from '../../domain/CardanoShelleyTransaction';
import {
  HARD_DERIVATION_START,
  WalletTypePurpose,
  CoinTypes,
} from '../../config/numbersConfig';
import type {
  TransferSourceType,
} from '../../types/TransferTypes';
import {
  TransferSource,
} from '../../types/TransferTypes';
import type {
  Network,
} from '../../../config/config-types';
import {
  createStandardBip44Wallet, createHardwareWallet,
} from './lib/storage/bridge/walletBuilder/byron';
import {
  createStandardCip1852Wallet,
} from './lib/storage/bridge/walletBuilder/shelley';
import {
  getPendingTransactions,
  getAllTransactions,
  updateTransactions,
  removeAllTransactions,
  getForeignAddresses,
} from './lib/storage/bridge/updateTransactions';
import {
  Bip44Wallet,
} from './lib/storage/models/Bip44Wallet/wrapper';
import {
  Cip1852Wallet,
} from './lib/storage/models/Cip1852Wallet/wrapper';
import type { HWFeatures, } from './lib/storage/database/walletTypes/core/tables';
import {
  flattenInsertTree,
  Bip44DerivationLevels,
} from './lib/storage/database/walletTypes/bip44/api/utils';
import type { CoreAddressT } from './lib/storage/database/primitives/enums';
import { TransactionType } from './lib/storage/database/primitives/tables';
import {
  PublicDeriver,
} from './lib/storage/models/PublicDeriver/index';
import {
  asDisplayCutoff,
} from './lib/storage/models/PublicDeriver/traits';
import { ConceptualWallet } from './lib/storage/models/ConceptualWallet/index';
import type { IHasLevels } from './lib/storage/models/ConceptualWallet/interfaces';
import type {
  IPublicDeriver,
  IGetAllUtxos,
  IGetSigningKey,
  IDisplayCutoff,
  IGetAllUtxosResponse,
  IHasUtxoChains, IHasUtxoChainsRequest,
  IGetPublicResponse,
  Address, Addressing, UsedStatus, Value,
} from './lib/storage/models/PublicDeriver/interfaces';
import type {
  BaseGetTransactionsRequest,
  GetTransactionsResponse,
  GetTransactionsRequestOptions,
  RefreshPendingTransactionsRequest, RefreshPendingTransactionsResponse,
  RemoveAllTransactionsRequest, RemoveAllTransactionsResponse,
  GetForeignAddressesRequest, GetForeignAddressesResponse,
} from '../common/index';
import {
  sendAllUnsignedTx as shelleySendAllUnsignedTx,
  newAdaUnsignedTx as shelleyNewAdaUnsignedTx,
  asAddressedUtxo as shelleyAsAddressedUtxo,
  signTransaction as shelleySignTransaction,
} from './transactions/shelley/transactions';
import {
  generateWalletRootKey,
  generateAdaMnemonic,
} from './lib/cardanoCrypto/cryptoWallet';
import {
  v4PublicToV2,
} from './lib/cardanoCrypto/utils';
import {
  isValidBip39Mnemonic,
} from '../common/lib/crypto/wallet';
import { generateByronPlate } from './lib/cardanoCrypto/plate';
import {
  scramblePaperAdaMnemonic,
  isValidEnglishAdaPaperMnemonic,
  unscramblePaperAdaMnemonic,
} from './lib/cardanoCrypto/paperWallet';
import type {
  LedgerSignTxPayload,
} from '../../domain/HWSignTx';
import Notice from '../../domain/Notice';
import type { CardanoSignTransaction } from 'trezor-connect/lib/types/networks/cardano';
// import {
//   createTrezorSignTxPayload,
//   broadcastTrezorSignedTx,
//   createLedgerSignTxPayload,
//   prepareAndBroadcastLedgerSignedTx,
// } from './transactions/byron/hwTransactions';
import {
  GenericApiError,
  IncorrectWalletPasswordError,
  WalletAlreadyRestoredError,
  InvalidWitnessError,
  HardwareUnsupportedError,
} from '../common/errors';
import LocalizableError from '../../i18n/LocalizableError';
import { scanBip44Account, } from '../common/lib/restoration/bip44';
import { v2genAddressBatchFunc, } from './restoration/byron/scan';
import type {
  BaseSignRequest,
} from './transactions/types';
import { HaskellShelleyTxSignRequest, } from './transactions/shelley/HaskellShelleyTxSignRequest';
import type {
  SignTransactionResponse as LedgerSignTxResponse
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import { WrongPassphraseError } from './lib/cardanoCrypto/cryptoErrors';

import type {
  HistoryFunc,
  SendFunc,
  SignedResponse,
  TxBodiesFunc,
  BestBlockFunc,
  SignedRequest,
} from './lib/state-fetch/types';
import type {
  FilterFunc,
} from '../common/lib/state-fetch/currencySpecificTypes';
import {
  getChainAddressesForDisplay,
} from './lib/storage/models/utils';
import {
  getAllAddressesForDisplay,
} from './lib/storage/bridge/traitUtils';
import { convertAdaTransactionsToExportRows } from './transactions/utils';
import { generateAdaPaperPdf } from './paperWallet/paperWalletPdf';
import type { PdfGenStepType } from './paperWallet/paperWalletPdf';
import type { TransactionExportRow } from '../export';

import { RustModule } from './lib/cardanoCrypto/rustLoader';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type {
  IsValidMnemonicRequest,
  IsValidMnemonicResponse,
  RestoreWalletRequest, RestoreWalletResponse,
  CreateWalletRequest, CreateWalletResponse,
} from '../common/types';
import { getApiForNetwork } from '../common/utils';
import { CoreAddressTypes } from './lib/storage/database/primitives/enums';
import type { NetworkRow } from './lib/storage/database/primitives/tables';
import {
  getCardanoHaskellBaseConfig,
} from './lib/storage/database/prepackaged/networks';

// ADA specific Request / Response params

// createAdaPaper

export type CreateAdaPaperRequest = {|
  password: string,
  numAddresses?: number,
  network: $ReadOnly<NetworkRow>,
|};
export type AdaPaper = {|
  addresses: Array<string>,
  scrambledWords: Array<string>,
  accountPlate: WalletChecksum,
|};
export type CreateAdaPaperFunc = (
  request: CreateAdaPaperRequest
) => Promise<AdaPaper>;

// createAdaPaperPdf

export type CreateAdaPaperPdfRequest = {|
  paper: AdaPaper,
  network: Network,
  printAccountPlate?: boolean,
  updateStatus?: PdfGenStepType => boolean,
|};

export type CreateAdaPaperPdfResponse = ?Blob;
export type CreateAdaPaperPdfFunc = (
  request: CreateAdaPaperPdfRequest
) => Promise<CreateAdaPaperPdfResponse>;

// getAllAddressesForDisplay

export type GetAllAddressesForDisplayRequest = {|
  publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels> & IGetAllUtxos,
  type: CoreAddressT,
|};
export type GetAllAddressesForDisplayResponse = Array<{|
  ...Address, ...Value, ...Addressing, ...UsedStatus
|}>;
export type GetAllAddressesForDisplayFunc = (
  request: GetAllAddressesForDisplayRequest
) => Promise<GetAllAddressesForDisplayResponse>;

// getChainAddressesForDisplay

export type GetChainAddressesForDisplayRequest = {|
  publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels> & IHasUtxoChains & IDisplayCutoff,
  chainsRequest: IHasUtxoChainsRequest,
  type: CoreAddressT,
|};
export type GetChainAddressesForDisplayResponse = Array<{|
  ...Address, ...Value, ...Addressing, ...UsedStatus
|}>;
export type GetChainAddressesForDisplayFunc = (
  request: GetChainAddressesForDisplayRequest
) => Promise<GetChainAddressesForDisplayResponse>;

// refreshTransactions

export type AdaGetTransactionsRequest = {|
  getTransactionsHistoryForAddresses: HistoryFunc,
  checkAddressesInUse: FilterFunc,
  getBestBlock: BestBlockFunc,
|};

// notices
export type GetNoticesRequestOptions = GetTransactionsRequestOptions;

export type GetNoticesResponse = {|
  notices: Array<Notice>,
  total: number,
|};

export type GetNoticesFunc = (
  request: GetNoticesRequestOptions
) => Promise<GetNoticesResponse>;

// signAndBroadcast

export type SignAndBroadcastRequest = {|
  publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels> & IGetSigningKey,
  signRequest: BaseSignRequest<RustModule.WalletV4.TransactionBuilder>,
  password: string,
  sendTx: SendFunc,
|};
export type SignAndBroadcastResponse = SignedResponse;
export type SignAndBroadcastFunc = (
  request: SignAndBroadcastRequest
) => Promise<SignAndBroadcastResponse>;

// createTrezorSignTxData

export type CreateTrezorSignTxDataRequest = {|
  signRequest: BaseSignRequest<RustModule.WalletV4.TransactionBuilder>,
  getTxsBodiesForUTXOs: TxBodiesFunc,
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
  signRequest: BaseSignRequest<RustModule.WalletV4.TransactionBuilder>,
  getTxsBodiesForUTXOs: TxBodiesFunc,
|};
export type CreateLedgerSignTxDataResponse = {| ledgerSignTxPayload: LedgerSignTxPayload, |};
export type CreateLedgerSignTxDataFunc = (
  request: CreateLedgerSignTxDataRequest
) => Promise<CreateLedgerSignTxDataResponse>;

// prepareAndBroadcastLedgerSignedTx

export type PrepareAndBroadcastLedgerSignedTxRequest = {|
  getPublicKey: () => Promise<IGetPublicResponse>,
  keyLevel: number,
  ledgerSignTxResp: LedgerSignTxResponse,
  unsignedTx: RustModule.WalletV4.TransactionBody,
  sendTx: SendFunc,
|};
export type PrepareAndBroadcastLedgerSignedTxResponse = SignedResponse;
export type PrepareAndBroadcastLedgerSignedTxFunc = (
  request: PrepareAndBroadcastLedgerSignedTxRequest
) => Promise<PrepareAndBroadcastLedgerSignedTxResponse>;

// createUnsignedTx

export type CreateUnsignedTxRequest = {|
  publicDeriver: IPublicDeriver<ConceptualWallet> & IGetAllUtxos & IHasUtxoChains,
  absSlotNumber: BigNumber,
  receiver: string,
  filter: ElementOf<IGetAllUtxosResponse> => boolean,
  ...({|
    amount: string, // in lovelaces
  |} | {|
    shouldSendAll: true,
  |}),
|};
export type CreateUnsignedTxResponse = HaskellShelleyTxSignRequest;

export type CreateUnsignedTxFunc = (
  request: CreateUnsignedTxRequest
) => Promise<CreateUnsignedTxResponse>;

// saveLastReceiveAddressIndex

export type SaveLastReceiveAddressIndexRequest = {|
  publicDeriver: PublicDeriver<>,
  index: number,
|};
export type SaveLastReceiveAddressIndexResponse = void;
export type SaveLastReceiveAddressIndexFunc = (
  request: SaveLastReceiveAddressIndexRequest
) => Promise<SaveLastReceiveAddressIndexResponse>;

// isValidPaperMnemonic

export type IsValidPaperMnemonicRequest = {|
  mnemonic: string,
  numberOfWords: number,
|};
export type IsValidPaperMnemonicResponse = boolean;
export type IsValidPaperMnemonicFunc = (
  request: IsValidPaperMnemonicRequest
) => IsValidPaperMnemonicResponse;

// unscramblePaperMnemonic

export type UnscramblePaperMnemonicRequest = {|
  mnemonic: string,
  numberOfWords: number,
  password?: string,
|};
export type UnscramblePaperMnemonicResponse = [?string, number];
export type UnscramblePaperMnemonicFunc = (
  request: UnscramblePaperMnemonicRequest
) => UnscramblePaperMnemonicResponse;

// generateWalletRecoveryPhrase

export type GenerateWalletRecoveryPhraseRequest = {||};
export type GenerateWalletRecoveryPhraseResponse = Array<string>;
export type GenerateWalletRecoveryPhraseFunc = (
  request: GenerateWalletRecoveryPhraseRequest
) => Promise<GenerateWalletRecoveryPhraseResponse>;

// restoreWalletForTransfer

export type RestoreWalletForTransferRequest = {|
  rootPk: RustModule.WalletV4.Bip32PrivateKey,
  transferSource: TransferSourceType,
  accountIndex: number,
  checkAddressesInUse: FilterFunc,
  network: $ReadOnly<NetworkRow>,
|};
export type RestoreWalletForTransferResponse = {|
  masterKey: string,
  addresses: Array<{| ...Address, ...Addressing |}>,
|};
export type RestoreWalletForTransferFunc = (
  request: RestoreWalletForTransferRequest
) => Promise<RestoreWalletForTransferResponse>;

// createHardwareWallet

export type CreateHardwareWalletRequest = {|
  db: lf$Database,
  walletName: string,
  publicKey: string,
  derivationIndex: number,
  hwFeatures: HWFeatures,
  checkAddressesInUse: FilterFunc,
  network: $ReadOnly<NetworkRow>,
|};
export type CreateHardwareWalletResponse = {|
  bip44Wallet: Bip44Wallet,
  publicDeriver: PublicDeriver<>,
|};
export type CreateHardwareWalletFunc = (
  request: CreateHardwareWalletRequest
) => Promise<CreateHardwareWalletResponse>;

// getTransactionRowsToExport

export type GetTransactionRowsToExportRequest = {|
  publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels>,
|};
export type GetTransactionRowsToExportResponse = Array<TransactionExportRow>;
export type GetTransactionRowsToExportFunc = (
  request: GetTransactionRowsToExportRequest
) => Promise<GetTransactionRowsToExportResponse>;

export const DEFAULT_ADDRESSES_PER_PAPER = 1;

export default class AdaApi {

  // noinspection JSMethodCanBeStatic
  createAdaPaper(
    request: CreateAdaPaperRequest
  ): AdaPaper {
    const words = generateAdaMnemonic();
    const rootPk = generateWalletRootKey(words.join(' '));
    const scrambledWords = scramblePaperAdaMnemonic(
      words.join(' '),
      request.password
    ).split(' ');

    const config = getCardanoHaskellBaseConfig(
      request.network
    ).reduce((acc, next) => Object.assign(acc, next), {});

    const { addresses, accountPlate } = generateByronPlate(
      rootPk,
      0, // paper wallets always use account 0
      request.numAddresses != null ? request.numAddresses : DEFAULT_ADDRESSES_PER_PAPER,
      config.ByronNetworkId
    );
    return { addresses, scrambledWords, accountPlate };
  }

  async createAdaPaperPdf(
    {
      paper,
      network,
      printAccountPlate,
      updateStatus
    }: CreateAdaPaperPdfRequest
  ): Promise<CreateAdaPaperPdfResponse> {
    const { addresses, scrambledWords, accountPlate } = paper;
    // noinspection UnnecessaryLocalVariableJS
    const res : Promise<CreateAdaPaperPdfResponse> = generateAdaPaperPdf({
      words: scrambledWords,
      addresses,
      accountPlate: printAccountPlate === true ? accountPlate : undefined,
      network,
    }, s => {
      Logger.info('[PaperWalletRender] ' + s);
      if (updateStatus) {
        updateStatus(s);
      }
    });
    return res;
  }

  /**
   * addresses get cutoff if there is a DisplayCutoff set
   */
  async getAllAddressesForDisplay(
    request: GetAllAddressesForDisplayRequest
  ): Promise<GetAllAddressesForDisplayResponse> {
    Logger.debug(`${nameof(AdaApi)}::${nameof(this.getAllAddressesForDisplay)} called: ` + stringifyData(request));
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
    Logger.debug(`${nameof(AdaApi)}::${nameof(this.getChainAddressesForDisplay)} called: ` + stringifyData(request));
    try {
      return await getChainAddressesForDisplay(request);
    } catch (error) {
      Logger.error(`${nameof(AdaApi)}::${nameof(this.getChainAddressesForDisplay)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async refreshTransactions(
    request: {|
      ...BaseGetTransactionsRequest,
      ...AdaGetTransactionsRequest,
    |},
  ): Promise<GetTransactionsResponse> {
    Logger.debug(`${nameof(AdaApi)}::${nameof(this.refreshTransactions)} called: ${stringifyData(request)}`);
    const { skip = 0, limit } = request;
    try {
      if (!request.isLocalRequest) {
        await updateTransactions(
          request.publicDeriver.getDb(),
          request.publicDeriver,
          request.checkAddressesInUse,
          request.getTransactionsHistoryForAddresses,
          request.getBestBlock,
        );
      }
      const fetchedTxs = await getAllTransactions({
        publicDeriver: request.publicDeriver,
        skip,
        limit,
      },);
      Logger.debug(`${nameof(AdaApi)}::${nameof(this.refreshTransactions)} success: ` + stringifyData(fetchedTxs));

      const mappedTransactions = fetchedTxs.txs.map(tx => {
        if (tx.txType === TransactionType.CardanoByron) {
          return CardanoByronTransaction.fromAnnotatedTx({
            tx,
            addressLookupMap: fetchedTxs.addressLookupMap,
            api: getApiForNetwork(request.publicDeriver.getParent().getNetworkInfo()),
          });
        }
        if (tx.txType === TransactionType.CardanoShelley) {
          return CardanoShelleyTransaction.fromAnnotatedTx({
            tx,
            addressLookupMap: fetchedTxs.addressLookupMap,
            api: getApiForNetwork(request.publicDeriver.getParent().getNetworkInfo()),
          });
        }
        throw new Error(`${nameof(this.refreshTransactions)} unknown tx type ${tx.type}`);
      });
      return {
        transactions: mappedTransactions,
        total: mappedTransactions.length
      };
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
            api: getApiForNetwork(request.publicDeriver.getParent().getNetworkInfo()),
          });
        }
        if (tx.txType === TransactionType.CardanoShelley) {
          return CardanoShelleyTransaction.fromAnnotatedTx({
            tx,
            addressLookupMap: fetchedTxs.addressLookupMap,
            api: getApiForNetwork(request.publicDeriver.getParent().getNetworkInfo()),
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
      await removeAllTransactions({ publicDeriver: request.publicDeriver });

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

  async getNotices(
    request: GetNoticesRequestOptions
  ): Promise<GetNoticesResponse> {
    Logger.debug(`${nameof(AdaApi)}::${nameof(this.getNotices)} called: ` + stringifyData(request));
    try {
      let next = 0;
      const dummyNotices =  [
        new Notice({ id: (next++).toString(), kind: 2, date: new Date() }),
        new Notice({ id: (next++).toString(), kind: 0, date: moment().subtract(1, 'seconds').toDate() }),
        new Notice({ id: (next++).toString(), kind: 1, date: moment().subtract(5, 'seconds').toDate() }),
        new Notice({ id: (next++).toString(), kind: 2, date: moment().subtract(40, 'seconds').toDate() }),
        new Notice({ id: (next++).toString(), kind: 3, date: moment().subtract(1, 'minutes').toDate() }),
        new Notice({ id: (next++).toString(), kind: 4, date: moment().subtract(2, 'minutes').toDate() }),
        new Notice({ id: (next++).toString(), kind: 5, date: moment().subtract(5, 'minutes').toDate() }),
        new Notice({ id: (next++).toString(), kind: 6, date: moment().subtract(15, 'minutes').toDate() }),
        new Notice({ id: (next++).toString(), kind: 7, date: moment().subtract(30, 'minutes').toDate() }),
        new Notice({ id: (next++).toString(), kind: 7, date: moment().subtract(88, 'minutes').toDate() }),
        new Notice({ id: (next++).toString(), kind: 0, date: moment().subtract(10, 'hours').toDate() }),
        new Notice({ id: (next++).toString(), kind: 3, date: moment().subtract(1, 'days').toDate() }),
        new Notice({ id: (next++).toString(), kind: 4, date: moment().subtract(1, 'days').toDate() }),
        new Notice({ id: (next++).toString(), kind: 1, date: new Date(2019, 11, 5, 10, 15, 20) }),
        new Notice({ id: (next++).toString(), kind: 5, date: new Date(2019, 11, 5, 8, 20, 20) }),
        new Notice({ id: (next++).toString(), kind: 3, date: new Date(2019, 11, 4, 2, 15, 20) }),
        new Notice({ id: (next++).toString(), kind: 7, date: new Date(2019, 11, 4, 10, 40, 20) }),
        new Notice({ id: (next++).toString(), kind: 6, date: new Date(2019, 11, 4, 18, 55, 29) }),
        new Notice({ id: (next++).toString(), kind: 0, date: new Date(2019, 11, 2, 10, 45, 20) }),
        new Notice({ id: (next++).toString(), kind: 7, date: new Date(2019, 11, 1, 10, 18, 20) }),
      ];
      const { skip = 0, limit } = request;
      return {
        notices: dummyNotices.slice(skip, limit),
        total: dummyNotices.length
      };
    } catch (error) {
      Logger.error(`${nameof(AdaApi)}::${nameof(this.getNotices)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async createWallet(
    request: {|
      mode: 'bip44' | 'cip1852',
      ...CreateWalletRequest,
    |},
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
      const signedTx = shelleySignTransaction(
        request.signRequest,
        request.publicDeriver.getParent().getPublicDeriverLevel(),
        RustModule.WalletV4.Bip32PrivateKey.from_bytes(
          Buffer.from(normalizedKey.prvKeyHex, 'hex')
        ),
        undefined,
      );

      const response = request.sendTx({
        id: Buffer.from(
          RustModule.WalletV4.hash_transaction(signedTx.body()).to_bytes()
        ).toString('hex'),
        encodedTx: signedTx.to_bytes(),
      });
      Logger.debug(
        `${nameof(AdaApi)}::${nameof(this.signAndBroadcast)} success: ` + stringifyData(response)
      );
      return response;
    } catch (error) {
      if (error instanceof WrongPassphraseError) {
        throw new IncorrectWalletPasswordError();
      }
      Logger.error(`${nameof(AdaApi)}::${nameof(this.signAndBroadcast)} error: ` + stringifyError(error));
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

      throw new HardwareUnsupportedError();

      // const config = getCardanoHaskellBaseConfig(
      //   request.network
      // ).reduce((acc, next) => Object.assign(acc, next), {});

      // const trezorSignTxPayload = await createTrezorSignTxPayload(
      //   request.signRequest,
      //   request.getTxsBodiesForUTXOs,
      //   config.ByronNetworkId,
      // );
      // Logger.debug(`${nameof(AdaApi)}::${nameof(this.createTrezorSignTxData)} success: ` + stringifyData(trezorSignTxPayload));

      // return {
      //   trezorSignTxPayload,
      // };
    } catch (error) {
      Logger.error(`${nameof(AdaApi)}::${nameof(this.createTrezorSignTxData)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async broadcastTrezorSignedTx(
    request: BroadcastTrezorSignedTxRequest
  ): Promise<BroadcastTrezorSignedTxResponse> {
    Logger.debug(`${nameof(AdaApi)}::${nameof(this.broadcastTrezorSignedTx)} called`);
    try {
      throw new HardwareUnsupportedError();
      // const response = await broadcastTrezorSignedTx(
      //   request.signedTxRequest,
      //   request.sendTx
      // );
      // Logger.debug(`${nameof(AdaApi)}::${nameof(this.broadcastTrezorSignedTx)} success: ` + stringifyData(response));

      // return response;
    } catch (error) {
      Logger.error(`${nameof(AdaApi)}::${nameof(this.broadcastTrezorSignedTx)} error: ` + stringifyError(error));

      if (error instanceof InvalidWitnessError) {
        throw new InvalidWitnessError();
      }

      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async createLedgerSignTxData(
    request: CreateLedgerSignTxDataRequest
  ): Promise<CreateLedgerSignTxDataResponse> {
    try {
      Logger.debug(`${nameof(AdaApi)}::${nameof(this.createLedgerSignTxData)} called`);

      throw new HardwareUnsupportedError();
      // const { signRequest, getTxsBodiesForUTXOs } = request;

      // const ledgerSignTxPayload = await createLedgerSignTxPayload(
      //   signRequest,
      //   getTxsBodiesForUTXOs,
      // );

      // Logger.debug(`${nameof(AdaApi)}::${nameof(this.createLedgerSignTxData)} success: ` + stringifyData(ledgerSignTxPayload));
      // return {
      //   ledgerSignTxPayload,
      // };
    } catch (error) {
      Logger.error(`${nameof(AdaApi)}::${nameof(this.createLedgerSignTxData)} error: ` + stringifyError(error));

      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async prepareAndBroadcastLedgerSignedTx(
    request: PrepareAndBroadcastLedgerSignedTxRequest
  ): Promise<PrepareAndBroadcastLedgerSignedTxResponse> {
    try {
      Logger.debug(`${nameof(AdaApi)}::${nameof(this.prepareAndBroadcastLedgerSignedTx)} called`);

      throw new HardwareUnsupportedError();
      // const publicKeyRow = await request.getPublicKey();
      // if (publicKeyRow.IsEncrypted) {
      //   throw new Error(`${nameof(AdaApi)}::${nameof(this.prepareAndBroadcastLedgerSignedTx)} unexpected encrypted public key`);
      // }
      // const publicKey = RustModule.WalletV2.PublicKey.from_hex(publicKeyRow.Hash);
      // const { ledgerSignTxResp, unsignedTx, sendTx } = request;
      // const response = await prepareAndBroadcastLedgerSignedTx(
      //   ledgerSignTxResp,
      //   unsignedTx,
      //   publicKey,
      //   request.keyLevel,
      //   sendTx,
      // );
      // Logger.debug(`${nameof(AdaApi)}::${nameof(this.prepareAndBroadcastLedgerSignedTx)} success: ` + stringifyData(response));

      // return response;
    } catch (error) {
      Logger.error(`${nameof(AdaApi)}::${nameof(this.prepareAndBroadcastLedgerSignedTx)} error: ` + stringifyError(error));

      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async createUnsignedTx(
    request: CreateUnsignedTxRequest
  ): Promise<CreateUnsignedTxResponse> {
    Logger.debug(`${nameof(AdaApi)}::${nameof(this.createUnsignedTx)} called`);
    const { receiver, } = request;
    try {
      const config = getCardanoHaskellBaseConfig(
        request.publicDeriver.getParent().getNetworkInfo()
      ).reduce((acc, next) => Object.assign(acc, next), {});

      const protocolParams = {
        keyDeposit: RustModule.WalletV4.BigNum.from_str(config.KeyDeposit),
        linearFee: RustModule.WalletV4.LinearFee.new(
          RustModule.WalletV4.BigNum.from_str(config.LinearFee.coefficient),
          RustModule.WalletV4.BigNum.from_str(config.LinearFee.constant),
        ),
        minimumUtxoVal: RustModule.WalletV4.BigNum.from_str(config.MinimumUtxoVal),
        poolDeposit: RustModule.WalletV4.BigNum.from_str(config.PoolDeposit),
      };

      const utxos = await request.publicDeriver.getAllUtxos();
      const filteredUtxos = utxos.filter(utxo => request.filter(utxo));

      const addressedUtxo = shelleyAsAddressedUtxo(filteredUtxos);

      let unsignedTxResponse;
      if (request.shouldSendAll != null) {
        unsignedTxResponse = shelleySendAllUnsignedTx(
          receiver,
          addressedUtxo,
          request.absSlotNumber,
          protocolParams
        );
      } else if (request.amount != null) {
        const amount = request.amount;
        const nextUnusedInternal = await request.publicDeriver.nextInternal();
        if (nextUnusedInternal.addressInfo == null) {
          throw new Error(`${nameof(this.createUnsignedTx)} no internal addresses left. Should never happen`);
        }
        const changeAddr = nextUnusedInternal.addressInfo;
        unsignedTxResponse = shelleyNewAdaUnsignedTx(
          receiver,
          amount,
          {
            address: changeAddr.addr.Hash,
            addressing: changeAddr.addressing,
          },
          addressedUtxo,
          request.absSlotNumber,
          protocolParams
        );
      } else {
        throw new Error(`${nameof(this.createUnsignedTx)} unknown param`);
      }
      Logger.debug(
        `${nameof(AdaApi)}::${nameof(this.createUnsignedTx)} success: ` + stringifyData(unsignedTxResponse)
      );
      return new HaskellShelleyTxSignRequest({
        senderUtxos: unsignedTxResponse.senderUtxos,
        unsignedTx: unsignedTxResponse.txBuilder,
        changeAddr: unsignedTxResponse.changeAddr,
        certificate: undefined,
      });
    } catch (error) {
      Logger.error(
        `${nameof(AdaApi)}::${nameof(this.createUnsignedTx)} error: ` + stringifyError(error)
      );
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

  isValidPaperMnemonic(
    request: IsValidPaperMnemonicRequest
  ): IsValidPaperMnemonicResponse {
    return isValidEnglishAdaPaperMnemonic(request.mnemonic, request.numberOfWords);
  }

  unscramblePaperMnemonic(
    request: UnscramblePaperMnemonicRequest
  ): UnscramblePaperMnemonicResponse {
    return unscramblePaperAdaMnemonic(request.mnemonic, request.numberOfWords, request.password);
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
    request: {|
      mode: 'bip44' | 'cip1852',
      ...RestoreWalletRequest,
    |}
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

      if (request.mode === 'bip44') {
        const wallet = await createStandardBip44Wallet({
          db: request.db,
          rootPk: RustModule.WalletV2.Bip44RootPrivateKey.new(
            RustModule.WalletV2.PrivateKey.from_hex(
              Buffer.from(rootPk.as_bytes()).toString('hex')
            ),
            RustModule.WalletV2.DerivationScheme.v2()
          ),
          password: walletPassword,
          accountIndex: request.accountIndex,
          walletName,
          accountName: '', // set account name empty now
          network: request.network,
        });

        const bip44Wallet = await Bip44Wallet.createBip44Wallet(
          request.db,
          wallet.bip44WrapperRow,
        );
        for (const pubDeriver of wallet.publicDeriver) {
          newPubDerivers.push(await PublicDeriver.createPublicDeriver(
            pubDeriver.publicDeriverResult,
            bip44Wallet,
          ));
        }
      }
      if (request.mode === 'cip1852') {
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
      }

      Logger.debug(`${nameof(AdaApi)}::${nameof(this.restoreWallet)} success`);
      return {
        publicDerivers: newPubDerivers,
      };
    } catch (error) {
      Logger.error(`${nameof(AdaApi)}::${nameof(this.restoreWallet)} error: ` + stringifyError(error));
      // TODO: handle case where wallet already exists (this if case is never hit)
      if (error.message.includes('Wallet with that mnemonics already exists')) {
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
  async restoreWalletForTransfer(
    request: RestoreWalletForTransferRequest
  ): Promise<RestoreWalletForTransferResponse> {
    Logger.debug(`${nameof(AdaApi)}::${nameof(this.restoreWalletForTransfer)} called`);
    const { rootPk, checkAddressesInUse } = request;

    const config = getCardanoHaskellBaseConfig(
      request.network
    ).reduce((acc, next) => Object.assign(acc, next), {});

    try {
      // need this to persist outside the scope of the hashToIds lambda
      // since the lambda is called multiple times
      // and we need keep a globally unique index
      const reverseAddressLookup = new Map<number, Array<string>>();
      const foundAddresses = new Set<string>();

      const sourceIsJormungandrWallet = (
        request.transferSource === TransferSource.JORMUNGANDR_UTXO ||
        request.transferSource === TransferSource.JORMUNGANDR_CHIMERIC_ACCOUNT
      );
      const accountKey = rootPk
        .derive(sourceIsJormungandrWallet
          ? WalletTypePurpose.CIP1852
          : WalletTypePurpose.BIP44)
        .derive(CoinTypes.CARDANO)
        .derive(request.accountIndex);

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

      let insertTree;
      if (request.transferSource === TransferSource.BYRON) {
        const key = RustModule.WalletV2.Bip44AccountPublic.new(
          v4PublicToV2(accountKey.to_public()),
          RustModule.WalletV2.DerivationScheme.v2(),
        );
        insertTree = await scanBip44Account({
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
      } else {
        throw new Error(`${nameof(this.restoreWalletForTransfer)} unexpected wallet type ${request.transferSource}`);
      }
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
        masterKey: Buffer.from(rootPk.as_bytes()).toString('hex'),
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
      if (error.message.includes('Wallet with that mnemonics already exists')) {
        throw new WalletAlreadyRestoredError();
      }
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async createHardwareWallet(
    request: CreateHardwareWalletRequest
  ): Promise<CreateHardwareWalletResponse> {
    try {
      Logger.debug(`${nameof(AdaApi)}::${nameof(this.createHardwareWallet)} called`);
      const config = getCardanoHaskellBaseConfig(
        request.network
      ).reduce((acc, next) => Object.assign(acc, next), {});

      const wallet = await createHardwareWallet({
        db: request.db,
        settings: RustModule.WalletV2.BlockchainSettings.from_json({
          protocol_magic: config.ByronNetworkId
        }),
        accountPublicKey: RustModule.WalletV2.Bip44AccountPublic.new(
          RustModule.WalletV2.PublicKey.from_hex(request.publicKey),
          RustModule.WalletV2.DerivationScheme.v2()
        ),
        accountIndex: request.derivationIndex,
        walletName: request.walletName,
        accountName: '',
        hwWalletMetaInsert: request.hwFeatures,
        network: request.network,
      });

      const bip44Wallet = await Bip44Wallet.createBip44Wallet(
        request.db,
        wallet.bip44WrapperRow,
      );

      if (wallet.publicDeriver.length !== 1) {
        throw new Error(`${nameof(AdaApi)}::${nameof(this.createHardwareWallet)} should only do 1 HW derivation at a time`);
      }
      const pubDeriverResult = wallet.publicDeriver[0].publicDeriverResult;
      const newPubDeriver = await PublicDeriver.createPublicDeriver(
        pubDeriverResult,
        bip44Wallet,
      );

      Logger.debug(`${nameof(AdaApi)}::${nameof(this.restoreWallet)} success`);
      return {
        bip44Wallet,
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
      return convertAdaTransactionsToExportRows(fetchedTxs.txs);
    } catch (error) {
      Logger.error(`${nameof(AdaApi)}::${nameof(this.getTransactionRowsToExport)}: ` + stringifyError(error));

      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }
}
// ========== End of class AdaApi =========
