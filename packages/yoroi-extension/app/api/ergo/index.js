// @flow

import BigNumber from 'bignumber.js';
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
  SendTokenList,
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
  IDisplayCutoff,
  IHasUtxoChains, IHasUtxoChainsRequest,
  Address, AddressType, Addressing, UsedStatus, Value,
  IGetAllUtxos,
  IGetAllUtxosResponse,
  IGetSigningKey,
} from '../ada/lib/storage/models/PublicDeriver/interfaces';
import { ErgoTxSignRequest, } from './lib/transactions/ErgoTxSignRequest';
import { ConceptualWallet } from '../ada/lib/storage/models/ConceptualWallet/index';
import type { IHasLevels } from '../ada/lib/storage/models/ConceptualWallet/interfaces';
import type { TransactionExportRow } from '../export';
import ErgoTransaction from '../../domain/ErgoTransaction';
import {
  GenericApiError,
  WalletAlreadyRestoredError,
  IncorrectWalletPasswordError,
  InvalidWitnessError,
} from '../common/errors';
import LocalizableError from '../../i18n/LocalizableError';
import type { CoreAddressT } from '../ada/lib/storage/database/primitives/enums';
import {
  getChainAddressesForDisplay,
} from '../ada/lib/storage/models/utils';
import type {
  HistoryFunc,
  BestBlockFunc,
  AssetInfoFunc,
  SendFunc,
  SignedResponse,
} from './lib/state-fetch/types';
import type {
  FilterFunc,
} from '../common/lib/state-fetch/currencySpecificTypes';
import {
  getAllAddressesForDisplay,
  rawGetAddressRowsForWallet,
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
  getPendingTransactions,
  getAllTransactions,
  updateTransactions,
  removeAllTransactions,
  getForeignAddresses,
} from './lib/storage/bridge/updateTransactions';
import {
  generateAdaMnemonic,
} from '../ada/lib/cardanoCrypto/cryptoWallet';
import {
  convertErgoTransactionsToExportRows,
  asAddressedUtxo,
  multiTokenFromRemote,
} from './lib/transactions/utils';
import {
  sendAllUnsignedTx,
  newErgoUnsignedTx,
  signTransaction,
} from './lib/transactions/utxoTransaction';
import type {
  ErgoAddressedUtxo,
} from './lib/transactions/types';
import type { NetworkRow, TokenRow, } from '../ada/lib/storage/database/primitives/tables';
import {
  getErgoBaseConfig,
} from '../ada/lib/storage/database/prepackaged/networks';
import { BIP32PrivateKey, } from '../common/lib/crypto/keys/keyRepository';
import { WrongPassphraseError } from '../ada/lib/cardanoCrypto/cryptoErrors';
import type { DefaultTokenEntry } from '../common/lib/MultiToken';
import { hasSendAllDefault, builtSendTokenList } from '../common/index';
import { getReceiveAddress } from '../../stores/stateless/addressStores';
import {
  GetPathWithSpecific,
  GetAddress,
} from '../ada/lib/storage/database/primitives/api/read';
import {
  getAllSchemaTables,
  raii,
  mapToTables,
} from '../ada/lib/storage/database/utils';
import { GetDerivationSpecific, } from '../ada/lib/storage/database/walletTypes/common/api/read';
import { MultiToken } from '../common/lib/MultiToken';
import { TxStatusCodes } from '../ada/lib/storage/database/primitives/enums';
import { asHasLevels } from '../ada/lib/storage/models/PublicDeriver/traits';

export function fixUtxoToStringValues<T>(utxo: T): T {
  // $FlowFixMe[incompatible-type]
  if (utxo.value != null) {
    // $FlowFixMe[incompatible-use]
    utxo.value = String(utxo.value);
  }
  // $FlowFixMe[incompatible-use]
  utxo.assets?.forEach(a => {
    if (a.amount != null) {
      a.amount = String(a.amount);
    }
  });
  return utxo;
}

// getTransactionRowsToExport

export type GetTransactionRowsToExportRequest = {|
  publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels>,
  getDefaultToken: number => $ReadOnly<TokenRow>,
|};
export type GetTransactionRowsToExportResponse = Array<TransactionExportRow>;
export type GetTransactionRowsToExportFunc = (
  request: GetTransactionRowsToExportRequest
) => Promise<GetTransactionRowsToExportResponse>;

// ergo refreshTransactions

export type ErgoGetTransactionsRequest = {|
  getTransactionsHistoryForAddresses: HistoryFunc,
  checkAddressesInUse: FilterFunc,
  getAssetInfo: AssetInfoFunc,
  getBestBlock: BestBlockFunc,
|};

