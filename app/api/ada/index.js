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
import WalletAddress from '../../domain/WalletAddress';
import { LOVELACES_PER_ADA } from '../../config/numbersConfig';
import {
  isValidMnemonic,
  generateAdaAccountRecoveryPhrase,
  newAdaWallet,
  updateAdaWalletMetaParams,
  updateAdaWalletBalance,
  changeAdaWalletSpendingPassword
} from './adaWallet';
import {
  isValidAdaAddress,
  newExternalAdaAddress,
  getAdaAddressesByType,
  saveAdaAddress
} from './adaAddress';
import {
  restoreAdaWallet
} from './restoreAdaWallet';
import {
  createTrezorWallet
} from './hardwareWallet/createTrezorWallet';
import {
  getAdaTxsHistoryByWallet,
  getAdaTxLastUpdatedDate,
  refreshTxs,
  getPendingAdaTxs
} from './adaTransactions/adaTransactionsHistory';
import {
  getAdaTransactionFee,
  newAdaTransaction
} from './adaTransactions/adaNewTransactions';
import type { TrezorSignTxPayload } from '../../domain/TrezorSignTx';
import {
  createTrezorSignTxPayload,
  newTrezorTransaction,
} from './hardwareWallet/trezorNewTransactions';
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
  AdaTransactionCondition,
  AdaTransactionFee,
  AdaTransactions,
  AdaWallet,
  AdaWallets,
  AdaAssurance,
  AdaFeeEstimateResponse,
} from './adaTypes';
import type {
  CreateWalletRequest,
  CreateWalletResponse,
  GetTransactionsRequest,
  GetTransactionsResponse,
  GetAddressesRequest,
  GetAddressesResponse,
  GetBalanceResponse,
  GenerateWalletRecoveryPhraseResponse,
  GetWalletsResponse,
  RefreshPendingTransactionsResponse,
  RestoreWalletRequest,
  RestoreWalletResponse,
  UpdateWalletResponse,
  CreateTrezorWalletRequest,
  CreateTrezorWalletResponse,
  SendTrezorSignedTxResponse,
} from '../common';
import { InvalidWitnessError } from './errors';
import { WrongPassphraseError } from './lib/cardanoCrypto/cryptoErrors';
import { getSingleCryptoAccount, getAdaWallet, getLastBlockNumber } from './adaLocalStorage';
import { saveTxs } from './lib/lovefieldDatabase';
import type { TransactionExportRow } from '../export';
import { convertAdaTransactionsToExportRows } from './lib/utils';

// ADA specific Request / Response params
export type CreateAddressResponse = WalletAddress;
export type CreateTransactionRequest = {
  receiver: string,
  amount: string,
  password: string
};
export type SendTrezorSignedTxRequest = {
  signedTxHex: string,
  changeAdaAddr: AdaAddress
};
export type CreateTrezorSignTxDataRequest = {
  receiver: string,
  amount: string
};
export type CreateTrezorSignTxDataResponse = {
  trezorSignTxPayload: TrezorSignTxPayload,
  changeAddress: AdaAddress
};
export type UpdateWalletRequest = {
  walletId: string,
  name: string,
  assurance: AdaAssurance
};
export type ImportWalletFromKeyRequest = {
  filePath: string,
  walletPassword: ?string
};
export type ImportWalletFromKeyResponse = Wallet;
export type ImportWalletFromFileRequest = {
  filePath: string,
  walletPassword: ?string,
  walletName: ?string
};
export type ImportWalletFromFileResponse = Wallet;
export type TransactionFeeRequest = {
  sender: string,
  receiver: string,
  amount: string
};
export type TransactionFeeResponse = BigNumber;
export type ExportWalletToFileRequest = {
  walletId: string,
  filePath: string,
  password: ?string
};
export type ExportWalletToFileResponse = [];

export type UpdateWalletPasswordRequest = {
  oldPassword: string,
  newPassword: string,
};

export type ChangeAdaWalletSpendingPasswordParams = {
  oldPassword: string,
  newPassword: string,
};

export type UpdateWalletPasswordResponse = boolean;

export type AdaWalletRecoveryPhraseResponse = Array<string>;

