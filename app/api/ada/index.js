// @flow
import { action } from 'mobx';
import BigNumber from 'bignumber.js';
import {
  Logger,
  stringifyError,
  stringifyData
} from '../../utils/logging';
import Wallet from '../../domain/Wallet';
import WalletTransaction, {
  transactionTypes
} from '../../domain/WalletTransaction';
import type {
  TransactionDirectionType
} from '../../domain/WalletTransaction';
import WalletAddress from '../../domain/WalletAddress';
import { LOVELACES_PER_ADA, HARD_DERIVATION_START } from '../../config/numbersConfig';
import type { Network } from '../../../config/config-types';
import { createCryptoAccount, createHardwareWalletAccount } from './lib/storage/adaAccount';
import { toAdaWallet, toAdaHardwareWallet } from './lib/storage/cryptoToModel';
import {
  isValidMnemonic,
  isValidPaperMnemonic,
  unscramblePaperMnemonic,
  generateAdaAccountRecoveryPhrase,
  generatePaperWalletSecret,
  getBalance,
  mnemonicsToExternalAddresses,
} from './adaWallet';
import {
  getAdaAddressesByType,
  getAdaAddressesList,
  popBip44Address,
  saveAdaAddress,
  saveAsAdaAddresses,
} from './lib/storage/adaAddress';
import {
  restoreBip44Wallet
} from './restoreAdaWallet';
import {
  refreshTxs,
} from './adaTransactions/adaTransactionsHistory';
import {
  newAdaUnsignedTx,
  sendAllUnsignedTx,
  signTransaction,
} from './adaTransactions/adaNewTransactions';
import {
  getCryptoWalletFromMasterKey,
  createAccountPlate,
  generateWalletMasterKey,
} from './lib/cardanoCrypto/cryptoWallet';
import type {
  LedgerSignTxPayload,
} from '../../domain/HWSignTx';
import type { $CardanoSignTransaction } from 'trezor-connect/lib/types/cardano';
import {
  createTrezorSignTxPayload,
  broadcastTrezorSignedTx,
  createLedgerSignTxPayload,
  prepareAndBroadcastLedgerSignedTx,
} from './hardwareWallet/newTransaction';
import {
  GenericApiError,
  IncorrectWalletPasswordError,
  WalletAlreadyRestoredError
} from '../common';
import LocalizableError from '../../i18n/LocalizableError';
import type {
  AdaAddress,
  AdaAddresses,
  AdaTransaction,
  AddressType,
  AdaTransactionCondition,
  AdaTransactionInputOutput,
  AdaWallet,
  AdaAssurance,
  BaseSignRequest,
  UnsignedTxResponse,
} from './adaTypes';
import type {
  SignTransactionResponse as LedgerSignTxResponse
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import { InvalidWitnessError, RedeemAdaError, RedemptionKeyAlreadyUsedError } from './errors';
import { WrongPassphraseError } from './lib/cardanoCrypto/cryptoErrors';
import {
  getAdaWallet,
  getLastBlockNumber,
  getLastReceiveAddressIndex,
  getCurrentAccountIndex,
  getCurrentCryptoAccount,
  getSelectedExplorer,
  getWalletMasterKey,
  saveCryptoAccount,
  saveLastReceiveAddressIndex,
  saveSelectedExplorer,
  createStoredWallet,
} from './lib/storage/adaLocalStorage';
import type {
  CryptoAccount,
} from './lib/storage/adaLocalStorage';
import type {
  ExplorerType,
} from '../../domain/Explorer';
import LocalStorageApi from '../localStorage/index';
import {
  getPendingTxs,
  getTxsLastUpdatedDate,
  getTxsOrderedByDateDesc,
  getTxsOrderedByLastUpdateDesc,
  saveTxs,
  loadLovefieldDB,
  reset,
  importLovefieldDatabase,
  exportLovefieldDatabase,
} from './lib/storage/lovefieldDatabase';
import type {
  FilterFunc,
  HistoryFunc,
  AddressUtxoFunc,
  SendFunc,
  SignedResponse,
  TxBodiesFunc,
  UtxoSumFunc,
} from './lib/state-fetch/types';
import {
  changeAdaWalletSpendingPassword,
  getAddressList,
  getLatestUsedIndex,
  updateAdaWalletBalance,
  updateAdaWalletMetaParams,
  updateBestBlockNumber,
  updateLastReceiveAddressIndex,
  updateTransactionList,
} from './lib/storage/helpers';
import { convertAdaTransactionsToExportRows } from './lib/utils';
import { readFile, decryptFile, parsePDFFile, getSecretKey } from './lib/pdfParser';
import {
  isValidRedemptionKey,
  isValidPaperVendRedemptionKey
} from '../../utils/redemption-key-validation';
import { redeemAda, redeemPaperVendedAda } from './adaRedemption';
import type { RedeemPaperVendedAdaParams, RedeemAdaParams } from './adaRedemption';
import config from '../../config';
import { migrateToLatest } from './lib/storage/adaMigration';
import {
  makeCardanoBIP44Path,
} from 'yoroi-extension-ledger-bridge';
import { generateAdaPaperPdf } from './paperWallet/paperWalletPdf';
import type { PdfGenStepType } from './paperWallet/paperWalletPdf';
import type { TransactionExportRow } from '../export';

import { HWFeatures } from '../../types/HWConnectStoreTypes';

import { RustModule } from './lib/cardanoCrypto/rustLoader';
import type { WalletAccountNumberPlate } from '../../domain/Wallet';

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

export type GetWalletsRequest = {};
export type GetWalletsResponse = Array<Wallet>;
export type GetWalletsFunc = (
  request: GetWalletsRequest
) => Promise<GetWalletsResponse>;

// getExternalAddresses

export type GetAddressesRequest = {
  walletId: string
};
export type GetAddressesResponse = {
  accountId: string,
  addresses: Array<WalletAddress>
};
export type GetAddressesFunc = (
  request: GetAddressesRequest
) => Promise<GetAddressesResponse>;

// getBalance

export type GetBalanceRequest = {
  getUTXOsSumsForAddresses: UtxoSumFunc,
};
export type GetBalanceResponse = BigNumber;
export type GetBalanceFunc = (
  request: GetBalanceRequest
) => Promise<GetBalanceResponse>;

// getTxLastUpdatedDate

export type GetTxLastUpdateDateRequest = {};
export type GetTxLastUpdateDateResponse = Date;
export type GetTxLastUpdateDateFunc = (
  request: GetTxLastUpdateDateRequest
) => Promise<GetTxLastUpdateDateResponse>;

// refreshTransactions

export type GetTransactionsRequestOptions = {
  skip: number,
  limit: number,
};
export type GetTransactionsRequest = {
  ...$Shape<GetTransactionsRequestOptions>,
  walletId: string,
  isLocalRequest: boolean,
  getTransactionsHistoryForAddresses: HistoryFunc,
  checkAddressesInUse: FilterFunc,
};
export type GetTransactionsResponse = {
  transactions: Array<WalletTransaction>,
  total: number,
};
export type GetTransactionsFunc = (
  request: GetTransactionsRequest
) => Promise<GetTransactionsResponse>;

// refreshPendingTransactions

export type RefreshPendingTransactionsRequest = {};
export type RefreshPendingTransactionsResponse = Array<WalletTransaction>;
export type RefreshPendingTransactionsFunc = (
  request: RefreshPendingTransactionsRequest
) => Promise<RefreshPendingTransactionsResponse>;

// createWallet

export type CreateWalletRequest = {
  name: string,
  mnemonic: string,
  password: string,
  checkAddressesInUse: FilterFunc,
};
export type CreateWalletResponse = Wallet;
export type CreateWalletFunc = (
  request: CreateWalletRequest
) => Promise<CreateWalletResponse>;

// signAndBroadcast

export type SignAndBroadcastRequest = {
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
  getUTXOsForAddresses: AddressUtxoFunc,
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
  ledgerSignTxResp: LedgerSignTxResponse,
  unsignedTx: RustModule.Wallet.Transaction,
  sendTx: SendFunc,
};
export type PrepareAndBroadcastLedgerSignedTxResponse = SignedResponse;
export type PrepareAndBroadcastLedgerSignedTxFunc = (
  request: PrepareAndBroadcastLedgerSignedTxRequest
) => Promise<PrepareAndBroadcastLedgerSignedTxResponse>;

// createUnsignedTx

export type CreateUnsignedTxRequest = {
  accountId: number,
  receiver: string,
  amount: string, // in lovelaces
  getUTXOsForAddresses: AddressUtxoFunc,
  shouldSendAll: boolean,
};
export type CreateUnsignedTxResponse = UnsignedTxResponse;

export type CreateUnsignedTxFunc = (
  request: CreateUnsignedTxRequest
) => Promise<CreateUnsignedTxResponse>;

// createAddress

export type CreateAddressRequest = {};
export type CreateAddressResponse = WalletAddress;
export type CreateAddressFunc = (
  request: CreateAddressRequest
) => Promise<CreateAddressResponse>;

// saveAddress

export type SaveAddressRequest = {
  address: AdaAddress,
  addressType: AddressType,
};
export type SaveAddressResponse = void;
export type SaveAddressFunc = (
  request: SaveAddressRequest
) => Promise<SaveAddressResponse>;

// saveLastReceiveAddressIndex

export type SaveLastReceiveAddressIndexRequest = {
  index: number,
};
export type SaveLastReceiveAddressIndexResponse = void;
export type SaveLastReceiveAddressIndexFunc = (
  request: SaveLastReceiveAddressIndexRequest
) => Promise<SaveLastReceiveAddressIndexResponse>;

// saveTxs

export type SaveTxRequest = {
  txs: Array<AdaTransaction>
};
export type SaveTxResponse = void;
export type SaveTxFunc = (
  request: SaveTxRequest
) => Promise<SaveTxResponse>;

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
  recoveryPhrase: string,
  walletName: string,
  walletPassword: string,
  checkAddressesInUse: FilterFunc,
};
export type RestoreWalletResponse = Wallet;
export type RestoreWalletFunc = (
  request: RestoreWalletRequest
) => Promise<RestoreWalletResponse>;

