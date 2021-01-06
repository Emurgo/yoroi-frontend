// @flow

import { defineMessages } from 'react-intl';
import LocalizableError from '../../i18n/LocalizableError';

const messages = defineMessages({
  serverStatusError: {
    id: 'api.errors.serverStatusError',
    defaultMessage: '!!!Connection to the server failed. Please check your internet connection or our Twitter account (https://twitter.com/YoroiWallet).',
  },
  currentCoinPriceError: {
    id: 'api.errors.currentCoinPriceError',
    defaultMessage: '!!!Current coin price data not available now.',
  },
  historicalCoinPriceError: {
    id: 'api.errors.histoicalCoinPriceError',
    defaultMessage: '!!!Historical coin price data not available now.',
  },
  genericApiError: {
    id: 'api.errors.GenericApiError',
    defaultMessage: '!!!An error occurred, please try again later.',
  },
  incorrectWalletPasswordError: {
    id: 'api.errors.IncorrectPasswordError',
    defaultMessage: '!!!Incorrect wallet password.',
  },
  walletAlreadyRestoredError: {
    id: 'api.errors.WalletAlreadyRestoredError',
    defaultMessage: '!!!Wallet you are trying to restore already exists.',
  },
  reportRequestError: {
    id: 'api.errors.ReportRequestError',
    defaultMessage: '!!!There was a problem sending the support request.',
  },
  unusedAddressesError: {
    id: 'api.errors.unusedAddressesError',
    defaultMessage: '!!!You cannot generate more than 20 consecutive unused addresses.',
  },
  walletAlreadyImportedError: {
    id: 'api.errors.WalletAlreadyImportedError',
    defaultMessage: '!!!Wallet you are trying to import already exists.',
  },
  walletFileImportError: {
    id: 'api.errors.WalletFileImportError',
    defaultMessage: '!!!Wallet could not be imported, please make sure you are providing a correct file.',
  },
  notEnoughMoneyToSendError: {
    id: 'api.errors.NotEnoughMoneyToSendError',
    defaultMessage: '!!!Not enough funds to make this transaction.',
  },
  updateAdaWalletError: {
    id: 'api.errors.updateAdaWalletError',
    defaultMessage: '!!!Error while updating ada wallet.',
  },
  getBalanceError: {
    id: 'api.errors.getBalanceError',
    defaultMessage: '!!!Error while getting Balance.',
  },
  updateAdaTxsHistoryError: {
    id: 'api.errors.updateAdaTxsHistoryError',
    defaultMessage: '!!!Error while updating ada transactions history.',
  },
  transactionError: {
    id: 'api.errors.transactionError',
    defaultMessage: '!!!Error while creating transaction.',
  },
  pendingTransactionError: {
    id: 'api.errors.pendingTransactionError',
    defaultMessage: '!!!Error while updating pending transactions.',
  },
  getAddressesKeysError: {
    id: 'api.errors.getAddressesWithFundsError',
    defaultMessage: '!!!Error while getting addresses with funds.',
  },
  noInputsError: {
    id: 'api.errors.noInputsError',
    defaultMessage: '!!!The wallet restored from your recovery phrase is empty. Please check your recovery phrase and attempt restoration again.',
  },
  rewardAddressEmptyError: {
    id: 'api.errors.rewardAddressEmpty',
    defaultMessage: '!!!Reward address is empty.',
  },
  noOutputsError: {
    id: 'api.errors.noOutputsError',
    defaultMessage: '!!!Transaction requires at least 1 output, but no output was added',
  },
  generateTransferTxError: {
    id: 'api.errors.generateTransferTxError',
    defaultMessage: '!!!Error while generating transfer transaction.',
  },
  sendTransactionError: {
    id: 'api.errors.sendTransactionError',
    defaultMessage: '!!!Error received from api method call while sending tx.',
  },
  getAllUTXOsForAddressesError: {
    id: 'api.errors.getAllUTXOsForAddressesError',
    defaultMessage: '!!!Error received from api method call while getting utxos.',
  },
  getTxsBodiesForUTXOsError: {
    id: 'api.errors.getTxsBodiesForUTXOsError',
    defaultMessage: '!!!Error received from api method call while getting TxBodies.',
  },
  getTxsBodiesForUTXOsApiError: {
    id: 'api.errors.getTxsBodiesForUTXOsApiError',
    defaultMessage: '!!!Error received from server while getting TxBodies.',
  },
  discoverAddressesError: {
    id: 'api.errors.discoverAddressesError',
    defaultMessage: '!!!Error received from api method call while discovering addresses.',
  },
  getUtxosForAddressesApiError: {
    id: 'api.errors.getUtxosForAddressesApiError',
    defaultMessage: '!!!Error received from server while getting UTXOs.',
  },
  getUtxosSumsForAddressesApiError: {
    id: 'api.errors.getUtxosSumsForAddressesApiError',
    defaultMessage: '!!!Error received from server while getting balance.',
  },
  getTxHistoryForAddressesApiError: {
    id: 'api.errors.getTxHistoryForAddressesApiError',
    defaultMessage: '!!!Error received from server while getting txs.',
  },
  getRewardHistoryApiError: {
    id: 'api.errors.getRewardHistoryApiError',
    defaultMessage: '!!!Error received from server while getting reward history.',
  },
  rollbackApiError: {
    id: 'api.errors.rollbackApiError',
    defaultMessage: '!!!Rollback was detected.',
  },
  getBestBlockApiError: {
    id: 'api.errors.getBestBlockApiError',
    defaultMessage: '!!!Error received from server while getting best block.',
  },
  sendTransactionApiError: {
    id: 'api.errors.sendTransactionApiError',
    defaultMessage: '!!!Error received from server while sending tx.',
  },
  checkAdressesInUseApiError: {
    id: 'api.errors.checkAdressesInUseApiError',
    defaultMessage: '!!!Error received from server while checking used addresses.',
  },
  assetInfoApiError: {
    id: 'api.errors.assetInfoApiError',
    defaultMessage: '!!!Error received from server while getting asset info.',
  },
  getAccountStateApiError: {
    id: 'api.errors.getAccountStateApiError',
    defaultMessage: '!!!Error received from server while getting account state.',
  },
  getPoolInfoApiError: {
    id: 'api.errors.getPoolInfoApiError',
    defaultMessage: '!!!Error received from server while getting pool info.',
  },
  poolMissingApiError: {
    id: 'api.errors.poolMissingApiError',
    defaultMessage: '!!!Could not find this pool. Double-check the ID and make sure the pool was not deregistered.',
  },
  getReputationError: {
    id: 'api.errors.getReputationError',
    defaultMessage: '!!!Error received from server while getting reputation.',
  },
  invalidWitnessError: {
    id: 'api.errors.invalidWitnessError',
    defaultMessage: '!!!The signature is invalid.',
  },
  invalidMnemonicError: {
    id: 'api.errors.invalidMnemonicError',
    defaultMessage: '!!!Invalid phrase entered, please check.',
  },
  hardwareUnsupportedError: {
    id: 'api.errors.hardwareUnsupportedError',
    defaultMessage: '!!!This action is not supported for the currently selected hardware.',
  },
});

