// @flow

import {
  Logger,
  stringifyError,
  stringifyData
} from '../../utils/logging';
import type {
  IsValidMnemonicRequest,
  IsValidMnemonicResponse,
  RestoreWalletRequest, RestoreWalletResponse,
  CreateWalletRequest, CreateWalletResponse,
} from '../common/types';
import type {
  BaseGetTransactionsRequest,
  GetTransactionsResponse,
  RefreshPendingTransactionsRequest,
  RefreshPendingTransactionsResponse,
  RemoveAllTransactionsRequest, RemoveAllTransactionsResponse,
  GetForeignAddressesRequest, GetForeignAddressesResponse,
} from '../common/index';
import {
  isValidBip39Mnemonic,
} from '../common/lib/crypto/wallet';
import type {
  IPublicDeriver,
  IGetAllUtxos,
  IDisplayCutoff,
  IHasUtxoChains, IHasUtxoChainsRequest,
  Address, Addressing, UsedStatus, Value,
} from '../ada/lib/storage/models/PublicDeriver/interfaces';
import { ConceptualWallet } from '../ada/lib/storage/models/ConceptualWallet/index';
import type { IHasLevels } from '../ada/lib/storage/models/ConceptualWallet/interfaces';
import type { TransactionExportRow } from '../export';
import ErgoTransaction from '../../domain/ErgoTransaction';
import { getApiForNetwork } from '../common/utils';
import {
  GenericApiError,
  WalletAlreadyRestoredError,
} from '../common/errors';
import LocalizableError from '../../i18n/LocalizableError';
import type { CoreAddressT } from '../ada/lib/storage/database/primitives/enums';
import {
  getChainAddressesForDisplay,
} from '../ada/lib/storage/models/utils';
import {
  getAllAddressesForDisplay,
} from '../ada/lib/storage/bridge/traitUtils';
import {
  HARD_DERIVATION_START,
} from '../../config/numbersConfig';
import { generateWalletRootKey } from './lib/crypto/wallet';
import {
  Bip44Wallet,
} from '../ada/lib/storage/models/Bip44Wallet/wrapper';
import {
  PublicDeriver,
} from '../ada/lib/storage/models/PublicDeriver/index';
import { createStandardBip44Wallet } from './lib/walletBuilder/builder';
import {
  generateAdaMnemonic,
} from '../ada/lib/cardanoCrypto/cryptoWallet';

// getTransactionRowsToExport

export type GetTransactionRowsToExportRequest = {|
  publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels>,
|};
export type GetTransactionRowsToExportResponse = Array<TransactionExportRow>;
export type GetTransactionRowsToExportFunc = (
  request: GetTransactionRowsToExportRequest
) => Promise<GetTransactionRowsToExportResponse>;

// ergo refreshTransactions

export type ErgoGetTransactionsRequest = {|
|};

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

// generateWalletRecoveryPhrase

export type GenerateWalletRecoveryPhraseRequest = {||};
export type GenerateWalletRecoveryPhraseResponse = Array<string>;
export type GenerateWalletRecoveryPhraseFunc = (
  request: GenerateWalletRecoveryPhraseRequest
) => Promise<GenerateWalletRecoveryPhraseResponse>;

export default class ErgoApi {

  static isValidMnemonic(
    request: IsValidMnemonicRequest,
  ): IsValidMnemonicResponse {
    return isValidBip39Mnemonic(request.mnemonic, request.numberOfWords);
  }

  async getTransactionRowsToExport(
    _request: GetTransactionRowsToExportRequest
  ): Promise<GetTransactionRowsToExportResponse> {
    throw new Error(`${nameof(this.getTransactionRowsToExport)} TODO`);
  }