// updateWalletMeta

export type UpdateWalletRequest = {
  walletId: string,
  name: string,
  assurance: AdaAssurance
};
export type UpdateWalletResponse = Wallet;
export type UpdateWalletFunc = (
  request: UpdateWalletRequest
) => Promise<UpdateWalletResponse>;

// updateWalletPassword

export type UpdateWalletPasswordRequest = {
  walletId: string,
  oldPassword: string,
  newPassword: string,
};
export type UpdateWalletPasswordResponse = boolean;
export type UpdateWalletPasswordFunc = (
  request: UpdateWalletPasswordRequest
) => Promise<UpdateWalletPasswordResponse>;

// createHardwareWallet

export type CreateHardwareWalletRequest = {
  walletName: string,
  publicMasterKey: string,
  hwFeatures: HWFeatures,
  checkAddressesInUse: FilterFunc,
};
export type CreateHardwareWalletResponse = Wallet;
export type CreateHardwareWalletFunc = (
  request: CreateHardwareWalletRequest
) => Promise<CreateHardwareWalletResponse>;

// getTransactionRowsToExport

export type GetTransactionRowsToExportRequest = {
  getTransactionsHistoryForAddresses: HistoryFunc,
  checkAddressesInUse: FilterFunc,
  // TODO: Implement date range
};
export type GetTransactionRowsToExportResponse = Array<TransactionExportRow>;
export type GetTransactionRowsToExportFunc = (
  request: GetTransactionRowsToExportRequest
) => Promise<GetTransactionRowsToExportResponse>;