export class ServerStatusError extends LocalizableError {
  constructor() {
    super({
      id: messages.serverStatusError.id,
      defaultMessage: messages.serverStatusError.defaultMessage || '',
    });
  }
}

export class CurrentCoinPriceError extends LocalizableError {
  constructor() {
    super({
      id: messages.currentCoinPriceError.id,
      defaultMessage: messages.currentCoinPriceError.defaultMessage || '',
    });
  }
}

export class HistoricalCoinPriceError extends LocalizableError {
  constructor() {
    super({
      id: messages.historicalCoinPriceError.id,
      defaultMessage: messages.historicalCoinPriceError.defaultMessage || '',
    });
  }
}

export class GenericApiError extends LocalizableError {
  constructor() {
    super({
      id: messages.genericApiError.id,
      defaultMessage: messages.genericApiError.defaultMessage || '',
    });
  }
}

export class IncorrectWalletPasswordError extends LocalizableError {
  constructor() {
    super({
      id: messages.incorrectWalletPasswordError.id,
      defaultMessage: messages.incorrectWalletPasswordError.defaultMessage || '',
    });
  }
}

export class WalletAlreadyRestoredError extends LocalizableError {
  constructor() {
    super({
      id: messages.walletAlreadyRestoredError.id,
      defaultMessage: messages.walletAlreadyRestoredError.defaultMessage || '',
    });
  }
}

