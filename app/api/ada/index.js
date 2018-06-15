// @flow
import { action } from 'mobx';
import BigNumber from 'bignumber.js';
import {
  unixTimestampToDate,
  mapToList
} from './lib/utils';
import Wallet from '../../domain/Wallet';
import WalletTransaction, {
  transactionTypes
} from '../../domain/WalletTransaction';
import WalletAddress from '../../domain/WalletAddress';
import { LOVELACES_PER_ADA } from '../../config/numbersConfig';
import {
  isValidMnemonic,
  getAdaAccountRecoveryPhrase,
  newAdaWallet,
  updateAdaWallet
} from './adaWallet';
import { getSingleCryptoAccount } from './adaAccount';
import {
  isValidAdaAddress,
  newAdaAddress,
  getAdaAddressesMap,
  filterAdaAddressesByType
} from './adaAddress';
import {
  restoreAdaWallet
} from './restoreAdaWallet';
import {
  getAdaTxsHistoryByWallet,
} from './adaTransactions/adaTransactionsHistory';
import {
  getAdaTransactionFee,
  newAdaTransaction
} from './adaTransactions/adaNewTransactions';
import { getLastBlockNumber } from './getAdaLastBlockNumber';
import {
  GenericApiError,
  IncorrectWalletPasswordError,
  WalletAlreadyRestoredError,
} from '../common';
import type {
  AdaAddress,
  AdaAddresses,
  AdaTransaction,
  AdaTransactionFee,
  AdaTransactions,
  AdaWallet,
  AdaWallets,
  AdaWalletRecoveryPhraseResponse
} from './adaTypes';
import type {
  CreateWalletRequest,
  CreateWalletResponse,
  GetTransactionsResponse,
  GetWalletRecoveryPhraseResponse,
  GetWalletsResponse,
  RestoreWalletRequest,
  RestoreWalletResponse,
} from '../common';
import {
  AllFundsAlreadyAtReceiverAddressError,
  NotAllowedToSendMoneyToRedeemAddressError,
  NotAllowedToSendMoneyToSameAddressError,
  NotEnoughFundsForTransactionFeesError,
  NotEnoughMoneyToSendError,
} from './errors';

// ADA specific Request / Response params
export type GetAddressesResponse = {
  accountId: ?string,
  addresses: Array<WalletAddress>
};
export type GetAddressesRequest = {
  walletId: string
};
export type CreateAddressResponse = WalletAddress;
export type CreateTransactionRequest = {
  sender: string,
  receiver: string,
  amount: string,
  password: string
};
export type UpdateWalletRequest = {
  walletId: string,
  name: string,
  assurance: string
};
export type RedeemAdaRequest = {
  redemptionCode: string,
  accountId: string,
  walletPassword: ?string
};
export type RedeemAdaResponse = Wallet;
export type RedeemPaperVendedAdaRequest = {
  shieldedRedemptionKey: string,
  mnemonics: string,
  accountId: string,
  walletPassword: ?string
};
export type RedeemPaperVendedAdaResponse = RedeemPaperVendedAdaRequest;
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
export type NextUpdateResponse = ?{
  version: ?string
};
export type PostponeUpdateResponse = Promise<void>;
export type ApplyUpdateResponse = Promise<void>;
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

// FIXME: Extract to another file
const Logger = console;
const stringifyData = JSON.stringify;
const stringifyError = o => o.toString();