// getPDFSecretKey

export type GetPdfSecretKeyRequest = {
  file: ?Blob,
  decryptionKey: ?string,
  redemptionType: string
};
export type GetPdfSecretKeyResponse = string;
export type GetPdfSecretKeyFunc = (
  request: GetPdfSecretKeyRequest
) => Promise<GetPdfSecretKeyResponse>;

// isValidRedemptionKey

export type IsValidRedemptionKeyRequest = {
  mnemonic: string,
};
export type IsValidRedemptionKeyResponse = boolean;
export type IsValidRedemptionKeyFunc = (
  request: IsValidRedemptionKeyRequest
) => Promise<IsValidRedemptionKeyResponse>;

// isValidPaperVendRedemptionKey

export type IsValidPaperVendRedemptionKeyRequest = {
  mnemonic: string,
};
export type IsValidPaperVendRedemptionKeyResponse = boolean;
export type IsValidPaperVendRedemptionKeyFunc = (
  request: IsValidPaperVendRedemptionKeyRequest
) => Promise<IsValidPaperVendRedemptionKeyResponse>;

// isValidRedemptionMnemonic

export type IsValidRedemptionMnemonicRequest = {
  mnemonic: string,
};
export type IsValidRedemptionMnemonicResponse = boolean;
export type IsValidRedemptionMnemonicFunc = (
  request: IsValidRedemptionMnemonicRequest
) => Promise<IsValidRedemptionMnemonicResponse>;

// redeemAda

export type RedeemAdaRequest = RedeemAdaParams;
export type RedeemAdaResponse = BigNumber;
export type RedeemAdaFunc = (
  request: RedeemAdaRequest
) => Promise<RedeemAdaResponse>;

// redeemPaperVendedAda

export type RedeemPaperVendedAdaRequest = RedeemPaperVendedAdaParams;
export type RedeemPaperVendedAdaResponse = BigNumber;
export type RedeemPaperVendedAdaFunc = (
  request: RedeemPaperVendedAdaRequest
) => Promise<RedeemPaperVendedAdaResponse>;

export const DEFAULT_ADDRESSES_PER_PAPER = 1;

export default class AdaApi {