export class ReportRequestError extends LocalizableError {
  constructor() {
    super({
      id: messages.reportRequestError.id,
      defaultMessage: messages.reportRequestError.defaultMessage || '',
    });
  }
}

export class UnusedAddressesError extends LocalizableError {
  constructor() {
    super({
      id: messages.unusedAddressesError.id,
      defaultMessage: messages.unusedAddressesError.defaultMessage || '',
    });
  }
}

export class WalletAlreadyImportedError extends LocalizableError {
  constructor() {
    super({
      id: messages.walletAlreadyImportedError.id,
      defaultMessage: messages.walletAlreadyImportedError.defaultMessage || '',
    });
  }
}

export class WalletFileImportError extends LocalizableError {
  constructor() {
    super({
      id: messages.walletFileImportError.id,
      defaultMessage: messages.walletFileImportError.defaultMessage || '',
    });
  }
}

export class NotEnoughMoneyToSendError extends LocalizableError {
  constructor() {
    super({
      id: messages.notEnoughMoneyToSendError.id,
      defaultMessage: messages.notEnoughMoneyToSendError.defaultMessage || '',
    });
  }
}

export class GetBalanceError extends LocalizableError {
  constructor() {
    super({
      id: messages.getBalanceError.id,
      defaultMessage: messages.getBalanceError.defaultMessage || '',
    });
  }
}

export class TransactionError extends LocalizableError {
  constructor() {
    super({
      id: messages.transactionError.id,
      defaultMessage: messages.transactionError.defaultMessage || '',
    });
  }
}

export class PendingTransactionError extends LocalizableError {
  constructor() {
    super({
      id: messages.pendingTransactionError.id,
      defaultMessage: messages.pendingTransactionError.defaultMessage || '',
    });
  }
}

export class GetAddressesKeysError extends LocalizableError {
  constructor() {
    super({
      id: messages.getAddressesKeysError.id,
      defaultMessage: messages.getAddressesKeysError.defaultMessage || '',
    });
  }
}

export class NoInputsError extends LocalizableError {
  constructor() {
    super({
      id: messages.noInputsError.id,
      defaultMessage: messages.noInputsError.defaultMessage || '',
    });
  }
}

export class RewardAddressEmptyError extends LocalizableError {
  constructor() {
    super({
      id: messages.rewardAddressEmptyError.id,
      defaultMessage: messages.rewardAddressEmptyError.defaultMessage || '',
    });
  }
}

export class NoOutputsError extends LocalizableError {
  constructor() {
    super({
      id: messages.noOutputsError.id,
      defaultMessage: messages.noOutputsError.defaultMessage || '',
    });
  }
}

export class GenerateTransferTxError extends LocalizableError {
  constructor() {
    super({
      id: messages.generateTransferTxError.id,
      defaultMessage: messages.generateTransferTxError.defaultMessage || '',
    });
  }
}

export class SendTransactionError extends LocalizableError {
  constructor() {
    super({
      id: messages.sendTransactionError.id,
      defaultMessage: messages.sendTransactionError.defaultMessage || '',
    });
  }
}

export class GetAllUTXOsForAddressesError extends LocalizableError {
  constructor() {
    super({
      id: messages.getAllUTXOsForAddressesError.id,
      defaultMessage: messages.getAllUTXOsForAddressesError.defaultMessage || '',
    });
  }
}

export class DiscoverAddressesError extends LocalizableError {
  constructor() {
    super({
      id: messages.discoverAddressesError.id,
      defaultMessage: messages.discoverAddressesError.defaultMessage || '',
    });
  }
}

export class GetUtxosForAddressesApiError extends LocalizableError {
  constructor() {
    super({
      id: messages.getUtxosForAddressesApiError.id,
      defaultMessage: messages.getUtxosForAddressesApiError.defaultMessage || '',
    });
  }
}

