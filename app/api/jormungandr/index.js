// @flow
import BigNumber from 'bignumber.js';
import type { lf$Database } from 'lovefield';
import {
  Logger,
  stringifyError,
  stringifyData
} from '../../utils/logging';
import JormungandrTransaction from '../../domain/JormungandrTransaction';
import {
  HARD_DERIVATION_START,
  WalletTypePurpose,
  CoinTypes,
  ChainDerivations,
  STAKING_KEY_INDEX,
} from '../../config/numbersConfig';
import type {
  TransferSourceType,
} from '../../types/TransferTypes';
import {
  TransferSource,
} from '../../types/TransferTypes';
import {
  createStandardCip1852Wallet,
} from './lib/storage/bridge/walletBuilder/jormungandr';
import {
  getPendingTransactions,
  getAllTransactions,
  updateTransactions,
  removeAllTransactions,
  getForeignAddresses,
} from './lib/storage/bridge/updateTransactions';
import {
  filterAddressesByStakingKey,
  groupAddrContainsAccountKey,
  unwrapStakingKey,
} from './lib/storage/bridge/utils';
import { createCertificate, } from './lib/storage/bridge/delegationUtils';
import type { PoolRequest } from './lib/storage/bridge/delegationUtils';
import {
  flattenInsertTree,
  Bip44DerivationLevels,
} from '../ada/lib/storage/database/walletTypes/bip44/api/utils';
import type { CoreAddressT } from '../ada/lib/storage/database/primitives/enums';
import {
  PublicDeriver,
} from '../ada/lib/storage/models/PublicDeriver/index';
import {
  asDisplayCutoff,
} from '../ada/lib/storage/models/PublicDeriver/traits';
import { ConceptualWallet } from '../ada/lib/storage/models/ConceptualWallet/index';
import type { IHasLevels } from '../ada/lib/storage/models/ConceptualWallet/interfaces';
import type {
  IPublicDeriver,
  IGetAllUtxos,
  IGetSigningKey,
  IGetStakingKey,
  IDisplayCutoff,
  IGetAllUtxosResponse,
  IHasUtxoChains, IHasUtxoChainsRequest,
  Address, Addressing, UsedStatus, Value,
} from '../ada/lib/storage/models/PublicDeriver/interfaces';
import type {
  BaseGetTransactionsRequest,
  GetTransactionsResponse,
  RefreshPendingTransactionsRequest, RefreshPendingTransactionsResponse,
  RemoveAllTransactionsRequest, RemoveAllTransactionsResponse,
  GetForeignAddressesRequest, GetForeignAddressesResponse,
} from '../common/index';
import {
  sendAllUnsignedTx as jormungandrSendAllUnsignedTx,
  newAdaUnsignedTx as jormungandrNewAdaUnsignedTx,
  asAddressedUtxo as jormungandrAsAddressedUtxo,
  signTransaction as jormungandrSignTransaction,
} from './lib/transactions/utxoTransactions';
import {
  normalizeKey
} from './lib/transactions/utils';
import {
  generateWalletRootKey,
  generateAdaMnemonic,
} from '../ada/lib/cardanoCrypto/cryptoWallet';
import {
  isValidBip39Mnemonic,
} from '../common/lib/crypto/wallet';
import {
  GenericApiError,
  IncorrectWalletPasswordError,
  WalletAlreadyRestoredError,
  InvalidWitnessError,
  CheckAddressesInUseApiError,
} from '../common/errors';
import LocalizableError from '../../i18n/LocalizableError';
import { scanBip44Account, } from '../common/lib/restoration/bip44';
import { v2genAddressBatchFunc, } from '../ada/restoration/byron/scan';
import { scanCip1852Account, } from './lib/restoration/scan';
import type {
  BaseSignRequest,
  V3UnsignedTxAddressedUtxoResponse,
} from '../ada/transactions/types';
import { JormungandrTxSignRequest } from './lib/transactions/JormungandrTxSignRequest';
import { WrongPassphraseError } from '../ada/lib/cardanoCrypto/cryptoErrors';
import LocalStorageApi from '../localStorage/index';
import type {
  HistoryFunc,
  SendFunc,
  SignedResponse,
  BestBlockFunc,
} from './lib/state-fetch/types';
import type {
  FilterFunc,
} from '../common/lib/state-fetch/currencySpecificTypes';
import {
  getChainAddressesForDisplay,
} from '../ada/lib/storage/models/utils';
import {
  getAllAddressesForDisplay,
} from '../ada/lib/storage/bridge/traitUtils';
import { convertAdaTransactionsToExportRows } from '../ada/transactions/utils';
import { v3PublicToV2, v4Bip32PrivateToV3, } from './lib/crypto/utils';
import { migrateToLatest } from '../ada/lib/storage/adaMigration';
import type { TransactionExportRow } from '../export';

