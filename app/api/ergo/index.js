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
} from '../common/types';
import type {
  BaseGetTransactionsRequest,
  GetTransactionsResponse,
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
import WalletTransaction from '../../domain/WalletTransaction';
import { getApiForNetwork } from '../common/utils';
import {
  GenericApiError,
  WalletAlreadyRestoredError,
} from '../common/errors';
import type { CoreAddressT } from '../ada/lib/storage/database/primitives/enums';
import {
  getChainAddressesForDisplay,
} from '../ada/lib/storage/models/utils';
import {
  getAllAddressesForDisplay,
} from '../ada/lib/storage/bridge/traitUtils';
import {
  CheckAddressesInUseApiError,
} from '../ada/errors';
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
import { Network } from '@coinbarn/ergo-ts';

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
        txs: [],
        addressLookupMap: new Map(),
      };
      Logger.debug(`${nameof(ErgoApi)}::${nameof(this.refreshTransactions)} success: ` + stringifyData(fetchedTxs));

      const mappedTransactions = fetchedTxs.txs.map(tx => {
        return WalletTransaction.fromAnnotatedTx({
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
    Logger.debug(`${nameof(ErgoApi)}::${nameof(this.getChainAddressesForDisplay)} called` + stringifyData(request));
    try {
      return await getChainAddressesForDisplay(request);
    } catch (error) {
      Logger.error(`${nameof(ErgoApi)}::${nameof(this.getChainAddressesForDisplay)} error: ` + stringifyError(error));
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
      throw new GenericApiError();
    }
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
      });

      const bip44Wallet = await Bip44Wallet.createBip44Wallet(
        request.db,
        wallet.bip44WrapperRow,
        Network.Mainnet,
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
      if (error instanceof CheckAddressesInUseApiError) {
        // CheckAddressesInUseApiError throw it as it is.
        throw error;
      } else {
        // We don't know what the problem was so throw a generic error
        throw new GenericApiError();
      }
    }
  }
}