  // noinspection JSMethodCanBeStatic
  createAdaPaper(
    {
      password,
      numAddresses
    }: CreateAdaPaperRequest = {}
  ): AdaPaper {
    const { words, scrambledWords } = generatePaperWalletSecret(password);
    const { addresses, accountPlate } = mnemonicsToExternalAddresses(
      words.join(' '),
      0, // paper wallets always use account 0
      numAddresses || DEFAULT_ADDRESSES_PER_PAPER,
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
      accountPlate: printAccountPlate ? accountPlate : undefined,
      network,
    }, s => {
      Logger.info('[PaperWalletRender] ' + s);
      if (updateStatus) {
        updateStatus(s);
      }
    });
    return res;
  }

  async getWallets(): Promise<GetWalletsResponse> {
    Logger.debug('AdaApi::getWallets called');
    try {
      const wallet = await getAdaWallet();
      const account = await getCurrentCryptoAccount();
      const wallets: Array<[AdaWallet, ?CryptoAccount]> = wallet
        ? [[wallet, account]]
        : [];
      // Refresh wallet data
      Logger.debug('AdaApi::getWallets success: ' + stringifyData(wallets));
      return wallets.map(([w, a]) => _createWalletFromServerData(w, a ? [a] : undefined));
    } catch (error) {
      Logger.error('AdaApi::getWallets error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  /**
   * Get all external addresses that were explicitly generated by the user
   * AKA cut off the extra addresses maintained for bip-44 compliance
   */
  async getExternalAddresses(
    request: GetAddressesRequest
  ): Promise<GetAddressesResponse> {
    Logger.debug('AdaApi::getExternalAddresses called: ' + stringifyData(request));
    try {
      const cuttoffIndex = (await getLastReceiveAddressIndex()) + 1;

      const accountIndex = await getCurrentCryptoAccount();
      if (!accountIndex) {
        throw new Error('Internal Error! Cannot get addresses without current account.');
      }
      const adaAddresses: AdaAddresses = await getAdaAddressesByType('External');
      Logger.debug('AdaApi::getExternalAddresses success: ' + stringifyData(adaAddresses));
      const addresses = adaAddresses
        .slice(0, cuttoffIndex)
        .map(address => _createAddressFromServerData(address));
      return new Promise(resolve => (
        resolve(
          {
            accountId: accountIndex.toString(),
            addresses
          }
        )
      ));
    } catch (error) {
      Logger.error('AdaApi::getExternalAddresses error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  async getBalance(request: GetBalanceRequest): Promise<GetBalanceResponse> {
    try {
      // get all wallet's addresses
      const adaAddresses = await getAdaAddressesList();
      const addresses = adaAddresses.map(address => address.cadId);
      const balance = await getBalance(addresses, request.getUTXOsSumsForAddresses);
      await updateAdaWalletBalance(balance);
      return balance;
    } catch (error) {
      Logger.error('AdaApi::getBalance error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  async getTxLastUpdatedDate(): Promise<GetTxLastUpdateDateResponse> {
    try {
      return await getTxsLastUpdatedDate();
    } catch (error) {
      Logger.error('AdaApi::getTxLastUpdatedDate error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  async refreshTransactions(request: GetTransactionsRequest): Promise<GetTransactionsResponse> {
    Logger.debug('AdaApi::refreshTransactions called: ' + stringifyData(request));
    const { skip = 0, limit } = request;
    try {
      const account = await getCurrentCryptoAccount();
      if (account && !request.isLocalRequest) {
        const existingTxs = await getTxsOrderedByLastUpdateDesc();
        const newTxs = await refreshTxs(
          account.root_cached_key,
          account.account,
          existingTxs,
          request.getTransactionsHistoryForAddresses,
          request.checkAddressesInUse,
          updateBestBlockNumber,
          getAddressList,
          saveAsAdaAddresses,
          await getLatestUsedIndex('Internal'),
          await getLatestUsedIndex('External'),
        );
        await updateTransactionList(newTxs);
      }
      const txHistory = await getTxsOrderedByDateDesc();
      Logger.debug('AdaApi::refreshTransactions success: ' + stringifyData(history));
      const transactions = limit
        ? txHistory.slice(skip, skip + limit)
        : txHistory;

      const lastBlockNumber = await getLastBlockNumber();
      const mappedTransactions = transactions.map(async data => {
        const { type, amount, fee } = await _getTxFinancialInfo(data);
        return _createTransactionFromServerData(data, type, amount, fee, lastBlockNumber);
      });
      return Promise.all(mappedTransactions).then(mappedTxs => Promise.resolve({
        transactions: mappedTxs,
        total: txHistory.length
      }));
    } catch (error) {
      Logger.error('AdaApi::refreshTransactions error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  async refreshPendingTransactions(): Promise<RefreshPendingTransactionsResponse> {
    Logger.debug('AdaApi::refreshPendingTransactions called');
    try {
      const pendingTxs = await getPendingTxs();
      const lastBlockNumber = await getLastBlockNumber();
      Logger.debug('AdaApi::refreshPendingTransactions success: ' + stringifyData(pendingTxs));
      return Promise.all(pendingTxs.map(async data => {
        const { type, amount, fee } = await _getTxFinancialInfo(data);
        return _createTransactionFromServerData(data, type, amount, fee, lastBlockNumber);
      }));
    } catch (error) {
      Logger.error('AdaApi::refreshPendingTransactions error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  async createWallet(
    request: CreateWalletRequest
  ): Promise<CreateWalletResponse> {
    // creating a wallet is the same as restoring a wallet
    return await this.restoreWallet({
      recoveryPhrase: request.mnemonic,
      walletName: request.name,
      walletPassword: request.password,
      checkAddressesInUse: request.checkAddressesInUse,
    });
  }

  async signAndBroadcast(
    request: SignAndBroadcastRequest
  ): Promise<SignAndBroadcastResponse> {
    Logger.debug('AdaApi::signAndBroadcast called');
    const { password, signRequest } = request;
    try {
      const masterKey = await getWalletMasterKey();
      if (masterKey == null) {
        throw new Error('No master key stored');
      }
      const cryptoWallet = getCryptoWalletFromMasterKey(masterKey, password);
      const currAccount = await getCurrentAccountIndex();
      if (currAccount == null) {
        throw new Error('no account selected');
      }
      const accountPrivateKey = cryptoWallet.bip44_account(
        RustModule.Wallet.AccountIndex.new(currAccount | HARD_DERIVATION_START)
      );
      const signedTx = await signTransaction(
        signRequest,
        accountPrivateKey
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

      const { ledgerSignTxResp, unsignedTx, sendTx } = request;
      const currentCryptoAccount = await getCurrentCryptoAccount();
      if (!currentCryptoAccount) {
        throw new Error('Internal Error! Cannot broadcast tx without current account.');
      }
      const cryptoAccount = currentCryptoAccount.root_cached_key;
      const response = await prepareAndBroadcastLedgerSignedTx(
        ledgerSignTxResp,
        unsignedTx,
        cryptoAccount,
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
    const allAdaAddresses = await getAdaAddressesList();
    try {
      const changeAdaAddr = await popBip44Address('Internal');

      let unsignedTxResponse;
      if (shouldSendAll) {
        unsignedTxResponse = await sendAllUnsignedTx(
          receiver,
          allAdaAddresses,
          request.getUTXOsForAddresses
        );
      } else {
        unsignedTxResponse = await newAdaUnsignedTx(
          receiver,
          amount,
          [changeAdaAddr],
          allAdaAddresses,
          request.getUTXOsForAddresses
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

  async createAddress(): Promise<CreateAddressResponse> {
    Logger.debug('AdaApi::createAddress called');
    try {
      const newAddress = await popBip44Address('External');
      Logger.info('AdaApi::createAddress success: ' + stringifyData(newAddress));
      return _createAddressFromServerData(newAddress);
    } catch (error) {
      if (error.id && error.id.includes('unusedAddressesError')) throw error;
      Logger.error('AdaApi::createAddress error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  /** TODO: This method is exposed to allow injecting data when testing */
  async saveAddress(
    request: SaveAddressRequest
  ): Promise<SaveAddressResponse> {
    try {
      await saveAdaAddress(request.address, request.addressType);
    } catch (error) {
      Logger.error('AdaApi::saveAddress error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  /** TODO: This method is exposed to allow injecting data when testing */
  async saveLastReceiveAddressIndex(
    request: SaveLastReceiveAddressIndexRequest
  ): Promise<SaveLastReceiveAddressIndexResponse> {
    Logger.debug('AdaApi::saveLastReceiveAddressIndex called');
    try {
      // also needed as some tests inject fake used transactiosn without coresponding txs
      await saveLastReceiveAddressIndex(request.index);
    } catch (error) {
      Logger.error('AdaApi::saveAddress error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  /** TODO: This method is exposed to allow injecting data when testing */
  async saveTxs(
    request: SaveTxRequest
  ): Promise<void> {
    try {
      await saveTxs(request.txs);
      await updateLastReceiveAddressIndex();
    } catch (error) {
      Logger.error('AdaApi::saveTxs error: ' + stringifyError(error));
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
      RustModule.Wallet.Address.from_base58(request.address);
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
    return isValidMnemonic(request.mnemonic, request.numberOfWords);
  }

  isValidPaperMnemonic(
    request: IsValidPaperMnemonicRequest
  ): IsValidPaperMnemonicResponse {
    return isValidPaperMnemonic(request.mnemonic, request.numberOfWords);
  }

  unscramblePaperMnemonic(
    request: UnscramblePaperMnemonicRequest
  ): UnscramblePaperMnemonicResponse {
    return unscramblePaperMnemonic(request.mnemonic, request.numberOfWords, request.password);
  }

  generateWalletRecoveryPhrase(): Promise<GenerateWalletRecoveryPhraseResponse> {
    Logger.debug('AdaApi::generateWalletRecoveryPhrase called');
    try {
      const response = new Promise(
        resolve => resolve(generateAdaAccountRecoveryPhrase())
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
   * Restore all addresses and caches the results locally
   * Note: addresses may not be detected if generated by a wallet that doesn't follow bip44
  */
  async restoreWallet(
    request: RestoreWalletRequest
  ): Promise<RestoreWalletResponse> {
    Logger.debug('AdaApi::restoreWallet called');
    const { recoveryPhrase, walletName, walletPassword, checkAddressesInUse, } = request;
    const assurance = 'CWANormal';
    const unit = 0;

    const walletInitData = {
      cwInitMeta: {
        cwName: walletName,
        cwAssurance: assurance,
        cwUnit: unit
      },
      cwBackupPhrase: {
        bpToList: recoveryPhrase // array of mnemonic words
      }
    };

    try {
      // recover master key
      const adaWallet = toAdaWallet(walletInitData);
      const masterKey = generateWalletMasterKey(
        walletInitData.cwBackupPhrase.bpToList,
        walletPassword
      );
      // always create the 0th account
      const cryptoAccount = createCryptoAccount(masterKey, walletPassword, 0);

      // save wallet info in localstorage
      await saveCryptoAccount(cryptoAccount);
      await createStoredWallet(adaWallet, masterKey);
      await restoreBip44Wallet(
        cryptoAccount.root_cached_key,
        cryptoAccount.account,
        adaWallet,
        masterKey,
        checkAddressesInUse,
        saveAsAdaAddresses
      );

      Logger.debug('AdaApi::restoreWallet success');
      const account = await getCurrentCryptoAccount();
      return _createWalletFromServerData(adaWallet, [account]);
    } catch (error) {
      Logger.error('AdaApi::restoreWallet error: ' + stringifyError(error));
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

  async updateWalletMeta(
    request: UpdateWalletRequest
  ): Promise<UpdateWalletResponse> {
    Logger.debug('AdaApi::updateWalletMeta called: ' + stringifyData(request));
    const { name, assurance } = request;
    const unit = 0; // unused field that is always 0

    const walletMeta = {
      cwName: name,
      cwAssurance: assurance,
      cwUnit: unit
    };
    try {
      const wallet: ?AdaWallet = await updateAdaWalletMetaParams(walletMeta);
      if (!wallet) throw new Error('not persistent wallet');

      Logger.debug('AdaApi::updateWalletMeta success: ' + stringifyData(wallet));
      const account = await getCurrentCryptoAccount();
      return _createWalletFromServerData(wallet, [account]);
    } catch (error) {
      Logger.error('AdaApi::updateWalletMeta error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  async updateWalletPassword(
    request: UpdateWalletPasswordRequest
  ): Promise<UpdateWalletPasswordResponse> {
    Logger.debug('AdaApi::updateWalletPassword called');
    const { oldPassword, newPassword } = request;
    try {
      await changeAdaWalletSpendingPassword({
        oldPassword,
        newPassword
      });
      Logger.debug('AdaApi::updateWalletPassword success');
      return true;
    } catch (error) {
      Logger.error(
        'AdaApi::updateWalletPassword error: ' + stringifyError(error)
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
      const { walletName, publicMasterKey, hwFeatures, checkAddressesInUse, } = request;
      const assurance = 'CWANormal';
      const unit = 0;

      const walletInitData = {
        cwInitMeta: {
          cwName: walletName,
          cwAssurance: assurance,
          cwUnit: unit
        },
        cwHardwareInfo: {
          publicMasterKey,
          vendor: hwFeatures.vendor,
          model: hwFeatures.model,
          deviceId: hwFeatures.deviceId,
          label: hwFeatures.label,
          majorVersion: hwFeatures.majorVersion,
          minorVersion: hwFeatures.minorVersion,
          patchVersion: hwFeatures.patchVersion,
          language: hwFeatures.language,
        },
      };
      // create ada wallet object for hardware wallet
      const hardwareWallet = toAdaHardwareWallet(walletInitData);

      // create crypto account object for hardware wallet
      const cryptoAccount = createHardwareWalletAccount(
        walletInitData.cwHardwareInfo.publicMasterKey,
        0 // always create the 0th account
      );

      // save wallet info in localstorage
      await saveCryptoAccount(cryptoAccount);
      await createStoredWallet(hardwareWallet, undefined);
      await restoreBip44Wallet(
        cryptoAccount.root_cached_key,
        cryptoAccount.account,
        hardwareWallet,
        undefined,
        checkAddressesInUse,
        saveAsAdaAddresses
      );

      Logger.debug('AdaApi::createHardwareWallet success');
      const account = await getCurrentCryptoAccount();
      return _createWalletFromServerData(hardwareWallet, [account]);
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
    request: GetTransactionRowsToExportRequest // eslint-disable-line no-unused-vars
  ): Promise<GetTransactionRowsToExportResponse> {
    try {
      Logger.debug('AdaApi::getTransactionRowsToExport: called');
      const account = await getCurrentCryptoAccount();
      if (account) {
        const existingTxs = await getTxsOrderedByLastUpdateDesc();
        const newTxs = await refreshTxs(
          account.root_cached_key,
          account.account,
          existingTxs,
          request.getTransactionsHistoryForAddresses,
          request.checkAddressesInUse,
          updateBestBlockNumber,
          getAddressList,
          saveAsAdaAddresses,
          await getLatestUsedIndex('Internal'),
          await getLatestUsedIndex('External'),
        );
        await updateTransactionList(newTxs);
      }
      const transactions = await getTxsOrderedByDateDesc();

      Logger.debug('AdaApi::getTransactionRowsToExport: success');
      return convertAdaTransactionsToExportRows(transactions);
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

  async getPDFSecretKey(
    request: GetPdfSecretKeyRequest
  ): Promise<GetPdfSecretKeyResponse> {
    Logger.debug('AdaApi::getPDFSecretKey called');
    try {
      const fileBuffer = await readFile(request.file);
      const decryptedFileBuffer = decryptFile(
        request.decryptionKey,
        request.redemptionType,
        fileBuffer
      );
      const parsedPDFString = await parsePDFFile(decryptedFileBuffer);
      return getSecretKey(parsedPDFString);
    } catch (error) {
      Logger.error('AdaApi::getWallets error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  isValidRedemptionKey(
    request: IsValidRedemptionKeyRequest
  ): Promise<IsValidRedemptionKeyResponse> {
    return Promise.resolve(
      isValidRedemptionKey(request.mnemonic)
    );
  }

  isValidPaperVendRedemptionKey(
    request: IsValidPaperVendRedemptionKeyRequest
  ): Promise<IsValidPaperVendRedemptionKeyResponse> {
    return Promise.resolve(
      isValidPaperVendRedemptionKey(request.mnemonic)
    );
  }

  isValidRedemptionMnemonic(
    request: IsValidRedemptionMnemonicRequest
  ): Promise<IsValidRedemptionMnemonicResponse> {
    return Promise.resolve(
      isValidMnemonic(
        request.mnemonic,
        config.adaRedemption.ADA_REDEMPTION_PASSPHRASE_LENGTH
      )
    );
  }

  redeemAda = async (
    request: RedeemAdaRequest
  ): Promise<RedeemAdaResponse> => {
    Logger.debug('AdaApi::redeemAda called');
    try {
      const transactionAmount = await redeemAda(request);
      Logger.debug('AdaApi::redeemAda success');
      return transactionAmount;
    } catch (error) {
      Logger.error('AdaApi::redeemAda error: ' + stringifyError(error));
      if (error instanceof RedemptionKeyAlreadyUsedError) {
        throw error;
      }
      throw new RedeemAdaError();
    }
  };

  redeemPaperVendedAda = async (
    request: RedeemPaperVendedAdaRequest
  ): Promise<RedeemPaperVendedAdaResponse> => {
    Logger.debug('AdaApi::redeemAdaPaperVend called');
    try {
      const transactionAmount = await redeemPaperVendedAda(request);
      Logger.debug('AdaApi::redeemAdaPaperVend success');
      return transactionAmount;
    } catch (error) {
      Logger.error('AdaApi::redeemAdaPaperVend error: ' + stringifyError(error));
      if (error instanceof RedemptionKeyAlreadyUsedError) {
        throw error;
      }
      throw new RedeemAdaError();
    }
  };

  loadDB = async (): Promise<void> => {
    await loadLovefieldDB();
  };

  dropDB = async (): Promise<void> => {
    await reset();
  }

  migrate = async (localstorageApi: LocalStorageApi): Promise<boolean> => {
    return await migrateToLatest(localstorageApi);
  }

  importLocalDatabase = async (data: any): Promise<void> => {
    importLovefieldDatabase(data);
  }

  exportLocalDatabase = async (): Promise<string> => {
    const data = await exportLovefieldDatabase();
    return JSON.stringify(data);
  }
}
// ========== End of class AdaApi =========

// ========== TRANSFORM SERVER DATA INTO FRONTEND MODELS =========

async function _getTxFinancialInfo(
  data: AdaTransaction
): Promise<{
  type: TransactionDirectionType,
  amount: BigNumber,
  fee: BigNumber
}> {
  // Note: logic taken from the mobile version of Yoroi
  // https://github.com/Emurgo/yoroi-mobile/blob/a3d72218b1e63f6362152aae2f03c8763c168795/src/crypto/transactionUtils.js#L73-L103

  const adaAddresses = await getAdaAddressesList();
  const addresses: Array<string> = adaAddresses.map(addr => addr.cadId);

  const ownInputs = data.ctInputs.filter(input => (
    addresses.includes(input[0])
  ));

  const ownOutputs = data.ctOutputs.filter(output => (
    addresses.includes(output[0])
  ));

  const _sum = (IOs: Array<AdaTransactionInputOutput>): BigNumber => (
    IOs.reduce(
      (accum: BigNumber, io) => accum.plus(new BigNumber(io[1].getCCoin, 10)),
      new BigNumber(0),
    )
  );

  const totalIn = _sum(data.ctInputs);
  const totalOut = _sum(data.ctOutputs);
  const ownIn = _sum(ownInputs);
  const ownOut = _sum(ownOutputs);

  const hasOnlyOwnInputs = ownInputs.length === data.ctInputs.length;
  const hasOnlyOwnOutputs = ownOutputs.length === data.ctOutputs.length;
  const isIntraWallet = hasOnlyOwnInputs && hasOnlyOwnOutputs;
  const isMultiParty =
    ownInputs.length > 0 && ownInputs.length !== data.ctInputs.length;

  const brutto = ownOut.minus(ownIn);
  const totalFee = totalOut.minus(totalIn); // should be negative

  if (isIntraWallet) {
    return {
      type: transactionTypes.SELF,
      amount: new BigNumber(0),
      fee: totalFee
    };
  }
  if (isMultiParty) {
    return {
      type: transactionTypes.MULTI,
      amount: brutto,
      // note: fees not accurate but no good way of finding which UTXO paid the fees in Yoroi
      fee: new BigNumber(0)
    };
  }
  if (hasOnlyOwnInputs) {
    return {
      type: transactionTypes.EXPEND,
      amount: brutto.minus(totalFee),
      fee: totalFee
    };
  }

  return {
    type: transactionTypes.INCOME,
    amount: brutto,
    fee: new BigNumber(0)
  };
}

const _createWalletFromServerData = action(
  'AdaApi::_createWalletFromServerData',
  (adaWallet: AdaWallet, accounts?: Array<CryptoAccount>) => {
    const walletObj = {
      id: adaWallet.cwId,
      amount: new BigNumber(adaWallet.cwAmount.getCCoin).dividedBy(
        LOVELACES_PER_ADA
      ),
      name: adaWallet.cwMeta.cwName,
      assurance: adaWallet.cwMeta.cwAssurance,
      passwordUpdateDate: adaWallet.cwPassphraseLU,
      type: adaWallet.cwType,
      hardwareInfo: adaWallet.cwHardwareInfo,
      accounts: undefined,
    };
    if (accounts) {
      walletObj.accounts = accounts.map(a => ({
        account: a.account,
        plate: createAccountPlate(a.root_cached_key.key().to_hex()),
      }));
    }
    return new Wallet(walletObj);
  }
);

const _createAddressFromServerData = action(
  'AdaApi::_createAddressFromServerData',
  (data: AdaAddress) => (
    new WalletAddress({
      id: data.cadId,
      path: makeCardanoBIP44Path(data.account, data.change, data.index),
      amount: new BigNumber(data.cadAmount.getCCoin).dividedBy(
        LOVELACES_PER_ADA
      ),
      isUsed: data.cadIsUsed
    })
  )
);

const _conditionToTxState = (condition: AdaTransactionCondition) => {
  switch (condition) {
    case 'CPtxApplying':
      return 'pending';
    case 'CPtxWontApply':
      return 'failed';
    default:
      return 'ok'; // CPtxInBlocks && CPtxNotTracked
  }
};

const _createTransactionFromServerData = action(
  'AdaApi::_createTransactionFromServerData',
  (
    data: AdaTransaction,
    type: TransactionDirectionType,
    amount: BigNumber,
    fee: BigNumber,
    lastBlockNumber: number,
  ) => {
    const { ctmTitle, ctmDescription, ctmDate } = data.ctMeta;
    return new WalletTransaction({
      id: data.ctId,
      title: ctmTitle || data.ctIsOutgoing ? 'Ada sent' : 'Ada received',
      type,
      amount: amount.dividedBy(LOVELACES_PER_ADA).plus(fee.dividedBy(LOVELACES_PER_ADA)),
      fee: fee.dividedBy(LOVELACES_PER_ADA),
      date: new Date(ctmDate),
      description: ctmDescription || '',
      numberOfConfirmations: lastBlockNumber - data.ctBlockNumber,
      addresses: {
        from: data.ctInputs.map(address => address[0]),
        to: data.ctOutputs.map(address => address[0])
      },
      state: _conditionToTxState(data.ctCondition)
    });
  }
);