  async refreshTransactions(
    request: {|
      ...BaseGetTransactionsRequest,
      ...ErgoGetTransactionsRequest,
    |},
  ): Promise<GetTransactionsResponse> {
    Logger.debug(`${nameof(ErgoApi)}::${nameof(this.refreshTransactions)} called: ${stringifyData(request)}`);
    try {
      if (!request.isLocalRequest) {
        // TODO: implement tx syncing
      }
      const fetchedTxs = {
        txs: [], // not implemented yet
        addressLookupMap: new Map(),
      };
      Logger.debug(`${nameof(ErgoApi)}::${nameof(this.refreshTransactions)} success: ` + stringifyData(fetchedTxs));

      const mappedTransactions = fetchedTxs.txs.map(tx => {
        return ErgoTransaction.fromAnnotatedTx({
          tx,
          addressLookupMap: fetchedTxs.addressLookupMap,
          api: getApiForNetwork(request.publicDeriver.getParent().getNetworkInfo()),
        });
      });
      return {
        transactions: mappedTransactions,
        total: mappedTransactions.length
      };
    } catch (error) {
      Logger.error(`${nameof(ErgoApi)}::${nameof(this.refreshTransactions)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async refreshPendingTransactions(
    _request: RefreshPendingTransactionsRequest
  ): Promise<RefreshPendingTransactionsResponse> {
    return []; // not implemented yet
    // Logger.debug(`${nameof(ErgoApi)}::${nameof(this.refreshPendingTransactions)} called`);
    // try {
    //   const fetchedTxs = await getPendingTransactions({
    //     publicDeriver: request.publicDeriver,
    //   });
    //   Logger.debug(`${nameof(ErgoApi)}::${nameof(this.refreshPendingTransactions)} success: ` + stringifyData(fetchedTxs));

    //   const mappedTransactions = fetchedTxs.txs.map(tx => {
    //     return ErgoTransaction.fromAnnotatedTx({
    //       tx,
    //       addressLookupMap: fetchedTxs.addressLookupMap,
    //       api: getApiForNetwork(request.publicDeriver.getParent().getNetworkInfo()),
    //     });
    //   });
    //   return mappedTransactions;
    // } catch (error) {
    //   Logger.error(`${nameof(ErgoApi)}::${nameof(this.refreshPendingTransactions)} error: ` + stringifyError(error));
    //   if (error instanceof LocalizableError) throw error;
    //   throw new GenericApiError();
    // }
  }

  async removeAllTransactions(
    _request: RemoveAllTransactionsRequest
  ): Promise<RemoveAllTransactionsResponse> {
    throw new Error(`${nameof(ErgoApi)}::${nameof(this.getForeignAddresses)} not implemented yet`);
  }

  async getForeignAddresses(
    _request: GetForeignAddressesRequest
  ): Promise<GetForeignAddressesResponse> {
    throw new Error(`${nameof(ErgoApi)}::${nameof(this.getForeignAddresses)} not implemented yet`);
  }

  /**
   * for the external chain, we truncate based on cutoff
   * for the internal chain, we truncate based on the last used
   */
  async getChainAddressesForDisplay(
    request: GetChainAddressesForDisplayRequest
  ): Promise<GetChainAddressesForDisplayResponse> {
    Logger.debug(`${nameof(ErgoApi)}::${nameof(this.getChainAddressesForDisplay)} called` + stringifyData(request));
    try {
      return await getChainAddressesForDisplay(request);
    } catch (error) {
      Logger.error(`${nameof(ErgoApi)}::${nameof(this.getChainAddressesForDisplay)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  /**
   * addresses get cutoff if there is a DisplayCutoff set
   */
  async getAllAddressesForDisplay(
    request: GetAllAddressesForDisplayRequest
  ): Promise<GetAllAddressesForDisplayResponse> {
    Logger.debug(`${nameof(ErgoApi)}::${nameof(this.getAllAddressesForDisplay)} called: ` + stringifyData(request));
    try {
      return await getAllAddressesForDisplay(request);
    } catch (error) {
      Logger.error(`${nameof(ErgoApi)}::${nameof(this.getAllAddressesForDisplay)} error: ` + stringifyError(error));
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async createWallet(
    request: CreateWalletRequest
  ): Promise<CreateWalletResponse> {
    // creating a wallet is the same as restoring a wallet
    return await this.restoreWallet(request);
  }

  /**
   * Creates wallet and saves result to DB
  */
  async restoreWallet(
    request: RestoreWalletRequest
  ): Promise<RestoreWalletResponse> {
    Logger.debug(`${nameof(ErgoApi)}::${nameof(this.restoreWallet)} called`);
    const { recoveryPhrase, walletName, walletPassword, } = request;

    try {
      // Note: we only restore for 0th account
      const accountIndex = HARD_DERIVATION_START + 0;
      const rootPk = generateWalletRootKey(recoveryPhrase);
      const newPubDerivers = [];

      const wallet = await createStandardBip44Wallet({
        db: request.db,
        rootPk,
        password: walletPassword,
        accountIndex,
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

      Logger.debug(`${nameof(ErgoApi)}::${nameof(this.restoreWallet)} success`);
      return {
        publicDerivers: newPubDerivers,
      };
    } catch (error) {
      Logger.error(`${nameof(ErgoApi)}::${nameof(this.restoreWallet)} error: ` + stringifyError(error));
      // TODO: handle case where wallet already exists (this if case is never hit)
      if (error.message.includes('Wallet with that mnemonics already exists')) {
        throw new WalletAlreadyRestoredError();
      }

      // Refer: https://github.com/Emurgo/yoroi-frontend/pull/1055
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  generateWalletRecoveryPhrase(): Promise<GenerateWalletRecoveryPhraseResponse> {
    Logger.debug(`${nameof(ErgoApi)}::${nameof(this.generateWalletRecoveryPhrase)} called`);
    try {
      const response = new Promise(
        resolve => resolve(generateAdaMnemonic())
      );
      Logger.debug(`${nameof(ErgoApi)}::${nameof(this.generateWalletRecoveryPhrase)} success`);
      return response;
    } catch (error) {
      Logger.error(
        `${nameof(ErgoApi)}::${nameof(this.generateWalletRecoveryPhrase)} error: ` + stringifyError(error)
      );
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }
}