export class GetTxsBodiesForUTXOsError extends LocalizableError {
  constructor() {
    super({
      id: messages.getTxsBodiesForUTXOsError.id,
      defaultMessage: messages.getTxsBodiesForUTXOsError.defaultMessage || '',
    });
  }
}

export class GetTxsBodiesForUTXOsApiError extends LocalizableError {
  constructor() {
    super({
      id: messages.getTxsBodiesForUTXOsApiError.id,
      defaultMessage: messages.getTxsBodiesForUTXOsApiError.defaultMessage || '',
    });
  }
}

export class GetUtxosSumsForAddressesApiError extends LocalizableError {
  constructor() {
    super({
      id: messages.getUtxosSumsForAddressesApiError.id,
      defaultMessage: messages.getUtxosSumsForAddressesApiError.defaultMessage || '',
    });
  }
}

export class GetTxHistoryForAddressesApiError extends LocalizableError {
  constructor() {
    super({
      id: messages.getTxHistoryForAddressesApiError.id,
      defaultMessage: messages.getTxHistoryForAddressesApiError.defaultMessage || '',
    });
  }
}

export class GetRewardHistoryApiError extends LocalizableError {
  constructor() {
    super({
      id: messages.getRewardHistoryApiError.id,
      defaultMessage: messages.getRewardHistoryApiError.defaultMessage || '',
    });
  }
}

export class RollbackApiError extends LocalizableError {
  constructor() {
    super({
      id: messages.rollbackApiError.id,
      defaultMessage: messages.rollbackApiError.defaultMessage || '',
    });
  }
}

export class GetBestBlockError extends LocalizableError {
  constructor() {
    super({
      id: messages.getBestBlockApiError.id,
      defaultMessage: messages.getBestBlockApiError.defaultMessage || '',
    });
  }
}

export class SendTransactionApiError extends LocalizableError {
  constructor() {
    super({
      id: messages.sendTransactionApiError.id,
      defaultMessage: messages.sendTransactionApiError.defaultMessage || '',
    });
  }
}

export class CheckAddressesInUseApiError extends LocalizableError {
  constructor() {
    super({
      id: messages.checkAdressesInUseApiError.id,
      defaultMessage: messages.checkAdressesInUseApiError.defaultMessage || '',
    });
  }
}

export class GetAssetInfoApiError extends LocalizableError {
  constructor() {
    super({
      id: messages.checkAdressesInUseApiError.id,
      defaultMessage: messages.checkAdressesInUseApiError.defaultMessage || '',
    });
  }
}

export class GetAccountStateApiError extends LocalizableError {
  constructor() {
    super({
      id: messages.getAccountStateApiError.id,
      defaultMessage: messages.getAccountStateApiError.defaultMessage || '',
    });
  }
}

export class GetPoolInfoApiError extends LocalizableError {
  constructor() {
    super({
      id: messages.getPoolInfoApiError.id,
      defaultMessage: messages.getPoolInfoApiError.defaultMessage || '',
    });
  }
}
export class PoolMissingApiError extends LocalizableError {
  constructor() {
    super({
      id: messages.poolMissingApiError.id,
      defaultMessage: messages.poolMissingApiError.defaultMessage || '',
    });
  }
}

export class GetReputationError extends LocalizableError {
  constructor() {
    super({
      id: messages.getReputationError.id,
      defaultMessage: messages.getReputationError.defaultMessage || '',
    });
  }
}

export class InvalidWitnessError extends LocalizableError {
  constructor() {
    super({
      id: messages.invalidWitnessError.id,
      defaultMessage: messages.invalidWitnessError.defaultMessage || '',
    });
  }
}

export class InvalidMnemonicError extends LocalizableError {
  constructor() {
    super({
      id: messages.invalidMnemonicError.id,
      defaultMessage: messages.invalidMnemonicError.defaultMessage || '',
    });
  }
}

export class HardwareUnsupportedError extends LocalizableError {
  constructor() {
    super({
      id: messages.hardwareUnsupportedError.id,
      defaultMessage: messages.hardwareUnsupportedError.defaultMessage || '',
    });
  }
}