// getChainAddressesForDisplay

export type GetChainAddressesForDisplayRequest = {|
  publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels> & IHasUtxoChains & IDisplayCutoff,
  chainsRequest: IHasUtxoChainsRequest,
  type: CoreAddressT,
|};
export type GetChainAddressesForDisplayResponse = Array<{|
  ...Address, ...AddressType, ...Value, ...Addressing, ...UsedStatus
|}>;
export type GetChainAddressesForDisplayFunc = (
  request: GetChainAddressesForDisplayRequest
) => Promise<GetChainAddressesForDisplayResponse>;

// getAllAddressesForDisplay

export type GetAllAddressesForDisplayRequest = {|
  publicDeriver: IPublicDeriver<ConceptualWallet>,
  type: CoreAddressT,
|};
export type GetAllAddressesForDisplayResponse = Array<{|
  ...Address, ...Value, ...Addressing, ...UsedStatus, ...AddressType,
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

// createUnsignedTx

export type CreateUnsignedTxRequest = {|
  publicDeriver: IPublicDeriver<ConceptualWallet> & IGetAllUtxos,
  receiver: string,
  filter: ElementOf<IGetAllUtxosResponse> => boolean,
  tokens: SendTokenList,
  currentHeight: number,
  txFee: BigNumber,
|};
export type CreateUnsignedTxResponse = ErgoTxSignRequest;
export type CreateUnsignedTxFunc = (
  request: CreateUnsignedTxRequest
) => Promise<CreateUnsignedTxResponse>;

// createUnsignedTxForUtxos

export type CreateUnsignedTxForUtxosRequest = {|
  receivers: Array<{|
    ...Address,
    ...InexactSubset<Addressing>,
  |}>,
  network: $ReadOnly<NetworkRow>,
  defaultToken: DefaultTokenEntry,
  tokens: SendTokenList,
  utxos: Array<ErgoAddressedUtxo>,
  currentHeight: number,
  txFee: BigNumber,
|};
export type CreateUnsignedTxForUtxosResponse = ErgoTxSignRequest;
export type CreateUnsignedTxForUtxosFunc = (
  request: CreateUnsignedTxForUtxosRequest
) => Promise<CreateUnsignedTxForUtxosResponse>;

// signAndBroadcast

export type SignAndBroadcastRequest = {|
  publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels> & IGetSigningKey,
  signRequest: ErgoTxSignRequest,
  password: string,
  sendTx: SendFunc,
|};
export type SignAndBroadcastResponse = SignedResponse;
export type SignAndBroadcastFunc = (
  request: SignAndBroadcastRequest
) => Promise<SignAndBroadcastResponse>;

export default class ErgoApi {

  static isValidMnemonic(
    request: IsValidMnemonicRequest,
  ): IsValidMnemonicResponse {
    return isValidBip39Mnemonic(request.mnemonic, request.numberOfWords);
  }

  async getTransactionRowsToExport(
    request: GetTransactionRowsToExportRequest
  ): Promise<GetTransactionRowsToExportResponse> {
    try {
      const fetchedTxs = await getAllTransactions({
        publicDeriver: request.publicDeriver,
      });
      Logger.debug(`${nameof(ErgoApi)}::${nameof(this.getTransactionRowsToExport)}: success`);
      return convertErgoTransactionsToExportRows(
        fetchedTxs.txs,
        request.getDefaultToken(request.publicDeriver.getParent().getNetworkInfo().NetworkId)
      );
    } catch (error) {
      Logger.error(`${nameof(ErgoApi)}::${nameof(this.getTransactionRowsToExport)}: ` + stringifyError(error));

      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async refreshTransactions(
    request: {|
      ...BaseGetTransactionsRequest,
      ...ErgoGetTransactionsRequest,
    |},
  ): Promise<GetTransactionsResponse> {
    Logger.debug(`${nameof(ErgoApi)}::${nameof(this.refreshTransactions)} called: ${stringifyData(request)}`);
    const { skip = 0, limit } = request;
    try {
      if (!request.isLocalRequest) {
        await updateTransactions(
          request.publicDeriver.getDb(),
          request.publicDeriver,
          request.checkAddressesInUse,
          request.getTransactionsHistoryForAddresses,
          request.getAssetInfo,
          request.getBestBlock,
        );
      }
      const fetchedTxs = await getAllTransactions({
        publicDeriver: request.publicDeriver,
        skip,
        limit,
      },);
      Logger.debug(`${nameof(ErgoApi)}::${nameof(this.refreshTransactions)} success: ` + stringifyData(fetchedTxs));

      const mappedTransactions = fetchedTxs.txs.map(tx => {
        return ErgoTransaction.fromAnnotatedTx({
          tx,
          addressLookupMap: fetchedTxs.addressLookupMap,
          network: request.publicDeriver.getParent().getNetworkInfo(),
          defaultToken: request.publicDeriver.getParent().getDefaultToken(),
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
    request: RefreshPendingTransactionsRequest
  ): Promise<RefreshPendingTransactionsResponse> {
    Logger.debug(`${nameof(ErgoApi)}::${nameof(this.refreshPendingTransactions)} called`);
    try {
      const fetchedTxs = await getPendingTransactions({
        publicDeriver: request.publicDeriver,
      });
      Logger.debug(`${nameof(ErgoApi)}::${nameof(this.refreshPendingTransactions)} success: ` + stringifyData(fetchedTxs));

      const mappedTransactions = fetchedTxs.txs.map(tx => {
        return ErgoTransaction.fromAnnotatedTx({
          tx,
          addressLookupMap: fetchedTxs.addressLookupMap,
          network: request.publicDeriver.getParent().getNetworkInfo(),
          defaultToken: request.publicDeriver.getParent().getDefaultToken(),
        });
      });
      return mappedTransactions;
    } catch (error) {
      Logger.error(`${nameof(ErgoApi)}::${nameof(this.refreshPendingTransactions)} error: ` + stringifyError(error));
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
      Logger.error(`${nameof(ErgoApi)}::${nameof(this.removeAllTransactions)} error: ` + stringifyError(error));
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
      Logger.error(`${nameof(ErgoApi)}::${nameof(this.getForeignAddresses)} error: ` + stringifyError(error));
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
      if (error.message != null && error.message.includes('Wallet with that mnemonics already exists')) {
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

  async createUnsignedTx(
    request: CreateUnsignedTxRequest
  ): Promise<CreateUnsignedTxResponse> {
    const utxos = await request.publicDeriver.getAllUtxos();

    // note: don't filter to just the entries for the token we want to send
    // since we may need other UTXO entries to cover the fee
    const filteredUtxos = utxos.filter(utxo => request.filter(utxo));

    const addressedUtxo = filteredUtxos.map(asAddressedUtxo);

    const receivers = [{
      address: request.receiver
    }];

    // note: we need to create a change address IFF we're not sending all of the default asset
    if (!hasSendAllDefault(request.tokens)) {
      const change = await getReceiveAddress(request.publicDeriver);
      if (change == null) {
        throw new Error(`${nameof(this.createUnsignedTx)} no p2pk address found. Should never happen`);
      }
      receivers.push({
        address: change.addr.Hash,
        addressing: change.addressing,
      });
    }
    return this.createUnsignedTxForUtxos({
      receivers,
      network: request.publicDeriver.getParent().getNetworkInfo(),
      defaultToken: request.publicDeriver.getParent().getDefaultToken(),
      utxos: addressedUtxo,
      tokens: request.tokens,
      txFee: request.txFee,
      currentHeight: request.currentHeight,
    });
  }

  async createUnsignedTxForUtxos(
    request: CreateUnsignedTxForUtxosRequest
  ): Promise<CreateUnsignedTxForUtxosResponse> {
    Logger.debug(`${nameof(ErgoApi)}::${nameof(this.createUnsignedTxForUtxos)} called`);
    try {
      const config = getErgoBaseConfig(
        request.network
      ).reduce((acc, next) => Object.assign(acc, next), {});

      const protocolParams = {
        FeeAddress: config.FeeAddress,
        MinimumBoxValue: config.MinimumBoxValue,
        NetworkId: request.network.NetworkId,
      };

      let unsignedTxResponse;
      if (hasSendAllDefault(request.tokens)) {
        if (request.receivers.length !== 1) {
          throw new Error(`${nameof(this.createUnsignedTxForUtxos)} wrong output size for sendAll`);
        }
        const receiver = request.receivers[0];
        unsignedTxResponse = sendAllUnsignedTx({
          receiver,
          utxos: request.utxos,
          currentHeight: request.currentHeight,
          txFee: request.txFee,
          protocolParams,
        });
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
        unsignedTxResponse = newErgoUnsignedTx({
          outputs: otherAddresses.length === 1
            ? [{
                address: otherAddresses[0].address,
                amount: builtSendTokenList(
                  request.defaultToken,
                  request.tokens,
                  request.utxos.map(utxo => multiTokenFromRemote(utxo, protocolParams.NetworkId)),
                ),
              }]
            : [],
          changeAddr: {
            address: changeAddr.address,
            addressing: changeAddr.addressing,
          },
          utxos: request.utxos,
          txFee: request.txFee,
          currentHeight: request.currentHeight,
          protocolParams: {
            ...protocolParams,
            DefaultIdentifier: request.defaultToken.defaultIdentifier,
          }
        });
      }
      Logger.debug(
        `${nameof(ErgoApi)}::${nameof(this.createUnsignedTxForUtxos)} success: ` + stringifyData(unsignedTxResponse)
      );
      return new ErgoTxSignRequest({
        senderUtxos: unsignedTxResponse.senderUtxos,
        unsignedTx: unsignedTxResponse.unsignedTx,
        changeAddr: unsignedTxResponse.changeAddr,
        networkSettingSnapshot: {
          FeeAddress: config.FeeAddress,
          ChainNetworkId: (Number.parseInt(config.ChainNetworkId, 10): any),
          NetworkId: request.network.NetworkId,
        },
      });
    } catch (error) {
      Logger.error(
        `${nameof(ErgoApi)}::${nameof(this.createUnsignedTxForUtxos)} error: ` + stringifyError(error)
      );
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async signAndBroadcast(
    request: SignAndBroadcastRequest
  ): Promise<SignAndBroadcastResponse> {
    Logger.debug(`${nameof(ErgoApi)}::${nameof(this.signAndBroadcast)} called`);
    const { password } = request;
    try {
      const signingKey = await request.publicDeriver.getSigningKey();
      const normalizedKey = await request.publicDeriver.normalizeKey({
        ...signingKey,
        password,
      });
      const signedTx = signTransaction({
        signRequest: request.signRequest,
        keyLevel: request.publicDeriver.getParent().getPublicDeriverLevel(),
        signingKey: BIP32PrivateKey.fromBuffer(
          Buffer.from(normalizedKey.prvKeyHex, 'hex')
        ),
      });

      const response = request.sendTx({
        network: request.publicDeriver.getParent().getNetworkInfo(),
        inputs: signedTx.inputs,
        dataInputs: signedTx.dataInputs,
        outputs: signedTx.outputs,
      });
      Logger.debug(
        `${nameof(ErgoApi)}::${nameof(this.signAndBroadcast)} success: ` + stringifyData(response)
      );
      return response;
    } catch (error) {
      if (error instanceof WrongPassphraseError) {
        throw new IncorrectWalletPasswordError();
      }
      Logger.error(`${nameof(ErgoApi)}::${nameof(this.signAndBroadcast)} error: ` + stringifyError(error));
      if (error instanceof InvalidWitnessError) {
        throw new InvalidWitnessError();
      }
      if (error instanceof LocalizableError) throw error;
      throw new GenericApiError();
    }
  }

  async createSubmittedTransactionData(
    publicDeriver: PublicDeriver<>,
    signRequest: ErgoTxSignRequest,
    txId: string,
    defaultNetworkId: number,
    defaultToken: $ReadOnly<TokenRow>,
  ): Promise<ErgoTransaction> {
    const p = asHasLevels<ConceptualWallet>(publicDeriver);
    if (!p) {
      throw new Error(`${nameof(this.createSubmittedTransactionData)} publicDerviver traits missing`);
    }
    const derivationTables = p.getParent().getDerivationTables();
    const deps = Object.freeze({
      GetPathWithSpecific,
      GetAddress,
      GetDerivationSpecific,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(publicDeriver.getDb(), table));

    const { utxoAddresses } = await raii(
      publicDeriver.getDb(),
      [
        ...depTables,
        ...mapToTables(publicDeriver.getDb(), derivationTables),
      ],
      dbTx => rawGetAddressRowsForWallet(
        dbTx,
        deps,
        { publicDeriver },
        derivationTables,
      ),
    );
    const ownAddresses = new Set(
      utxoAddresses.map(a => a.Hash)
    );
    const amount = new MultiToken(
      [],
      {
        defaultNetworkId,
        defaultIdentifier: defaultToken.Identifier,
      },
    );
    for (const input of signRequest.inputs()) {
      amount.joinSubtractMutable(input.value);
    }
    let isIntraWallet = true;
    for (const output of signRequest.outputs()) {
      if (ownAddresses.has(output.address)) {
        amount.joinAddMutable(output.value);
      } else {
        isIntraWallet = false;
      }
    }

    return new ErgoTransaction({
      txid: txId,
      type: isIntraWallet ? 'self' : 'expend',
      amount,
      fee: signRequest.fee(),
      date: new Date,
      addresses: {
        from: signRequest.inputs(),
        to: signRequest.outputs(),
      },
      state: TxStatusCodes.SUBMITTED,
      errorMsg: null,
      block: null,
    });
  }
}