export default class AdaApi {
  async getWallets(): Promise<GetWalletsResponse> {
    Logger.debug('AdaApi::getWallets called');
    try {
      const wallet = await updateAdaWallet();
      const wallets: AdaWallets = wallet ? [wallet] : [];
      Logger.debug('AdaApi::getWallets success: ' + stringifyData(wallets));
      return wallets.map(data => _createWalletFromServerData(data));
    } catch (error) {
      Logger.error('AdaApi::getWallets error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  // FIXME: Now is no longer async
  async getAddresses(
    request: GetAddressesRequest
  ): Promise<GetAddressesResponse> {
    Logger.debug('AdaApi::getAddresses called: ' + stringifyData(request));
    try {
      const adaAddresses: AdaAddresses = filterAdaAddressesByType(
        mapToList(getAdaAddressesMap()),
        'External'
      );
      Logger.debug('AdaApi::getAddresses success: ' + stringifyData(adaAddresses));
      const addresses = adaAddresses.map((address => _createAddressFromServerData(address)));
      return new Promise(resolve =>
        resolve({
          accountId: '0', /* We are using a SINGLE account */
          addresses
        })
      );
    } catch (error) {
      Logger.error('AdaApi::getAddresses error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  async getTransactions(): Promise<GetTransactionsResponse> {
    // FIXME: Sync with TransactionStore skip and limit indexes
    // Logger.debug('AdaApi::searchHistory called: ' + stringifyData(request));
    // const { walletId, skip, limit } = request;
    try {
      const history: AdaTransactions = await getAdaTxsHistoryByWallet();
      Logger.debug('AdaApi::searchHistory success: ' + stringifyData(history));
      return new Promise(resolve =>
        resolve({
          transactions: history[0].map(data =>
            _createTransactionFromServerData(data)
          ),
          total: history[1]
        })
      );
    } catch (error) {
      Logger.error('AdaApi::searchHistory error: ' + stringifyError(error));
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

  // FIXME: Use when we will re-add the settings page
  /* async deleteWallet(
    request: DeleteWalletRequest
  ): Promise<DeleteWalletResponse> {
    Logger.debug('AdaApi::deleteWallet called: ' + stringifyData(request));
    try {
      const { walletId } = request;
      await deleteAdaWallet({ ca, walletId });
      Logger.debug('AdaApi::deleteWallet success: ' + stringifyData(request));
      return true;
    } catch (error) {
      Logger.error('AdaApi::deleteWallet error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }*/

  async createTransaction(
    request: CreateTransactionRequest
  ): Promise<any> {
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
      Logger.error('AdaApi::createTransaction error: ' + stringifyError(error));
      // eslint-disable-next-line max-len
      if (
        error.message.includes(
          "It's not allowed to send money to the same address you are sending from"
        )
      ) {
        throw new NotAllowedToSendMoneyToSameAddressError();
      }
      if (
        error.message.includes("Destination address can't be redeem address")
      ) {
        throw new NotAllowedToSendMoneyToRedeemAddressError();
      }
      if (error.message.includes('Not enough money')) {
        throw new NotEnoughMoneyToSendError();
      }
      if (error.message.includes("Passphrase doesn't match")) {
        throw new IncorrectWalletPasswordError();
      }
      throw new GenericApiError();
    }
  }

  async calculateTransactionFee(
    request: TransactionFeeRequest
  ): Promise<TransactionFeeResponse> {
    Logger.debug('AdaApi::calculateTransactionFee called');
    const { receiver, amount } = request;
    try {
      const response: AdaTransactionFee = await
        getAdaTransactionFee(receiver, amount);
      Logger.debug(
        'AdaApi::calculateTransactionFee success: ' + stringifyData(response)
      );
      return _createTransactionFeeFromServerData(response);
    } catch (error) {
      Logger.error(
        'AdaApi::calculateTransactionFee error: ' + stringifyError(error)
      );
      // eslint-disable-next-line max-len
      if (
        error.message.includes(
          'not enough money on addresses which are not included in output addresses set'
        )
      ) {
        throw new AllFundsAlreadyAtReceiverAddressError();
      }
      if (error.message.includes('not enough money')) {
        throw new NotEnoughFundsForTransactionFeesError();
      }
      throw new GenericApiError();
    }
  }

  // FIXME: This in no longer async
  async createAddress(): Promise<CreateAddressResponse> {
    Logger.debug('AdaApi::createAddress called');
    try {
      const cryptoAccount = getSingleCryptoAccount();
      const addresses: AdaAddresses = mapToList(getAdaAddressesMap());
      const newAddress: AdaAddress = newAdaAddress(cryptoAccount, addresses, 'External');
      Logger.info('AdaApi::createAddress success: ' + stringifyData(newAddress));
      return _createAddressFromServerData(newAddress);
    } catch (error) {
      Logger.error('AdaApi::createAddress error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  isValidAddress(address: string): Promise<boolean> {
    return isValidAdaAddress(address);
  }

  isValidMnemonic(mnemonic: string): Promise<boolean> {
    return Promise.resolve(isValidMnemonic(mnemonic, 12));
  }

  getWalletRecoveryPhrase(): Promise<GetWalletRecoveryPhraseResponse> {
    Logger.debug('AdaApi::getWalletRecoveryPhrase called');
    try {
      const response: Promise<AdaWalletRecoveryPhraseResponse> = new Promise(
        resolve => resolve(getAdaAccountRecoveryPhrase())
      );
      Logger.debug('AdaApi::getWalletRecoveryPhrase success');
      return response;
    } catch (error) {
      Logger.error(
        'AdaApi::getWalletRecoveryPhrase error: ' + stringifyError(error)
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

  // FIXME: Use when we will re-add import wallet functionality
  /* async importWalletFromKey(
    request: ImportWalletFromKeyRequest
  ): Promise<ImportWalletFromKeyResponse> {
    Logger.debug('AdaApi::importWalletFromKey called');
    const { filePath, walletPassword } = request;
    try {
      const importedWallet: AdaWallet = await importAdaWallet({
        ca,
        walletPassword,
        filePath
      });
      Logger.debug('AdaApi::importWalletFromKey success');
      return _createWalletFromServerData(importedWallet);
    } catch (error) {
      Logger.error(
        'AdaApi::importWalletFromKey error: ' + stringifyError(error)
      );
      if (error.message.includes('already exists')) {
        throw new WalletAlreadyImportedError();
      }
      throw new WalletFileImportError();
    }
  }*/

  // FIXME: Use when we will re-add import wallet functionality
  /* async importWalletFromFile(
    request: ImportWalletFromFileRequest
  ): Promise<ImportWalletFromFileResponse> {
    Logger.debug('AdaApi::importWalletFromFile called');
    const { filePath, walletPassword } = request;
    const isKeyFile =
      filePath
        .split('.')
        .pop()
        .toLowerCase() === 'key';
    try {
      const importedWallet: AdaWallet = isKeyFile
        ? await importAdaWallet({ ca, walletPassword, filePath })
        : await importAdaBackupJSON({ ca, filePath });
      Logger.debug('AdaApi::importWalletFromFile success');
      return _createWalletFromServerData(importedWallet);
    } catch (error) {
      Logger.error(
        'AdaApi::importWalletFromFile error: ' + stringifyError(error)
      );
      if (error.message.includes('already exists')) {
        throw new WalletAlreadyImportedError();
      }
      throw new WalletFileImportError();
    }
  }*/

  // FIXME: Figure out if we should use this in some place
  /* async sendBugReport(
    request: SendBugReportRequest
  ): Promise<SendBugReportResponse> {
    Logger.debug('AdaApi::sendBugReport called: ' + stringifyData(request));
    try {
      await sendAdaBugReport({
        requestFormData: request,
        application: 'cardano-node'
      });
      Logger.debug('AdaApi::sendBugReport success');
      return true;
    } catch (error) {
      Logger.error('AdaApi::sendBugReport error: ' + stringifyError(error));
      throw new ReportRequestError();
    }
  }*/

  // FIXME: Figure out if we should use this in some place
  /* async (): Promise<NextUpdateResponse> {
    Logger.debug('AdaApi::nextUpdate called');
    let nextUpdate = null;
    try {
      // TODO: add flow type definitions for nextUpdate response
      const response: Promise<any> = await nextAdaUpdate({ ca });
      Logger.debug('AdaApi::nextUpdate success: ' + stringifyData(response));
      if (response && response.cuiSoftwareVersion) {
        nextUpdate = {
          version: get(response, ['cuiSoftwareVersion', 'svNumber'], null)
        };
      }
    } catch (error) {
      if (error.message.includes('No updates available')) {
        Logger.debug('AdaApi::nextUpdate success: No updates available');
      } else {
        Logger.error('AdaApi::nextUpdate error: ' + stringifyError(error));
      }
      // throw new GenericApiError();
    }
    return nextUpdate;
    // TODO: remove hardcoded response after node update is tested
    // nextUpdate = {
    //   cuiSoftwareVersion: {
    //     svAppName: {
    //       getApplicationName: 'cardano'
    //     },
    //     svNumber: 1
    //   },
    //   cuiBlockVesion: {
    //     bvMajor: 0,
    //     bvMinor: 1,
    //     bvAlt: 0
    //   },
    //   cuiScriptVersion: 1,
    //   cuiImplicit: false,
    //   cuiVotesFor: 2,
    //   cuiVotesAgainst: 0,
    //   cuiPositiveStake: {
    //     getCoin: 66666
    //   },
    //   cuiNegativeStake: {
    //     getCoin: 0
    //   }
    // };
    // if (nextUpdate && nextUpdate.cuiSoftwareVersion && nextUpdate.cuiSoftwareVersion.svNumber) {
    //   return { version: nextUpdate.cuiSoftwareVersion.svNumber };
    // } else if (nextUpdate) {
    //   return { version: null };
    // }
    // return null;
  }*/

  // FIXME: Figure out if we should use this in some place
  /* async postponeUpdate(): PostponeUpdateResponse {
    Logger.debug('AdaApi::postponeUpdate called');
    try {
      const response: Promise<any> = await postponeAdaUpdate({ ca });
      Logger.debug(
        'AdaApi::postponeUpdate success: ' + stringifyData(response)
      );
    } catch (error) {
      Logger.error('AdaApi::postponeUpdate error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }*/

  // FIXME: Figure out if we should use this in some place
  /* async applyUpdate(): ApplyUpdateResponse {
    Logger.debug('AdaApi::applyUpdate called');
    try {
      const response: Promise<any> = await applyAdaUpdate({ ca });
      Logger.debug('AdaApi::applyUpdate success: ' + stringifyData(response));
      ipcRenderer.send('kill-process');
    } catch (error) {
      Logger.error('AdaApi::applyUpdate error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }*/

  // FIXME: Figure out if we should use this in some place
  /* async updateWallet(
    request: UpdateWalletRequest
  ): Promise<UpdateWalletResponse> {
    Logger.debug('AdaApi::updateWallet called: ' + stringifyData(request));
    const { walletId, name, assurance } = request;
    const unit = 0;

    const walletMeta = {
      cwName: name,
      cwAssurance: assurance,
      cwUnit: unit
    };
    try {
      const wallet: ?AdaWallet = await updateAdaWallet();
      if (!wallet) throw new Error('not persistent wallet');
      Logger.debug('AdaApi::updateWallet success: ' + stringifyData(wallet));
      return _createWalletFromServerData(wallet);
    } catch (error) {
      Logger.error('AdaApi::updateWallet error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }*/

  // FIXME: Use when we will re-add the settings page
  /* async updateWalletPassword(
    request: UpdateWalletPasswordRequest
  ): Promise<UpdateWalletPasswordResponse> {
    Logger.debug('AdaApi::updateWalletPassword called');
    const { walletId, oldPassword, newPassword } = request;
    try {
      await changeAdaWalletPassphrase({
        ca,
        walletId,
        oldPassword,
        newPassword
      });
      Logger.debug('AdaApi::updateWalletPassword success');
      return true;
    } catch (error) {
      Logger.error(
        'AdaApi::updateWalletPassword error: ' + stringifyError(error)
      );
      if (error.message.includes('Invalid old passphrase given')) {
        throw new IncorrectWalletPasswordError();
      }
      throw new GenericApiError();
    }
  }*/

  // FIXME: Use when we will re-add the settings page
  /* async exportWalletToFile(
    request: ExportWalletToFileRequest
  ): Promise<ExportWalletToFileResponse> {
    const { walletId, filePath } = request;
    Logger.debug('AdaApi::exportWalletToFile called');
    try {
      const response: Promise<[]> = await exportAdaBackupJSON({
        ca,
        walletId,
        filePath
      });
      Logger.debug(
        'AdaApi::exportWalletToFile success: ' + stringifyData(response)
      );
      return response;
    } catch (error) {
      Logger.error(
        'AdaApi::exportWalletToFile error: ' + stringifyError(error)
      );
      throw new GenericApiError();
    }
  }*/

  // FIXME: Figure out if we should use this in some place
  /* async testReset(): Promise<void> {
    Logger.debug('AdaApi::testReset called');
    try {
      const response: Promise<void> = await adaTestReset({ ca });
      Logger.debug('AdaApi::testReset success: ' + stringifyData(response));
      return response;
    } catch (error) {
      Logger.error('AdaApi::testReset error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }*/

  // FIXME: Figure out if we should use this in some place
  /* async getLocalTimeDifference(): Promise<GetLocalTimeDifferenceResponse> {
    Logger.debug('AdaApi::getLocalTimeDifference called');
    try {
      const response: AdaLocalTimeDifference = await getAdaLocalTimeDifference({
        ca
      });
      Logger.debug(
        'AdaApi::getLocalTimeDifference success: ' + stringifyData(response)
      );
      return response;
    } catch (error) {
      Logger.error(
        'AdaApi::getLocalTimeDifference error: ' + stringifyError(error)
      );
      throw new GenericApiError();
    }
  }*/
}

// ========== TRANSFORM SERVER DATA INTO FRONTEND MODELS =========

const _createWalletFromServerData = action(
  'AdaApi::_createWalletFromServerData',
  (data: AdaWallet) =>
    new Wallet({
      id: data.cwId,
      amount: new BigNumber(data.cwAmount.getCCoin).dividedBy(
        LOVELACES_PER_ADA
      ),
      name: data.cwMeta.cwName,
      assurance: data.cwMeta.cwAssurance,
      passwordUpdateDate: unixTimestampToDate(data.cwPassphraseLU)
    })
);

const _createAddressFromServerData = action(
  'AdaApi::_createAddressFromServerData',
  (data: AdaAddress) =>
    new WalletAddress({
      id: data.cadId,
      amount: new BigNumber(data.cadAmount.getCCoin).dividedBy(
        LOVELACES_PER_ADA
      ),
      isUsed: data.cadIsUsed
    })
);

const _conditionToTxState = (condition: string) => {
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
    const coins = data.ctAmount.getCCoin;
    const { ctmTitle, ctmDescription, ctmDate } = data.ctMeta;
    return new WalletTransaction({
      id: data.ctId,
      title: ctmTitle || data.ctIsOutgoing ? 'Ada sent' : 'Ada received',
      type: data.ctIsOutgoing
        ? transactionTypes.EXPEND
        : transactionTypes.INCOME,
      amount: new BigNumber(data.ctIsOutgoing ? -1 * coins : coins).dividedBy(
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