export default class AdaApi {

  async getWallets(): Promise<GetWalletsResponse> {
    Logger.debug('AdaApi::getWallets called');
    try {
      const wallet = await getAdaWallet();
      const wallets: AdaWallets = wallet
        ? [wallet]
        : [];
      // Refresh wallet data
      Logger.debug('AdaApi::getWallets success: ' + stringifyData(wallets));
      return wallets.map(data => _createWalletFromServerData(data));
    } catch (error) {
      Logger.error('AdaApi::getWallets error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  async getExternalAddresses(
    request: GetAddressesRequest
  ): Promise<GetAddressesResponse> {
    Logger.debug('AdaApi::getExternalAddresses called: ' + stringifyData(request));
    try {
      const adaAddresses: AdaAddresses = await getAdaAddressesByType('External');
      Logger.debug('AdaApi::getExternalAddresses success: ' + stringifyData(adaAddresses));
      const addresses = adaAddresses.map((address => _createAddressFromServerData(address)));
      return new Promise(resolve => (
        resolve(
          {
            accountId: '0', /* We are using a SINGLE account */
            addresses
          }
        )
      ));
    } catch (error) {
      Logger.error('AdaApi::getExternalAddresses error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  async getBalance(): Promise<GetBalanceResponse> {
    try {
      return updateAdaWalletBalance();
    } catch (error) {
      Logger.error('AdaApi::getBalance error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  async getTxLastUpdatedDate(): Promise<Date> {
    try {
      return getAdaTxLastUpdatedDate();
    } catch (error) {
      Logger.error('AdaApi::getTxLastUpdatedDate error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  async refreshTransactions(request: GetTransactionsRequest): Promise<GetTransactionsResponse> {
    Logger.debug('AdaApi::refreshTransactions called: ' + stringifyData(request));
    const { skip = 0, limit } = request;
    try {
      await refreshTxs();
      const history: AdaTransactions = await getAdaTxsHistoryByWallet();
      Logger.debug('AdaApi::refreshTransactions success: ' + stringifyData(history));
      const transactions = limit
        ? history[0].slice(skip, skip + limit)
        : history[0];
      const mappedTransactions = transactions.map(data => (
        _createTransactionFromServerData(data)
      ));
      return Promise.resolve({
        transactions: mappedTransactions,
        total: history[1]
      });
    } catch (error) {
      Logger.error('AdaApi::refreshTransactions error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  async refreshPendingTransactions(): Promise<RefreshPendingTransactionsResponse> {
    Logger.debug('AdaApi::refreshPendingTransactions called');
    try {
      const pendingTxs = await getPendingAdaTxs();
      Logger.debug('AdaApi::refreshPendingTransactions success: ' + stringifyData(pendingTxs));
      return pendingTxs.map(data => (
        _createTransactionFromServerData(data)
      ));
    } catch (error) {
      Logger.error('AdaApi::refreshPendingTransactions error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  async createWallet(
    request: CreateWalletRequest
  ): Promise<CreateWalletResponse> {
    Logger.debug('AdaApi::createWallet called');
    const { name, mnemonic, password } = request;
    const assurance = 'CWANormal';
    const unit = 0;
    try {
      const walletInitData = {
        cwInitMeta: {
          cwName: name,
          cwAssurance: assurance,
          cwUnit: unit
        },
        cwBackupPhrase: {
          bpToList: mnemonic, // array of mnemonic words
        }
      };
      const wallet: AdaWallet = await newAdaWallet({
        walletPassword: password,
        walletInitData
      });
      Logger.debug('AdaApi::createWallet success');
      return _createWalletFromServerData(wallet);
    } catch (error) {
      Logger.error('AdaApi::createWallet error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  async createTransaction(
    request: CreateTransactionRequest
  ): Promise<Array<void>> {
    Logger.debug('AdaApi::createTransaction called');
    const { receiver, amount, password } = request;
    try {
      const response = await newAdaTransaction(
        receiver,
        amount,
        password
      );
      Logger.debug(
        'AdaApi::createTransaction success: ' + stringifyData(response)
      );
      return response;
    } catch (error) {
      if (error instanceof WrongPassphraseError) {
        throw new IncorrectWalletPasswordError();
      }
      Logger.error('AdaApi::createTransaction error: ' + stringifyError(error));
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
      const { receiver, amount } = request;

      const { changeAdaAddress, txExt }: AdaFeeEstimateResponse =
          await getAdaTransactionFee(receiver, amount);
      const trezorSignTxPayload: TrezorSignTxPayload = await createTrezorSignTxPayload(txExt);

      Logger.debug('AdaApi::createTrezorSignTxData success: ' + stringifyData(trezorSignTxPayload));
      return {
        trezorSignTxPayload,
        changeAddress: changeAdaAddress
      };
    } catch (error) {
      Logger.error('AdaApi::createTrezorSignTxData error: ' + stringifyError(error));

      // We don't know what the problem was so throw a generic error
      throw new GenericApiError();
    }
  }

  async sendTrezorSignedTx(
    request: SendTrezorSignedTxRequest
  ): Promise<SendTrezorSignedTxResponse> {
    Logger.debug('AdaApi::sendTrezorSignedTx called');
    const { signedTxHex, changeAdaAddr } = request;
    try {
      const response = await newTrezorTransaction(signedTxHex, changeAdaAddr);
      Logger.debug('AdaApi::sendTrezorSignedTx success: ' + stringifyData(response));

      return response;
    } catch (error) {
      Logger.error('AdaApi::sendTrezorSignedTx error: ' + stringifyError(error));

      if (error instanceof InvalidWitnessError) {
        throw new InvalidWitnessError();
      }

      // We don't know what the problem was so throw a generic error
      throw new GenericApiError();
    }
  }

  async calculateTransactionFee(
    request: TransactionFeeRequest
  ): Promise<TransactionFeeResponse> {
    Logger.debug('AdaApi::calculateTransactionFee called');
    const { receiver, amount } = request;
    try {
      const { fee }: AdaFeeEstimateResponse =
        await getAdaTransactionFee(receiver, amount);
      Logger.debug(
        'AdaApi::calculateTransactionFee success: ' + stringifyData(fee)
      );
      return _createTransactionFeeFromServerData(fee);
    } catch (error) {
      Logger.error(
        'AdaApi::calculateTransactionFee error: ' + stringifyError(error)
      );
      if (error.id.includes('NotEnoughMoneyToSendError')) throw error;
      throw new GenericApiError();
    }
  }

  async createAddress(): Promise<CreateAddressResponse> {
    Logger.debug('AdaApi::createAddress called');
    try {
      const cryptoAccount = getSingleCryptoAccount();
      const newAddress = await newExternalAdaAddress(cryptoAccount);
      Logger.info('AdaApi::createAddress success: ' + stringifyData(newAddress));
      return _createAddressFromServerData(newAddress);
    } catch (error) {
      if (error.id && error.id.includes('unusedAddressesError')) throw error;
      Logger.error('AdaApi::createAddress error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  /** TODO: This method is exposed to allow injecting data when testing */
  async saveAddress(address: AdaAddress, addressType: AddressType): Promise<void> {
    try {
      await saveAdaAddress(address, addressType);
    } catch (error) {
      Logger.error('AdaApi::saveAddress error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  /** TODO: This method is exposed to allow injecting data when testing */
  async saveTxs(txs: Array<AdaTransaction>): Promise<void> {
    try {
      await saveTxs(txs);
    } catch (error) {
      Logger.error('AdaApi::saveTxs error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  isValidAddress(address: string): Promise<boolean> {
    return isValidAdaAddress(address);
  }

  isValidMnemonic(mnemonic: string, numberOfWords: ?number): boolean {
    return isValidMnemonic(mnemonic, numberOfWords);
  }

  generateWalletRecoveryPhrase(): Promise<GenerateWalletRecoveryPhraseResponse> {
    Logger.debug('AdaApi::generateWalletRecoveryPhrase called');
    try {
      const response: Promise<AdaWalletRecoveryPhraseResponse> = new Promise(
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

  async restoreWallet(
    request: RestoreWalletRequest
  ): Promise<RestoreWalletResponse> {
    Logger.debug('AdaApi::restoreWallet called');
    const { recoveryPhrase, walletName, walletPassword } = request;
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
      const wallet: AdaWallet = await restoreAdaWallet({
        walletPassword,
        walletInitData
      });
      Logger.debug('AdaApi::restoreWallet success');
      return _createWalletFromServerData(wallet);
    } catch (error) {
      Logger.error('AdaApi::restoreWallet error: ' + stringifyError(error));
      // TODO: backend will return something different here, if multiple wallets
      // are restored from the key and if there are duplicate wallets we will get
      // some kind of error and present the user with message that some wallets
      // where not imported/restored if some where. if no wallets are imported
      // we will error out completely with throw block below
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
      return _createWalletFromServerData(wallet);
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

  async createTrezorWallet(
    request: CreateTrezorWalletRequest
  ): Promise<CreateTrezorWalletResponse> {
    try {
      Logger.debug('AdaApi::connectTrezor called');
      const { walletName, publicMasterKey, deviceFeatures } = request;
      const assurance = 'CWANormal';
      const unit = 0;

      const walletInitData = {
        cwInitMeta: {
          cwName: walletName,
          cwAssurance: assurance,
          cwUnit: unit
        },
        cwHardwareInfo: {
          vendor: deviceFeatures.vendor,
          model: deviceFeatures.model,
          deviceId: deviceFeatures.device_id,
          label: deviceFeatures.label,
          majorVersion: deviceFeatures.major_version,
          minorVersion: deviceFeatures.minor_version,
          patchVersion: deviceFeatures.patch_version,
          language: deviceFeatures.language,
          publicMasterKey,
        },
      };
      const wallet: AdaWallet = await createTrezorWallet({ walletInitData });

      Logger.debug('AdaApi::connectTrezor success');
      return _createWalletFromServerData(wallet);
    } catch (error) {
      Logger.error('AdaApi::connectTrezor error: ' + stringifyError(error));

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
  async getTransactionRowsToExport(): Promise<Array<TransactionExportRow>> {
    try {
      await refreshTxs();
      const history: AdaTransactions = await getAdaTxsHistoryByWallet();
      return convertAdaTransactionsToExportRows(history[0]);
    } catch (e) {
      Logger.error('AdaApi::exportTransactionsToFile: ' + stringifyError(e));
      throw e;
    }
  }
}
// ========== End of class AdaApi =========

// ========== TRANSFORM SERVER DATA INTO FRONTEND MODELS =========

const _createWalletFromServerData = action(
  'AdaApi::_createWalletFromServerData',
  (adaWallet: AdaWallet) => {
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
    };

    return new Wallet(walletObj);
  }
);

const _createAddressFromServerData = action(
  'AdaApi::_createAddressFromServerData',
  (data: AdaAddress) => (
    new WalletAddress({
      id: data.cadId,
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
  (data: AdaTransaction) => {
    const coins = new BigNumber(data.ctAmount.getCCoin);
    const { ctmTitle, ctmDescription, ctmDate } = data.ctMeta;
    return new WalletTransaction({
      id: data.ctId,
      title: ctmTitle || data.ctIsOutgoing ? 'Ada sent' : 'Ada received',
      type: data.ctIsOutgoing
        ? transactionTypes.EXPEND
        : transactionTypes.INCOME,
      amount: (data.ctIsOutgoing ? coins.negated() : coins).dividedBy(
        LOVELACES_PER_ADA
      ),
      date: new Date(ctmDate),
      description: ctmDescription || '',
      numberOfConfirmations: getLastBlockNumber() - data.ctBlockNumber,
      addresses: {
        from: data.ctInputs.map(address => address[0]),
        to: data.ctOutputs.map(address => address[0])
      },
      state: _conditionToTxState(data.ctCondition)
    });
  }
);

const _createTransactionFeeFromServerData = action(
  'AdaApi::_createTransactionFeeFromServerData',
  (data: AdaTransactionFee) => {
    const coins = data.getCCoin;
    return new BigNumber(coins).dividedBy(LOVELACES_PER_ADA);
  }
);