import { RustModule } from '../ada/lib/cardanoCrypto/rustLoader';
import environment from '../../environment';
import { Cip1852Wallet } from '../ada/lib/storage/models/Cip1852Wallet/wrapper';
import type {
  IsValidMnemonicRequest,
  IsValidMnemonicResponse,
  RestoreWalletRequest, RestoreWalletResponse,
} from '../common/types';
import { getApiForNetwork } from '../common/utils';
import { CoreAddressTypes } from '../ada/lib/storage/database/primitives/enums';
import { getJormungandrBaseConfig } from '../ada/lib/storage/database/prepackaged/networks';

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

export type JormungandrGetTransactionsRequest = {|
  getTransactionsHistoryForAddresses: HistoryFunc,
  checkAddressesInUse: FilterFunc,
  getBestBlock: BestBlockFunc,
|};

// createWallet

export type CreateWalletRequest = RestoreWalletRequest;
export type CreateWalletResponse = RestoreWalletResponse;
export type CreateWalletFunc = (
  request: CreateWalletRequest
) => Promise<CreateWalletResponse>;

// signAndBroadcast

export type SignAndBroadcastRequest = {|
  publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels> & IGetSigningKey,
  signRequest: BaseSignRequest<RustModule.WalletV3.InputOutput>,
  password: string,
  sendTx: SendFunc,
|};
export type SignAndBroadcastResponse = SignedResponse;
export type SignAndBroadcastFunc = (
  request: SignAndBroadcastRequest
) => Promise<SignAndBroadcastResponse>;

// createUnsignedTx

export type CreateUnsignedTxRequest = {|
  publicDeriver: IPublicDeriver<ConceptualWallet> & IGetAllUtxos & IHasUtxoChains,
  receiver: string,
  filter: ElementOf<IGetAllUtxosResponse> => boolean,
  ...({|
    amount: string, // in lovelaces
  |} | {|
    shouldSendAll: true,
  |}),
|};
export type CreateUnsignedTxResponse = JormungandrTxSignRequest;

export type CreateUnsignedTxFunc = (
  request: CreateUnsignedTxRequest
) => Promise<CreateUnsignedTxResponse>;

// createDelegationTx

export type CreateDelegationTxRequest = {|
  publicDeriver: IPublicDeriver<ConceptualWallet> & IGetAllUtxos & IHasUtxoChains & IGetStakingKey,
  poolRequest: PoolRequest,
  /**
   * TODO: right now we can only get this information from the network
   * but it should be held in storage eventually
   */
  valueInAccount: number,
|};
export type CreateDelegationTxResponse = {|
  unsignedTx: V3UnsignedTxAddressedUtxoResponse,
  totalAmountToDelegate: BigNumber,
|};

export type CreateDelegationTxFunc = (
  request: CreateDelegationTxRequest
) => Promise<CreateDelegationTxResponse>;

// signAndBroadcastDelegationTx

export type SignAndBroadcastDelegationTxRequest = {|
  publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels> & IGetSigningKey & IGetStakingKey,
  signRequest: BaseSignRequest<RustModule.WalletV3.InputOutput>,
  password: string,
  sendTx: SendFunc,
|};
export type SignAndBroadcastDelegationTxResponse = SignedResponse;

