// @flow
import BigNumber from 'bignumber.js';
import type { lf$Database } from 'lovefield';
import {
  Logger,
  stringifyError,
  stringifyData
} from '../../utils/logging';
import WalletTransaction from '../../domain/WalletTransaction';
import { HARD_DERIVATION_START, } from '../../config/numbersConfig';
import type {
  Network,
  ConfigType,
} from '../../../config/config-types';
import {
  createStandardBip44Wallet, createHardwareWallet,
} from './lib/storage/bridge/walletHelper';
import {
  getAllUtxoTransactions,
  getPendingUtxoTransactions,
  updateTransactions,
} from './lib/storage/bridge/updateTransactions';
import {
  Bip44Wallet,
} from './lib/storage/models/Bip44Wallet/wrapper';
import type { HWFeatures, } from './lib/storage/database/walletTypes/core/tables';
import {
  flattenInsertTree,
  Bip44DerivationLevels,
} from './lib/storage/database/walletTypes/bip44/api/utils';
import type { CoreAddressT } from './lib/storage/database/primitives/enums';
import {
  PublicDeriver,
} from './lib/storage/models/PublicDeriver/index';
import {
  asDisplayCutoff,
} from './lib/storage/models/Bip44Wallet/traits';
import type {
  IPublicDeriver,
  IGetAllUtxos,
  IGetLastSyncInfo,
  IGetSigningKey,
  IDisplayCutoff,
  IDisplayCutoffPopFunc,
  IDisplayCutoffPopResponse,
  IHasChains, IHasChainsRequest,
  IGetLastSyncInfoResponse,
  WalletAccountNumberPlate,
  IGetPublicResponse,
} from './lib/storage/models/PublicDeriver/interfaces';
import type {
  IBip44Parent,
} from './lib/storage/models/Bip44Wallet/interfaces';
import type {
  IRenameFunc, IRenameRequest, IRenameResponse,
  IChangePasswordRequestFunc, IChangePasswordRequest, IChangePasswordResponse,
  Address, Addressing, UsedStatus, Value,
} from './lib/storage/models/common/interfaces';
import {
  sendAllUnsignedTx,
  newAdaUnsignedTx,
  asAddressedUtxo,
  signTransaction,
} from './transactions/byron/transactionsV2';
import {
  generateWalletRootKey,
  generateAdaMnemonic,
  isValidEnglishAdaMnemonic,
} from './lib/cardanoCrypto/cryptoWallet';
import { generateStandardPlate } from './lib/cardanoCrypto/plate';
import {
  scramblePaperAdaMnemonic,
  isValidEnglishAdaPaperMnemonic,
  unscramblePaperAdaMnemonic,
} from './lib/cardanoCrypto/paperWallet';
import type {
  LedgerSignTxPayload,
} from '../../domain/HWSignTx';
import type { $CardanoSignTransaction } from 'trezor-connect/lib/types/cardano';
import {
  createTrezorSignTxPayload,
  broadcastTrezorSignedTx,
  createLedgerSignTxPayload,
  prepareAndBroadcastLedgerSignedTx,
} from './transactions/byron/hwTransactions';
import {
  GenericApiError,
  IncorrectWalletPasswordError,
  WalletAlreadyRestoredError,
  UnusedAddressesError,
} from '../common';
import LocalizableError from '../../i18n/LocalizableError';
import { scanBip44Account, } from './restoration/byron/scan';
import type {
  BaseSignRequest,
  UnsignedTxResponse,
} from './transactions/types';
import type {
  SignTransactionResponse as LedgerSignTxResponse
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import {
  InvalidWitnessError,
  CheckAdressesInUseApiError,
} from './errors';
import { WrongPassphraseError } from './lib/cardanoCrypto/cryptoErrors';
import {
  getSelectedExplorer,
  saveSelectedExplorer,
} from './lib/storage/adaLocalStorage';
import type {
  ExplorerType,
} from '../../domain/Explorer';
import LocalStorageApi from '../localStorage/index';
import type {
  FilterFunc,
  HistoryFunc,
  SendFunc,
  SignedResponse,
  TxBodiesFunc,
  BestBlockFunc,
} from './lib/state-fetch/types';
import {
  getChainAddressesForDisplay,
  getAllAddressesForDisplay,
  loadWalletsFromStorage,
} from './lib/storage/models/utils';
import { convertAdaTransactionsToExportRows } from './transactions/utils';
import { migrateToLatest } from './lib/storage/adaMigration';
import { generateAdaPaperPdf } from './paperWallet/paperWalletPdf';
import type { PdfGenStepType } from './paperWallet/paperWalletPdf';
import type { TransactionExportRow } from '../export';

import { RustModule } from './lib/cardanoCrypto/rustLoader';
import { clear } from './lib/storage/database/index';

declare var CONFIG : ConfigType;
const protocolMagic = CONFIG.network.protocolMagic;

// ADA specific Request / Response params

// createAdaPaper

export type CreateAdaPaperRequest = {
  password: string,
  numAddresses?: number,
};
export type AdaPaper = {
  addresses: Array<string>,
  scrambledWords: Array<string>,
  accountPlate: WalletAccountNumberPlate,
};
export type CreateAdaPaperFunc = (
  request: CreateAdaPaperRequest
) => Promise<AdaPaper>;

// createAdaPaperPdf

export type CreateAdaPaperPdfRequest = {
  paper: AdaPaper,
  network: Network,
  printAccountPlate?: boolean,
  updateStatus?: PdfGenStepType => boolean,
};

export type CreateAdaPaperPdfResponse = ?Blob;
export type CreateAdaPaperPdfFunc = (
  request: CreateAdaPaperPdfRequest
) => Promise<CreateAdaPaperPdfResponse>;

// getWallets

export type GetWalletsRequest = {
  db: lf$Database,
};
export type GetWalletsResponse = Array<PublicDeriver>;
export type GetWalletsFunc = (
  request: GetWalletsRequest
) => Promise<GetWalletsResponse>;

// getAllAddressesForDisplay

export type GetAllAddressesForDisplayRequest = {
  publicDeriver: IPublicDeriver & IGetAllUtxos,
  type: CoreAddressT,
};
export type GetAllAddressesForDisplayResponse = Array<{|
  ...Address, ...Value, ...Addressing, ...UsedStatus
|}>;
export type GetAllAddressesForDisplayFunc = (
  request: GetAllAddressesForDisplayRequest
) => Promise<GetAllAddressesForDisplayResponse>;

// getChainAddressesForDisplay

export type GetChainAddressesForDisplayRequest = {
  publicDeriver: IPublicDeriver & IHasChains & IDisplayCutoff,
  chainsRequest: IHasChainsRequest,
  type: CoreAddressT,
};
export type GetChainAddressesForDisplayResponse = Array<{|
  ...Address, ...Value, ...Addressing, ...UsedStatus
|}>;
export type GetChainAddressesForDisplayFunc = (
  request: GetChainAddressesForDisplayRequest
) => Promise<GetChainAddressesForDisplayResponse>;

// getBalance

export type GetBalanceRequest = {
  getBalance: () => Promise<BigNumber>,
};
export type GetBalanceResponse = BigNumber;
export type GetBalanceFunc = (
  request: GetBalanceRequest
) => Promise<GetBalanceResponse>;

// getTxLastUpdatedDate

export type GetTxLastUpdateDateRequest = {
  getLastSyncInfo: () => Promise<IGetLastSyncInfoResponse>,
};
export type GetTxLastUpdateDateResponse = IGetLastSyncInfoResponse;
export type GetTxLastUpdateDateFunc = (
  request: GetTxLastUpdateDateRequest
) => Promise<GetTxLastUpdateDateResponse>;

// refreshTransactions

export type GetTransactionsRequestOptions = {|
  skip: number,
  limit: number,
|};
export type GetTransactionsRequest = {
  ...Inexact<GetTransactionsRequestOptions>,
  publicDeriver: IPublicDeriver & IGetAllUtxos & IGetLastSyncInfo,
  isLocalRequest: boolean,
  getTransactionsHistoryForAddresses: HistoryFunc,
  checkAddressesInUse: FilterFunc,
  getBestBlock: BestBlockFunc,
};
export type GetTransactionsResponse = {
  transactions: Array<WalletTransaction>,
  total: number,
};
export type GetTransactionsFunc = (
  request: GetTransactionsRequest
) => Promise<GetTransactionsResponse>;

// refreshPendingTransactions

export type RefreshPendingTransactionsRequest = {
  publicDeriver: IPublicDeriver & IGetAllUtxos & IGetLastSyncInfo,
};
export type RefreshPendingTransactionsResponse = Array<WalletTransaction>;
export type RefreshPendingTransactionsFunc = (
  request: RefreshPendingTransactionsRequest
) => Promise<RefreshPendingTransactionsResponse>;

// createWallet

export type CreateWalletRequest = RestoreWalletRequest;
export type CreateWalletResponse = RestoreWalletResponse;
export type CreateWalletFunc = (
  request: CreateWalletRequest
) => Promise<CreateWalletResponse>;

// signAndBroadcast

export type SignAndBroadcastRequest = {
  publicDeriver: IPublicDeriver & IBip44Parent & IGetSigningKey,
  signRequest: BaseSignRequest,
  password: string,
  sendTx: SendFunc,
};
export type SignAndBroadcastResponse = SignedResponse;
export type SignAndBroadcastFunc = (
  request: SignAndBroadcastRequest
) => Promise<SignAndBroadcastResponse>;

// createTrezorSignTxData

export type CreateTrezorSignTxDataRequest = {
  signRequest: BaseSignRequest,
  getTxsBodiesForUTXOs: TxBodiesFunc,
};
export type CreateTrezorSignTxDataResponse = {
  // https://github.com/trezor/connect/blob/develop/docs/methods/cardanoSignTransaction.md
  trezorSignTxPayload: $CardanoSignTransaction,
};
export type CreateTrezorSignTxDataFunc = (
  request: CreateTrezorSignTxDataRequest
) => Promise<CreateTrezorSignTxDataResponse>;

// broadcastTrezorSignedTx

export type BroadcastTrezorSignedTxRequest = {
  signedTxHex: string,
  sendTx: SendFunc,
};
export type BroadcastTrezorSignedTxResponse = SignedResponse;
export type BroadcastTrezorSignedTxFunc = (
  request: BroadcastTrezorSignedTxRequest
) => Promise<BroadcastTrezorSignedTxResponse>;

// createLedgerSignTxData

export type CreateLedgerSignTxDataRequest = {
  signRequest: BaseSignRequest,
  getTxsBodiesForUTXOs: TxBodiesFunc,
};
export type CreateLedgerSignTxDataResponse = {
  ledgerSignTxPayload: LedgerSignTxPayload,
};
export type CreateLedgerSignTxDataFunc = (
  request: CreateLedgerSignTxDataRequest
) => Promise<CreateLedgerSignTxDataResponse>;

// prepareAndBroadcastLedgerSignedTx

export type PrepareAndBroadcastLedgerSignedTxRequest = {
  getPublicKey: () => Promise<IGetPublicResponse>,
  keyLevel: number,
  ledgerSignTxResp: LedgerSignTxResponse,
  unsignedTx: RustModule.WalletV2.Transaction,
  sendTx: SendFunc,
};
export type PrepareAndBroadcastLedgerSignedTxResponse = SignedResponse;
export type PrepareAndBroadcastLedgerSignedTxFunc = (
  request: PrepareAndBroadcastLedgerSignedTxRequest
) => Promise<PrepareAndBroadcastLedgerSignedTxResponse>;

// createUnsignedTx

export type CreateUnsignedTxRequest = {
  publicDeriver: IGetAllUtxos & IHasChains,
  receiver: string,
  amount: string, // in lovelaces
  shouldSendAll: boolean,
};
export type CreateUnsignedTxResponse = UnsignedTxResponse;

export type CreateUnsignedTxFunc = (
  request: CreateUnsignedTxRequest
) => Promise<CreateUnsignedTxResponse>;

// createAddress

export type CreateAddressRequest = {
  popFunc: IDisplayCutoffPopFunc,
};
export type CreateAddressResponse = IDisplayCutoffPopResponse;
export type CreateAddressFunc = (
  request: CreateAddressRequest
) => Promise<CreateAddressResponse>;

// saveLastReceiveAddressIndex

export type SaveLastReceiveAddressIndexRequest = {
  publicDeriver: PublicDeriver,
  index: number,
};
export type SaveLastReceiveAddressIndexResponse = void;
export type SaveLastReceiveAddressIndexFunc = (
  request: SaveLastReceiveAddressIndexRequest
) => Promise<SaveLastReceiveAddressIndexResponse>;

// getSelectedExplorer

export type GetSelectedExplorerRequest = void;
export type GetSelectedExplorerResponse = ExplorerType;
export type GetSelectedExplorerFunc = (
  request: GetSelectedExplorerRequest
) => Promise<GetSelectedExplorerResponse>;

// saveSelectedExplorer

export type SaveSelectedExplorerRequest = {
  explorer: ExplorerType,
};
export type SaveSelectedExplorerResponse = void;
export type SaveSelectedExplorerFunc = (
  request: SaveSelectedExplorerRequest
) => Promise<SaveSelectedExplorerResponse>;

// isValidAddress

export type IsValidAddressRequest = {
  address: string
};
export type IsValidAddressResponse = boolean;
export type IsValidAddressFunc = (
  request: IsValidAddressRequest
) => Promise<IsValidAddressResponse>;

// isValidMnemonic

export type IsValidMnemonicRequest = {
  mnemonic: string,
  numberOfWords: ?number
};
export type IsValidMnemonicResponse = boolean;
export type IsValidMnemonicFunc = (
  request: IsValidMnemonicRequest
) => IsValidMnemonicResponse;

// isValidPaperMnemonic

export type IsValidPaperMnemonicRequest = {
  mnemonic: string,
  numberOfWords: ?number
};
export type IsValidPaperMnemonicResponse = boolean;
export type IsValidPaperMnemonicFunc = (
  request: IsValidPaperMnemonicRequest
) => IsValidPaperMnemonicResponse;

// unscramblePaperMnemonic

export type UnscramblePaperMnemonicRequest = {
  mnemonic: string,
  numberOfWords: ?number,
  password?: string,
};
export type UnscramblePaperMnemonicResponse = [?string, number];
export type UnscramblePaperMnemonicFunc = (
  request: UnscramblePaperMnemonicRequest
) => UnscramblePaperMnemonicResponse;

// generateWalletRecoveryPhrase

export type GenerateWalletRecoveryPhraseRequest = {};
export type GenerateWalletRecoveryPhraseResponse = Array<string>;
export type GenerateWalletRecoveryPhraseFunc = (
  request: GenerateWalletRecoveryPhraseRequest
) => Promise<GenerateWalletRecoveryPhraseResponse>;

// restoreWallet

export type RestoreWalletRequest = {
  db: lf$Database,
  recoveryPhrase: string,
  walletName: string,
  walletPassword: string,
};
export type RestoreWalletResponse = {
  bip44Wallet: Bip44Wallet,
  publicDerivers: Array<PublicDeriver>,
};
export type RestoreWalletFunc = (
  request: RestoreWalletRequest
) => Promise<RestoreWalletResponse>;

// restoreWalletForTransfer

export type RestoreWalletForTransferRequest = {
  recoveryPhrase: string,
  accountIndex: number,
  checkAddressesInUse: FilterFunc,
};
export type RestoreWalletForTransferResponse = {
  masterKey: string,
  addresses: Array<{| ...Address, ...Addressing |}>
};
export type RestoreWalletForTransferFunc = (
  request: RestoreWalletForTransferRequest
) => Promise<RestoreWalletForTransferResponse>;

// renameModel

export type RenameModelRequest = {
  func: IRenameFunc,
  request: IRenameRequest,
};
export type RenameModelResponse = IRenameResponse;
export type RenameModelFunc = (
  request: RenameModelRequest
) => Promise<RenameModelResponse>;

// changeModelPassword

export type ChangeModelPasswordRequest = {
  func: IChangePasswordRequestFunc,
  request: IChangePasswordRequest,
};
export type ChangeModelPasswordResponse = IChangePasswordResponse;
export type ChangeModelPasswordFunc = (
  request: ChangeModelPasswordRequest
) => Promise<ChangeModelPasswordResponse>;

// createHardwareWallet

export type CreateHardwareWalletRequest = {
  db: lf$Database,
  walletName: string,
  publicKey: string,
  derivationIndex: number,
  hwFeatures: HWFeatures,
  checkAddressesInUse: FilterFunc,
};
export type CreateHardwareWalletResponse = {
  bip44Wallet: Bip44Wallet,
  publicDeriver: PublicDeriver,
};
export type CreateHardwareWalletFunc = (
  request: CreateHardwareWalletRequest
) => Promise<CreateHardwareWalletResponse>;

// getTransactionRowsToExport

export type GetTransactionRowsToExportRequest = {
  publicDeriver: IPublicDeriver & IGetAllUtxos,
};
export type GetTransactionRowsToExportResponse = Array<TransactionExportRow>;
export type GetTransactionRowsToExportFunc = (
  request: GetTransactionRowsToExportRequest
) => Promise<GetTransactionRowsToExportResponse>;

export const DEFAULT_ADDRESSES_PER_PAPER = 1;

export default class AdaApi {

  // noinspection JSMethodCanBeStatic
  createAdaPaper(
    {
      password,
      numAddresses
    }: CreateAdaPaperRequest = {}
  ): AdaPaper {
    const words = generateAdaMnemonic();
    const scrambledWords = scramblePaperAdaMnemonic(words.join(' '), password).split(' ');
    const { addresses, accountPlate } = generateStandardPlate(
      words.join(' '),
      0, // paper wallets always use account 0
      numAddresses != null ? numAddresses : DEFAULT_ADDRESSES_PER_PAPER,
      protocolMagic,
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

  async getWallets(
    request: GetWalletsRequest,
  ): Promise<GetWalletsResponse> {
    Logger.debug('AdaApi::getWallets called');
    try {
      const wallets = await loadWalletsFromStorage(request.db);
      Logger.debug('AdaApi::getWallets success: ' + stringifyData(wallets));
      return wallets;
    } catch (error) {
      Logger.error('AdaApi::getWallets error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  /**
   * addresses get cutoff if there is a DisplayCutoff set
   */
  async getAllAddressesForDisplay(
    request: GetAllAddressesForDisplayRequest
  ): Promise<GetAllAddressesForDisplayResponse> {
    Logger.debug('AdaApi::getAllAddressesForDisplay called: ' + stringifyData(request));
    try {
      return await getAllAddressesForDisplay(request);
    } catch (error) {
      Logger.error('AdaApi::getAllAddressesForDisplay error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  /**
   * for the external chain, we truncate based on cuttoff
   * for the internal chain, we truncate based on the last used
   */
  async getChainAddressesForDisplay(
    request: GetChainAddressesForDisplayRequest
  ): Promise<GetChainAddressesForDisplayResponse> {
    Logger.debug('AdaApi::getChainAddressesForDisplay called: ' + stringifyData(request));
    try {
      return await getChainAddressesForDisplay(request);
    } catch (error) {
      Logger.error('AdaApi::getChainAddressesForDisplay error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  async getBalance(
    request: GetBalanceRequest
  ): Promise<GetBalanceResponse> {
    try {
      const balance = await request.getBalance();
      return balance;
    } catch (error) {
      Logger.error('AdaApi::getBalance error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  async getTxLastUpdatedDate(
    request: GetTxLastUpdateDateRequest
  ): Promise<GetTxLastUpdateDateResponse> {
    try {
      return await request.getLastSyncInfo();
    } catch (error) {
      Logger.error('AdaApi::getTxLastUpdatedDate error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  async refreshTransactions(
    request: GetTransactionsRequest
  ): Promise<GetTransactionsResponse> {
    Logger.debug('AdaApi::refreshTransactions called: ' + stringifyData(request));
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
      const fetchedTxs = await getAllUtxoTransactions({
        publicDeriver: request.publicDeriver,
        skip,
        limit,
      },);
      Logger.debug('AdaApi::refreshTransactions success: ' + stringifyData(fetchedTxs));

      const lastSyncInfo = await request.publicDeriver.getLastSyncInfo();
      const mappedTransactions = fetchedTxs.txs.map(tx => {
        return WalletTransaction.fromAnnotatedUtxoTx({
          tx,
          addressLookupMap: fetchedTxs.addressLookupMap,
          lastBlockNumber: lastSyncInfo.SlotNum,
        });
      });
      return {
        transactions: mappedTransactions,
        total: mappedTransactions.length
      };
    } catch (error) {
      Logger.error('AdaApi::refreshTransactions error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  async refreshPendingTransactions(
    request: RefreshPendingTransactionsRequest
  ): Promise<RefreshPendingTransactionsResponse> {
    Logger.debug('AdaApi::refreshPendingTransactions called');
    try {
      const fetchedTxs = await getPendingUtxoTransactions({
        publicDeriver: request.publicDeriver,
      });
      Logger.debug('AdaApi::refreshPendingTransactions success: ' + stringifyData(fetchedTxs));

      const lastSyncInfo = await request.publicDeriver.getLastSyncInfo();
      const mappedTransactions = fetchedTxs.txs.map(tx => {
        return WalletTransaction.fromAnnotatedUtxoTx({
          tx,
          addressLookupMap: fetchedTxs.addressLookupMap,
          lastBlockNumber: lastSyncInfo.SlotNum,
        });
      });
      return mappedTransactions;
    } catch (error) {
      Logger.error('AdaApi::refreshPendingTransactions error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  async createWallet(
    request: CreateWalletRequest
  ): Promise<CreateWalletResponse> {
    // creating a wallet is the same as restoring a wallet
    return await this.restoreWallet(request);
  }

  async signAndBroadcast(
    request: SignAndBroadcastRequest
  ): Promise<SignAndBroadcastResponse> {
    Logger.debug('AdaApi::signAndBroadcast called');
    const { password, signRequest } = request;
    try {
      const signingKey = await request.publicDeriver.getSigningKey();
      const normalizedKey = await request.publicDeriver.normalizeKey({
        ...signingKey,
        password,
      });
      const signedTx = signTransaction(
        signRequest,
        request.publicDeriver.getBip44Parent().getPublicDeriverLevel(),
        RustModule.WalletV2.PrivateKey.from_hex(normalizedKey.prvKeyHex)
      );
      const response = request.sendTx({ signedTx });
      Logger.debug(
        'AdaApi::signAndBroadcast success: ' + stringifyData(response)
      );
      return response;
    } catch (error) {
      if (error instanceof WrongPassphraseError) {
        throw new IncorrectWalletPasswordError();
      }
      Logger.error('AdaApi::signAndBroadcast error: ' + stringifyError(error));
      if (error instanceof InvalidWitnessError) {
        throw new InvalidWitnessError();
      }
      throw new GenericApiError();
    }
  }

  async createTrezorSignTxData(
    request: CreateTrezorSignTxDataRequest
  ): Promise<CreateTrezorSignTxDataResponse> {
    try {
      Logger.debug('AdaApi::createTrezorSignTxData called');
      const { signRequest } = request;

      const trezorSignTxPayload = await createTrezorSignTxPayload(
        signRequest,
        request.getTxsBodiesForUTXOs,
      );
      Logger.debug('AdaApi::createTrezorSignTxData success: ' + stringifyData(trezorSignTxPayload));

      return {
        trezorSignTxPayload,
      };
    } catch (error) {
      Logger.error('AdaApi::createTrezorSignTxData error: ' + stringifyError(error));

      // We don't know what the problem was so throw a generic error
      throw new GenericApiError();
    }
  }

  async broadcastTrezorSignedTx(
    request: BroadcastTrezorSignedTxRequest
  ): Promise<BroadcastTrezorSignedTxResponse> {
    Logger.debug('AdaApi::broadcastTrezorSignedTx called');
    const { signedTxHex, sendTx } = request;
    try {
      const response = await broadcastTrezorSignedTx(
        signedTxHex,
        sendTx
      );
      Logger.debug('AdaApi::broadcastTrezorSignedTx success: ' + stringifyData(response));

      return response;
    } catch (error) {
      Logger.error('AdaApi::broadcastTrezorSignedTx error: ' + stringifyError(error));

      if (error instanceof InvalidWitnessError) {
        throw new InvalidWitnessError();
      }

      // We don't know what the problem was so throw a generic error
      throw new GenericApiError();
    }
  }

  async createLedgerSignTxData(
    request: CreateLedgerSignTxDataRequest
  ): Promise<CreateLedgerSignTxDataResponse> {
    try {
      Logger.debug('AdaApi::createLedgerSignTxData called');
      const { signRequest, getTxsBodiesForUTXOs } = request;

      const ledgerSignTxPayload = await createLedgerSignTxPayload(
        signRequest,
        getTxsBodiesForUTXOs,
      );

      Logger.debug('AdaApi::createLedgerSignTxData success: ' + stringifyData(ledgerSignTxPayload));
      return {
        ledgerSignTxPayload,
      };
    } catch (error) {
      Logger.error('AdaApi::createLedgerSignTxData error: ' + stringifyError(error));

      if (error instanceof LocalizableError) {
        // we found it as a LocalizableError, so could throw it as it is.
        throw error;
      } else {
        // We don't know what the problem was so throw a generic error
        throw new GenericApiError();
      }
    }
  }

  async prepareAndBroadcastLedgerSignedTx(
    request: PrepareAndBroadcastLedgerSignedTxRequest
  ): Promise<PrepareAndBroadcastLedgerSignedTxResponse> {
    try {
      Logger.debug('AdaApi::prepareAndBroadcastLedgerSignedTx called');

      const publicKeyRow = await request.getPublicKey();
      if (publicKeyRow.IsEncrypted) {
        throw new Error('prepareAndBroadcastLedgerSignedTx unexpcted encrypted public key');
      }
      const publicKey = RustModule.WalletV2.PublicKey.from_hex(publicKeyRow.Hash);
      const { ledgerSignTxResp, unsignedTx, sendTx } = request;
      const response = await prepareAndBroadcastLedgerSignedTx(
        ledgerSignTxResp,
        unsignedTx,
        publicKey,
        request.keyLevel,
        sendTx,
      );
      Logger.debug('AdaApi::prepareAndBroadcastLedgerSignedTx success: ' + stringifyData(response));

      return response;
    } catch (error) {
      Logger.error('AdaApi::prepareAndBroadcastLedgerSignedTx error: ' + stringifyError(error));

      if (error instanceof LocalizableError) {
        // we found it as a LocalizableError, so could throw it as it is.
        throw error;
      } else {
        // We don't know what the problem was so throw a generic error
        throw new GenericApiError();
      }
    }
  }

  async createUnsignedTx(
    request: CreateUnsignedTxRequest
  ): Promise<CreateUnsignedTxResponse> {
    Logger.debug('AdaApi::createUnsignedTx called');
    const { receiver, amount, shouldSendAll } = request;
    try {
      const utxos = await request.publicDeriver.getAllUtxos();
      const addressedUtxo = asAddressedUtxo(utxos);

      let unsignedTxResponse;
      if (shouldSendAll) {
        unsignedTxResponse = sendAllUnsignedTx(
          receiver,
          addressedUtxo
        );
      } else {
        const nextUnusedInternal = await request.publicDeriver.nextInternal();
        if (nextUnusedInternal.addressInfo == null) {
          throw new Error('createUnsignedTx no internal addresses left. Should never happen');
        }
        const changeAddr = nextUnusedInternal.addressInfo;
        unsignedTxResponse = newAdaUnsignedTx(
          receiver,
          amount,
          [{
            address: changeAddr.addr.Hash,
            addressing: changeAddr.addressing,
          }],
          addressedUtxo
        );
      }
      Logger.debug(
        'AdaApi::createUnsignedTx success: ' + stringifyData(unsignedTxResponse)
      );
      return unsignedTxResponse;
    } catch (error) {
      Logger.error(
        'AdaApi::createUnsignedTx error: ' + stringifyError(error)
      );
      if (error.id.includes('NotEnoughMoneyToSendError')) throw error;
      throw new GenericApiError();
    }
  }

  async createAddress(
    request: CreateAddressRequest,
  ): Promise<CreateAddressResponse> {
    Logger.debug('AdaApi::createAddress called');
    try {

      const newAddress = await request.popFunc();
      Logger.info('AdaApi::createAddress success: ' + stringifyData(newAddress));
      return newAddress;
    } catch (error) {
      if (error instanceof UnusedAddressesError) {
        throw error;
      }
      Logger.error('AdaApi::createAddress error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  /** Note: This method is exposed to allow injecting data when testing */
  async saveLastReceiveAddressIndex(
    request: SaveLastReceiveAddressIndexRequest
  ): Promise<SaveLastReceiveAddressIndexResponse> {
    Logger.debug('AdaApi::saveLastReceiveAddressIndex called');
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
      Logger.error('AdaApi::saveAddress error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  async getSelectedExplorer(
    _request: GetSelectedExplorerRequest
  ): Promise<GetSelectedExplorerResponse> {
    Logger.debug('AdaApi::getSelectedExplorer called');
    try {
      return await getSelectedExplorer();
    } catch (error) {
      Logger.error('AdaApi::getSelectedExplorer error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  async saveSelectedExplorer(
    request: SaveSelectedExplorerRequest
  ): Promise<SaveSelectedExplorerResponse> {
    Logger.debug('AdaApi::saveSelectedExplorer called');
    try {
      await saveSelectedExplorer(request.explorer);
    } catch (error) {
      Logger.error('AdaApi::saveSelectedExplorer error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  isValidAddress(
    request: IsValidAddressRequest
  ): Promise<IsValidAddressResponse> {
    try {
      RustModule.WalletV2.Address.from_base58(request.address);
      return Promise.resolve(true);
    } catch (validateAddressError) {
      Logger.error('AdaApi::isValidAdaAddress error: ' +
        stringifyError(validateAddressError));

      // This error means the address is not valid
      return Promise.resolve(false);
    }
  }

  isValidMnemonic(
    request: IsValidMnemonicRequest,
  ): IsValidMnemonicResponse {
    return isValidEnglishAdaMnemonic(request.mnemonic, request.numberOfWords);
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
    Logger.debug('AdaApi::generateWalletRecoveryPhrase called');
    try {
      const response = new Promise(
        resolve => resolve(generateAdaMnemonic())
      );
      Logger.debug('AdaApi::generateWalletRecoveryPhrase success');
      return response;
    } catch (error) {
      Logger.error(
        'AdaApi::generateWalletRecoveryPhrase error: ' + stringifyError(error)
      );
      throw new GenericApiError();
    }
  }

  /**
   * Creates wallet and saves result to DB
  */
  async restoreWallet(
    request: RestoreWalletRequest
  ): Promise<RestoreWalletResponse> {
    Logger.debug('AdaApi::restoreWallet called');
    const { recoveryPhrase, walletName, walletPassword, } = request;

    try {
      // Note: we only restore for 0th account
      const accountIndex = HARD_DERIVATION_START + 0;
      const rootPk = generateWalletRootKey(recoveryPhrase);

      const wallet = await createStandardBip44Wallet({
        db: request.db,
        settings: RustModule.WalletV2.BlockchainSettings.from_json({
          protocol_magic: protocolMagic
        }),
        rootPk,
        password: walletPassword,
        accountIndex,
        walletName,
        accountName: '', // set account name empty now
      });

      const bip44Wallet = await Bip44Wallet.createBip44Wallet(
        request.db,
        wallet.bip44WrapperRow,
        protocolMagic,
      );
      const newPubDerivers = [];
      for (const pubDeriver of wallet.publicDeriver) {
        newPubDerivers.push(await PublicDeriver.createPublicDeriver(
          pubDeriver.publicDeriverResult,
          bip44Wallet,
        ));
      }

      Logger.debug('AdaApi::restoreWallet success');
      return {
        bip44Wallet,
        publicDerivers: newPubDerivers,
      };
    } catch (error) {
      Logger.error('AdaApi::restoreWallet error: ' + stringifyError(error));
      // TODO: handle case where wallet already exists (this if case is never hit)
      if (error.message.includes('Wallet with that mnemonics already exists')) {
        throw new WalletAlreadyRestoredError();
      }

      // Refer: https://github.com/Emurgo/yoroi-frontend/pull/1055
      if (error instanceof CheckAdressesInUseApiError) {
        // CheckAdressesInUseApiError throw it as it is.
        throw error;
      } else {
        // We don't know what the problem was so throw a generic error
        throw new GenericApiError();
      }
    }
  }

  /**
   * Restore all addresses like restoreWallet() but do not touch storage.
   * TBD: this function is based on restoreWallet() and duplicate parts of it.
   */
  async restoreWalletForTransfer(
    request: RestoreWalletForTransferRequest
  ): Promise<RestoreWalletForTransferResponse> {
    Logger.debug('AdaApi::restoreWalletForTransfer called');
    const { recoveryPhrase, checkAddressesInUse } = request;

    const rootPk = generateWalletRootKey(recoveryPhrase);
    const accountKey = rootPk.bip44_account(
      RustModule.WalletV2.AccountIndex.new(request.accountIndex)
    );
    try {
      // need this to persist outside the scope of the hashToIds lambda
      // since the lambda is called multiple times
      // and we need keep a globally unique index
      const reverseAddressLookup = new Map<number, Array<string>>();
      const foundAddresses = new Set<string>();

      // TODO: this is using legacy scanning. Need an option for legacy vs shelley
      const insertTree = await scanBip44Account({
        accountPublicKey: accountKey.key().public().to_hex(),
        lastUsedInternal: -1,
        lastUsedExternal: -1,
        checkAddressesInUse,
        addByHash: (address) => {
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
        },
        protocolMagic,
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
        if (family == null) throw new Error('restoreWalletForTransfer should never happen');
        const result = family.map(address => ({
          address,
          addressing: {
            startLevel: Bip44DerivationLevels.ACCOUNT.level,
            path: [request.accountIndex].concat(leaf.path),
          },
        }));
        addressResult.push(...result);
      }

      Logger.debug('AdaApi::restoreWalletForTransfer success');

      return {
        masterKey: rootPk.key().to_hex(),
        addresses: addressResult,
      };
    } catch (error) {
      Logger.error('AdaApi::restoreWalletForTransfer error: ' + stringifyError(error));
      // TODO: backend will return something different here, if multiple wallets
      // are restored from the key and if there are duplicate wallets we will get
      // some kind of error and present the user with message that some wallets
      // where not imported/restored if some where. if no wallets are imported
      // we will error out completely with throw block below
      // TODO: use error ID instead of error message
      if (error.message.includes('Wallet with that mnemonics already exists')) {
        throw new WalletAlreadyRestoredError();
      }
      // We don't know what the problem was -> throw generic error
      throw new GenericApiError();
    }
  }

  async renameModel(
    request: RenameModelRequest
  ): Promise<RenameModelResponse> {
    Logger.debug('AdaApi::renameModel called: ' + stringifyData(request));
    try {
      const result = await request.func(request.request);
      Logger.debug('AdaApi::renameModel success: ' + stringifyData(result));
      return result;
    } catch (error) {
      Logger.error('AdaApi::renameModel error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  async changeModelPassword(
    request: ChangeModelPasswordRequest
  ): Promise<ChangeModelPasswordResponse> {
    Logger.debug('AdaApi::changeModelPassword called');
    try {
      const result = await request.func(request.request);
      Logger.debug('AdaApi::changeModelPassword success');
      return result;
    } catch (error) {
      Logger.error(
        'AdaApi::changeModelPassword error: ' + stringifyError(error)
      );
      if (error instanceof WrongPassphraseError) {
        throw new IncorrectWalletPasswordError();
      }
      throw new GenericApiError();
    }
  }

  async createHardwareWallet(
    request: CreateHardwareWalletRequest
  ): Promise<CreateHardwareWalletResponse> {
    try {
      Logger.debug('AdaApi::createHardwareWallet called');
      const wallet = await createHardwareWallet({
        db: request.db,
        settings: RustModule.WalletV2.BlockchainSettings.from_json({
          protocol_magic: protocolMagic
        }),
        accountPublicKey: RustModule.WalletV2.Bip44AccountPublic.new(
          RustModule.WalletV2.PublicKey.from_hex(request.publicKey),
          RustModule.WalletV2.DerivationScheme.v2()
        ),
        accountIndex: request.derivationIndex,
        walletName: request.walletName,
        accountName: '',
        hwWalletMetaInsert: request.hwFeatures,
      });

      const bip44Wallet = await Bip44Wallet.createBip44Wallet(
        request.db,
        wallet.bip44WrapperRow,
        protocolMagic,
      );

      if (wallet.publicDeriver.length !== 1) {
        throw new Error('createHardwareWallet should only do 1 HW derivation at a time');
      }
      const pubDeriverResult = wallet.publicDeriver[0].publicDeriverResult;
      const newPubDeriver = await PublicDeriver.createPublicDeriver(
        pubDeriverResult,
        bip44Wallet,
      );

      Logger.debug('AdaApi::restoreWallet success');
      return {
        bip44Wallet,
        publicDeriver: newPubDeriver,
      };
    } catch (error) {
      Logger.error('AdaApi::createHardwareWallet error: ' + stringifyError(error));

      if (error instanceof LocalizableError) {
        // we found it as a LocalizableError, so could throw it as it is.
        throw error;
      } else {
        // We don't know what the problem was so throw a generic error
        throw new GenericApiError();
      }
    }
  }

  // noinspection JSMethodCanBeStatic
  // TODO: https://github.com/Emurgo/yoroi-frontend/pull/222
  async getTransactionRowsToExport(
    request: GetTransactionRowsToExportRequest
  ): Promise<GetTransactionRowsToExportResponse> {
    try {
      const fetchedTxs = await getAllUtxoTransactions({
        publicDeriver: request.publicDeriver,
      });
      Logger.debug('AdaApi::getTransactionRowsToExport: success');
      return convertAdaTransactionsToExportRows(fetchedTxs.txs);
    } catch (error) {
      Logger.error('AdaApi::getTransactionRowsToExport: ' + stringifyError(error));

      if (error instanceof LocalizableError) {
        // we found it as a LocalizableError, so could throw it as it is.
        throw error;
      } else {
        // We don't know what the problem was so throw a generic error
        throw new GenericApiError();
      }
    }
  }

  migrate = async (
    localstorageApi: LocalStorageApi,
    persistentDb: lf$Database,
  ): Promise<boolean> => {
    return await migrateToLatest(
      localstorageApi,
      persistentDb,
    );
  }

  importLocalDatabase = async (
    db: lf$Database,
    data: {},
  ): Promise<void> => {
    await clear(db);
    await db.import(data);
  }

  exportLocalDatabase = async (
    db: lf$Database,
  ): Promise<string> => {
    const data = await db.export();
    return JSON.stringify(data);
  }
}
// ========== End of class AdaApi =========