export type SignAndBroadcastDelegationTxFunc = (
  request: SignAndBroadcastDelegationTxRequest
) => Promise<SignAndBroadcastDelegationTxResponse>;

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
  rootPk: RustModule.WalletV3.Bip32PrivateKey,
  transferSource: TransferSourceType,
  accountIndex: number,
  checkAddressesInUse: FilterFunc,
|};
export type RestoreWalletForTransferResponse = {|
  masterKey: string,
  addresses: Array<{| ...Address, ...Addressing |}>,
|};
export type RestoreWalletForTransferFunc = (
  request: RestoreWalletForTransferRequest
) => Promise<RestoreWalletForTransferResponse>;

// getTransactionRowsToExport

export type GetTransactionRowsToExportRequest = {|
  publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels>,
|};
export type GetTransactionRowsToExportResponse = Array<TransactionExportRow>;
export type GetTransactionRowsToExportFunc = (
  request: GetTransactionRowsToExportRequest
) => Promise<GetTransactionRowsToExportResponse>;

export const DEFAULT_ADDRESSES_PER_PAPER = 1;

export default class JormungandrApi {

  /**
   * addresses get cutoff if there is a DisplayCutoff set
   */
  async getAllAddressesForDisplay(
    request: GetAllAddressesForDisplayRequest
  ): Promise<GetAllAddressesForDisplayResponse> {
    Logger.debug(`${nameof(JormungandrApi)}::${nameof(this.getAllAddressesForDisplay)} called: ` + stringifyData(request));
    try {
      return await getAllAddressesForDisplay(request);
    } catch (error) {
      Logger.error(`${nameof(JormungandrApi)}::${nameof(this.getAllAddressesForDisplay)} error: ` + stringifyError(error));
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
    Logger.debug(`${nameof(JormungandrApi)}::${nameof(this.getChainAddressesForDisplay)} called: ` + stringifyData(request));
    try {
      return await getChainAddressesForDisplay(request);
    } catch (error) {
      Logger.error(`${nameof(JormungandrApi)}::${nameof(this.getChainAddressesForDisplay)} error: ` + stringifyError(error));
      throw new GenericApiError();
    }
  }

  async refreshTransactions(
    request: {|
      ...BaseGetTransactionsRequest,
      ...JormungandrGetTransactionsRequest,
    |},
  ): Promise<GetTransactionsResponse> {
    Logger.debug(`${nameof(JormungandrApi)}::${nameof(this.refreshTransactions)} called: ${stringifyData(request)}`);
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
      Logger.debug(`${nameof(JormungandrApi)}::${nameof(this.refreshTransactions)} success: ` + stringifyData(fetchedTxs));

      const mappedTransactions = fetchedTxs.txs.map(tx => {
        return JormungandrTransaction.fromAnnotatedTx({
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
      Logger.error(`${nameof(JormungandrApi)}::${nameof(this.refreshTransactions)} error: ` + stringifyError(error));
      throw new GenericApiError();
    }
  }

  async refreshPendingTransactions(
    request: RefreshPendingTransactionsRequest
  ): Promise<RefreshPendingTransactionsResponse> {
    Logger.debug(`${nameof(JormungandrApi)}::${nameof(this.refreshPendingTransactions)} called`);
    try {
      const fetchedTxs = await getPendingTransactions({
        publicDeriver: request.publicDeriver,
      });
      Logger.debug(`${nameof(JormungandrApi)}::${nameof(this.refreshPendingTransactions)} success: ` + stringifyData(fetchedTxs));

      const mappedTransactions = fetchedTxs.txs.map(tx => {
        return JormungandrTransaction.fromAnnotatedTx({
          tx,
          addressLookupMap: fetchedTxs.addressLookupMap,
          api: getApiForNetwork(request.publicDeriver.getParent().getNetworkInfo()),
        });
      });
      return mappedTransactions;
    } catch (error) {
      Logger.error(`${nameof(JormungandrApi)}::${nameof(this.refreshPendingTransactions)} error: ` + stringifyError(error));
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
      Logger.error(`${nameof(JormungandrApi)}::${nameof(this.removeAllTransactions)} error: ` + stringifyError(error));
      throw new GenericApiError();
    }
  }

  async getForeignAddresses(
    request: GetForeignAddressesRequest
  ): Promise<GetForeignAddressesResponse> {
    try {
      return await getForeignAddresses({ publicDeriver: request.publicDeriver });
    } catch (error) {
      Logger.error(`${nameof(JormungandrApi)}::${nameof(this.getForeignAddresses)} error: ` + stringifyError(error));
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
    Logger.debug(`${nameof(JormungandrApi)}::${nameof(this.signAndBroadcast)} called`);
    const { password, signRequest } = request;
    try {
      const signingKey = await request.publicDeriver.getSigningKey();
      const normalizedKey = await request.publicDeriver.normalizeKey({
        ...signingKey,
        password,
      });

      const config = getJormungandrBaseConfig(
        request.publicDeriver.getParent().getNetworkInfo()
      ).reduce((acc, next) => Object.assign(acc, next), {});
      const signedTx = jormungandrSignTransaction(
        {
          senderUtxos: signRequest.senderUtxos,
          changeAddr: signRequest.changeAddr,
          IOs: signRequest.unsignedTx,
          certificate: signRequest.certificate,
        },
        request.publicDeriver.getParent().getPublicDeriverLevel(),
        RustModule.WalletV3.Bip32PrivateKey.from_bytes(
          Buffer.from(normalizedKey.prvKeyHex, 'hex')
        ),
        // Note: always false because we should only do legacy txs for wallet transfers
        false,
        undefined,
        config.ChainNetworkId,
      );
      const response = request.sendTx({
        id: Buffer.from(signedTx.id().as_bytes()).toString('hex'),
        encodedTx: signedTx.as_bytes(),
      });
      Logger.debug(
        `${nameof(JormungandrApi)}::${nameof(this.signAndBroadcast)} success: ` + stringifyData(response)
      );
      return response;
    } catch (error) {
      if (error instanceof WrongPassphraseError) {
        throw new IncorrectWalletPasswordError();
      }
      Logger.error(`${nameof(JormungandrApi)}::${nameof(this.signAndBroadcast)} error: ` + stringifyError(error));
      if (error instanceof InvalidWitnessError) {
        throw new InvalidWitnessError();
      }
      throw new GenericApiError();
    }
  }

  async createUnsignedTx(
    request: CreateUnsignedTxRequest
  ): Promise<CreateUnsignedTxResponse> {
    Logger.debug(`${nameof(JormungandrApi)}::${nameof(this.createUnsignedTx)} called`);
    const { receiver, } = request;
    try {
      const utxos = await request.publicDeriver.getAllUtxos();
      const filteredUtxos = utxos.filter(utxo => request.filter(utxo));

      const addressedUtxo = jormungandrAsAddressedUtxo(filteredUtxos);

      const config = getJormungandrBaseConfig(
        request.publicDeriver.getParent().getNetworkInfo()
      ).reduce((acc, next) => Object.assign(acc, next), {});

      let unsignedTxResponse;
      if (request.shouldSendAll != null) {
        unsignedTxResponse = jormungandrSendAllUnsignedTx(
          receiver,
          addressedUtxo,
          undefined,
          config.LinearFee,
        );
      } else if (request.amount != null) {
        const amount = request.amount;
        const nextUnusedInternal = await request.publicDeriver.nextInternal();
        if (nextUnusedInternal.addressInfo == null) {
          throw new Error(`${nameof(this.createUnsignedTx)} no internal addresses left. Should never happen`);
        }
        const changeAddr = nextUnusedInternal.addressInfo;
        unsignedTxResponse = jormungandrNewAdaUnsignedTx(
          [{
            address: receiver,
            amount
          }],
          [{
            address: changeAddr.addr.Hash,
            addressing: changeAddr.addressing,
          }],
          addressedUtxo,
          undefined,
          config.LinearFee,
        );
      } else {
        throw new Error(`${nameof(this.createUnsignedTx)} unknown param`);
      }
      Logger.debug(
        `${nameof(JormungandrApi)}::${nameof(this.createUnsignedTx)} success: ` + stringifyData(unsignedTxResponse)
      );
      return new JormungandrTxSignRequest({
        senderUtxos: unsignedTxResponse.senderUtxos,
        unsignedTx: unsignedTxResponse.IOs,
        changeAddr: unsignedTxResponse.changeAddr,
        certificate: unsignedTxResponse.certificate,
      });
    } catch (error) {
      Logger.error(
        `${nameof(JormungandrApi)}::${nameof(this.createUnsignedTx)} error: ` + stringifyError(error)
      );
      if (error.id.includes('NotEnoughMoneyToSendError')) throw error;
      throw new GenericApiError();
    }
  }

  async createDelegationTx(
    request: CreateDelegationTxRequest
  ): Promise<CreateDelegationTxResponse> {
    Logger.debug(`${nameof(JormungandrApi)}::${nameof(this.createDelegationTx)} called`);

    const config = getJormungandrBaseConfig(
      request.publicDeriver.getParent().getNetworkInfo()
    ).reduce((acc, next) => Object.assign(acc, next), {});

    const stakingKeyResp = await request.publicDeriver.getStakingKey();
    const stakingKey = unwrapStakingKey(stakingKeyResp.addr.Hash);

    const stakeDelegationCert = createCertificate(stakingKey, request.poolRequest);
    const certificate = RustModule.WalletV3.Certificate.stake_delegation(stakeDelegationCert);

    const allUtxo = await request.publicDeriver.getAllUtxos();
    const addressedUtxo = jormungandrAsAddressedUtxo(allUtxo);
    const nextUnusedInternal = await request.publicDeriver.nextInternal();
    if (nextUnusedInternal.addressInfo == null) {
      throw new Error(`${nameof(this.createDelegationTx)} no internal addresses left. Should never happen`);
    }
    const changeAddr = nextUnusedInternal.addressInfo;
    const unsignedTx = jormungandrNewAdaUnsignedTx(
      [],
      [{
        address: changeAddr.addr.Hash,
        addressing: changeAddr.addressing,
      }],
      addressedUtxo,
      certificate,
      config.LinearFee,
    );

    const allUtxosForKey = filterAddressesByStakingKey(
      stakingKey,
      allUtxo,
      false,
    );
    const utxoSum = allUtxosForKey.reduce(
      (sum, utxo) => sum.plus(new BigNumber(utxo.output.UtxoTransactionOutput.Amount)),
      new BigNumber(0)
    );

    const differenceAfterTx = getDifferenceAfterTx(
      unsignedTx,
      allUtxo,
      stakingKey
    );

    const totalAmountToDelegate = utxoSum
      .plus(differenceAfterTx) // subtract any part of the fee that comes from UTXO
      .plus(request.valueInAccount); // recall: Jormungandr rewards are compounding

    return {
      unsignedTx,
      totalAmountToDelegate
    };
  }

  async signAndBroadcastDelegationTx(
    request: SignAndBroadcastDelegationTxRequest
  ): Promise<SignAndBroadcastDelegationTxResponse> {
    Logger.debug(`${nameof(JormungandrApi)}::${nameof(this.signAndBroadcastDelegationTx)} called`);
    const { password, signRequest } = request;
    try {
      const config = getJormungandrBaseConfig(
        request.publicDeriver.getParent().getNetworkInfo()
      ).reduce((acc, next) => Object.assign(acc, next), {});

      const signingKeyFromStorage = await request.publicDeriver.getSigningKey();
      const stakingAddr = await request.publicDeriver.getStakingKey();
      const normalizedKey = await request.publicDeriver.normalizeKey({
        ...signingKeyFromStorage,
        password,
      });
      const normalizedSigningKey = RustModule.WalletV3.Bip32PrivateKey.from_bytes(
        Buffer.from(normalizedKey.prvKeyHex, 'hex')
      );
      const normalizedStakingKey = normalizeKey({
        addressing: stakingAddr.addressing,
        startingFrom: {
          key: normalizedSigningKey,
          level: request.publicDeriver.getParent().getPublicDeriverLevel(),
        },
      }).to_raw_key();
      const unsignedTx = signRequest.unsignedTx;
      if (request.signRequest.certificate == null) {
        throw new Error(`${nameof(this.signAndBroadcastDelegationTx)} missing certificate`);
      }
      const certificate = request.signRequest.certificate;
      const signedTx = jormungandrSignTransaction(
        {
          senderUtxos: signRequest.senderUtxos,
          changeAddr: signRequest.changeAddr,
          certificate,
          IOs: unsignedTx,
        },
        request.publicDeriver.getParent().getPublicDeriverLevel(),
        normalizedSigningKey,
        // Note: always false because we should only do legacy txs for wallet transfers
        false,
        {
          certificate,
          stakingKey: normalizedStakingKey,
        },
        config.ChainNetworkId,
      );
      const id = Buffer.from(signedTx.id().as_bytes()).toString('hex');
      const encodedTx = signedTx.as_bytes();
      const response = request.sendTx({
        id,
        encodedTx,
      });
      Logger.debug(
        `${nameof(JormungandrApi)}::${nameof(this.signAndBroadcastDelegationTx)} success: ` + stringifyData(response)
      );
      return response;
    } catch (error) {
      if (error instanceof WrongPassphraseError) {
        throw new IncorrectWalletPasswordError();
      }
      Logger.error(`${nameof(JormungandrApi)}::${nameof(this.signAndBroadcastDelegationTx)} error: ` + stringifyError(error));
      if (error instanceof InvalidWitnessError) {
        throw new InvalidWitnessError();
      }
      throw new GenericApiError();
    }
  }

  /** Note: This method is exposed to allow injecting data when testing */
  async saveLastReceiveAddressIndex(
    request: SaveLastReceiveAddressIndexRequest
  ): Promise<SaveLastReceiveAddressIndexResponse> {
    Logger.debug(`${nameof(JormungandrApi)}::${nameof(this.saveLastReceiveAddressIndex)} called`);
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
      Logger.error(`${nameof(JormungandrApi)}::${nameof(this.saveLastReceiveAddressIndex)} error: ` + stringifyError(error));
      throw new GenericApiError();
    }
  }

  static isValidMnemonic(
    request: IsValidMnemonicRequest,
  ): IsValidMnemonicResponse {
    return isValidBip39Mnemonic(request.mnemonic, request.numberOfWords);
  }

  generateWalletRecoveryPhrase(): Promise<GenerateWalletRecoveryPhraseResponse> {
    Logger.debug(`${nameof(JormungandrApi)}::${nameof(this.generateWalletRecoveryPhrase)} called`);
    try {
      const response = new Promise(
        resolve => resolve(generateAdaMnemonic())
      );
      Logger.debug(`${nameof(JormungandrApi)}::${nameof(this.generateWalletRecoveryPhrase)} success`);
      return response;
    } catch (error) {
      Logger.error(
        `${nameof(JormungandrApi)}::${nameof(this.generateWalletRecoveryPhrase)} error: ` + stringifyError(error)
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
    Logger.debug(`${nameof(JormungandrApi)}::${nameof(this.restoreWallet)} called`);
    const { recoveryPhrase, walletName, walletPassword, } = request;

    try {
      // Note: we only restore for 0th account
      const accountIndex = HARD_DERIVATION_START + 0;
      const rootPk = v4Bip32PrivateToV3(generateWalletRootKey(recoveryPhrase));
      const newPubDerivers = [];

      const wallet = await createStandardCip1852Wallet({
        db: request.db,
        discrimination: environment.getDiscriminant(),
        rootPk,
        password: walletPassword,
        accountIndex,
        walletName,
        accountName: '', // set account name empty now,
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

      Logger.debug(`${nameof(JormungandrApi)}::${nameof(this.restoreWallet)} success`);
      return {
        publicDerivers: newPubDerivers,
      };
    } catch (error) {
      Logger.error(`${nameof(JormungandrApi)}::${nameof(this.restoreWallet)} error: ` + stringifyError(error));
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

  /**
   * Restore all addresses like restoreWallet() but do not touch storage.
   */
  async restoreWalletForTransfer(
    request: RestoreWalletForTransferRequest
  ): Promise<RestoreWalletForTransferResponse> {
    Logger.debug(`${nameof(JormungandrApi)}::${nameof(this.restoreWalletForTransfer)} called`);
    const { rootPk, checkAddressesInUse } = request;

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
          v3PublicToV2(accountKey.to_public()),
          RustModule.WalletV2.DerivationScheme.v2(),
        );
        insertTree = await scanBip44Account({
          generateInternalAddresses: v2genAddressBatchFunc(
            key.bip44_chain(false),
          ),
          generateExternalAddresses: v2genAddressBatchFunc(
            key.bip44_chain(true),
          ),
          lastUsedInternal: -1,
          lastUsedExternal: -1,
          checkAddressesInUse,
          addByHash,
          type: CoreAddressTypes.CARDANO_LEGACY,
        });
      } else if (sourceIsJormungandrWallet) {
        const stakingKey = accountKey
          .derive(ChainDerivations.CHIMERIC_ACCOUNT)
          .derive(STAKING_KEY_INDEX)
          .to_public()
          .to_raw_key();

        const cip1852InsertTree = await scanCip1852Account({
          accountPublicKey: Buffer.from(accountKey.to_public().as_bytes()).toString('hex'),
          lastUsedInternal: -1,
          lastUsedExternal: -1,
          checkAddressesInUse,
          addByHash,
          stakingKey,
        });

        if (request.transferSource === TransferSource.JORMUNGANDR_UTXO) {
          insertTree = cip1852InsertTree.filter(child => (
            child.index === ChainDerivations.EXTERNAL || child.index === ChainDerivations.INTERNAL
          ));
        } else if (request.transferSource === TransferSource.JORMUNGANDR_CHIMERIC_ACCOUNT) {
          insertTree = cip1852InsertTree.filter(child => (
            child.index === ChainDerivations.CHIMERIC_ACCOUNT
          ));
        } else {
          throw new Error(`${nameof(this.restoreWalletForTransfer)} unexpected shelley type ${request.transferSource}`);
        }
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
      // We don't know what the problem was -> throw generic error
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
      Logger.debug(`${nameof(JormungandrApi)}::${nameof(this.getTransactionRowsToExport)}: success`);
      return convertAdaTransactionsToExportRows(fetchedTxs.txs);
    } catch (error) {
      Logger.error(`${nameof(JormungandrApi)}::${nameof(this.getTransactionRowsToExport)}: ` + stringifyError(error));

      if (error instanceof LocalizableError) {
        // we found it as a LocalizableError, so could throw it as it is.
        throw error;
      } else {
        // We don't know what the problem was so throw a generic error
        throw new GenericApiError();
      }
    }
  }

  async migrate(
    localstorageApi: LocalStorageApi,
    persistentDb: lf$Database,
  ): Promise<boolean> {
    return await migrateToLatest(
      localstorageApi,
      persistentDb,
    );
  }
}
// ========== End of class JormungandrApi =========

/**
 * Sending the transaction may affect the amount delegated in a few ways:
 * 1) The transaction fee for the transaction
 *  - may be paid with UTXO that either does or doesn't belong to our staking key.
 * 2) The change for the transaction
 *  - may get turned into a group address for our staking key
 */
function getDifferenceAfterTx(
  utxoResponse: V3UnsignedTxAddressedUtxoResponse,
  allUtxos: IGetAllUtxosResponse,
  stakingKey: RustModule.WalletV3.PublicKey,
): BigNumber {
  const stakingKeyString = Buffer.from(stakingKey.as_bytes()).toString('hex');

  let sumInForKey = new BigNumber(0);
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
      if (groupAddrContainsAccountKey(address, stakingKeyString, true)) {
        sumInForKey = sumInForKey.plus(new BigNumber(senderUtxo.amount));
      }
    }
  }

  let sumOutForKey = new BigNumber(0);
  {
    const outputs = utxoResponse.IOs.outputs();
    for (let i = 0; i < outputs.size(); i++) {
      const output = outputs.get(i);
      const address = Buffer.from(output.address().as_bytes()).toString('hex');
      if (groupAddrContainsAccountKey(address, stakingKeyString, true)) {
        const value = new BigNumber(output.value().to_str());
        sumOutForKey = sumOutForKey.plus(value);
      }
    }
  }

  return sumOutForKey.minus(sumInForKey);
}
