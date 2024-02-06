// @flow

import { defineMessages } from 'react-intl';
import LocalizableError from '../../i18n/LocalizableError';

const messages = defineMessages({
  serverStatusError: {
    id: 'api.errors.serverStatusError',
    defaultMessage: '!!!Server connection failed. Please check your internet connection or reach out to our support team <a target="_blank" href="https://emurgohelpdesk.zendesk.com/hc/en-us/requests/new?ticket_form_id=360013330335">here</a>.',
  },
  currentCoinPriceError: {
    id: 'api.errors.currentCoinPriceError',
    defaultMessage: '!!!There is no current coin price data available.',
  },
  historicalCoinPriceError: {
    id: 'api.errors.histoicalCoinPriceError',
    defaultMessage: '!!!There is no historical coin price data available.',
  },
  genericApiError: {
    id: 'api.errors.GenericApiError',
    defaultMessage: '!!!An error occurred. Please retry.',
  },
  incorrectWalletPasswordError: {
    id: 'api.errors.IncorrectPasswordError',
    defaultMessage: '!!!Incorrect password. Please retype.',
  },
  walletAlreadyRestoredError: {
    id: 'api.errors.WalletAlreadyRestoredError',
    defaultMessage: '!!!The wallet you are trying to restore already exists.',
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
  notEnoughMoneyToSendError: {
    id: 'api.errors.NotEnoughMoneyToSendError',
    defaultMessage: '!!!Insufficient funds to complete this transaction.',
  },
  cannotSendBelowMinimumValueError: {
    id: 'api.errors.CannotSendBelowMinimumValueError',
    defaultMessage: '!!!A minimum of 1 ADA is required',
  },
  assetOverflowError: {
    id: 'api.errors.assetOverflowError',
    defaultMessage: '!!!Maximum value of a token inside a UTXO exceeded (overflow).',
  },
  getAddressesKeysError: {
    id: 'api.errors.getAddressesWithFundsError',
    defaultMessage: '!!!An error occurred while getting addresses with funds. Please retry.',
  },
  noInputsError: {
    id: 'api.errors.noInputsError',
    defaultMessage: '!!!Your recovered wallet is empty. Please check your recovery phrase and restore again.',
  },
  rewardAddressEmptyError: {
    id: 'api.errors.rewardAddressEmpty',
    defaultMessage: '!!!Reward address is not visible until users get any reward.',
  },
  noOutputsError: {
    id: 'api.errors.noOutputsError',
    defaultMessage: '!!!The transaction requires at least 1 output, but none was provided.',
  },
  generateTransferTxError: {
    id: 'api.errors.generateTransferTxError',
    defaultMessage: '!!!An error occurred while generating the transfer transaction. Please retry.',
  },
  sendTransactionError: {
    id: 'api.errors.sendTransactionError',
    defaultMessage: '!!!Error received from api method call while sending tx.',
  },
  getAllUTXOsForAddressesError: {
    id: 'api.errors.getAllUTXOsForAddressesError',
    defaultMessage: '!!!Error received from api method call while getting utxos.',
  },
  discoverAddressesError: {
    id: 'api.errors.discoverAddressesError',
    defaultMessage: '!!!Error received from api method call while discovering addresses.',
  },
  getUtxosForAddressesApiError: {
    id: 'api.errors.getUtxosForAddressesApiError',
    defaultMessage: '!!!Error received from server while getting UTXOs.',
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
  getMultiAssetMintMetadataApiError: {
    id: 'api.errors.getMultiAssetMintMetadataApiError',
    defaultMessage: '!!!Error received from server while querying minting metadata.',
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
  getCatalystRoundApiError: {
    id: 'api.errors.getCatalystRoundApiError',
    defaultMessage: '!!!Error received from server while getting catalyst round info.',
  },
  getTokenInfoApiError: {
    id: 'api.errors.getTokenInfoApiError',
    defaultMessage: '!!!Error received from server while getting token info.',
  },
  poolMissingApiError: {
    id: 'api.errors.poolMissingApiError',
    defaultMessage: '!!!Pool could not be found. Please check the pool ID and ensure the pool was not deregistered.',
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
    defaultMessage: '!!!This action is incompatible with the hardware.',
  },
  getUtxoDataError: {
    id: 'api.errors.getUtxoDataError',
    defaultMessage: '!!!Error received from server while getting UTXO data',
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

export class NotEnoughMoneyToSendError extends LocalizableError {
  constructor() {
    super({
      id: messages.notEnoughMoneyToSendError.id,
      defaultMessage: messages.notEnoughMoneyToSendError.defaultMessage || '',
    });
  }
}

export class CannotSendBelowMinimumValueError extends LocalizableError {
  constructor() {
    super({
      id: messages.cannotSendBelowMinimumValueError.id,
      defaultMessage: messages.cannotSendBelowMinimumValueError.defaultMessage || '',
    });
  }
}
export class AssetOverflowError extends LocalizableError {
  constructor() {
    super({
      id: messages.assetOverflowError.id,
      defaultMessage: messages.assetOverflowError.defaultMessage || '',
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

export class GetMultiAssetMintMetadataApiError extends LocalizableError {
  constructor() {
    super({
      id: messages.getMultiAssetMintMetadataApiError.id,
      defaultMessage: messages.getMultiAssetMintMetadataApiError.defaultMessage || '',
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

export class GetCatalystRoundInfoApiError extends LocalizableError {
  constructor() {
    super({
      id: messages.getCatalystRoundApiError.id,
      defaultMessage: messages.getCatalystRoundApiError.defaultMessage || '',
    });
  }
}

export class GetTokenInfoApiError extends LocalizableError {
  constructor() {
    super({
      id: messages.getTokenInfoApiError.id,
      defaultMessage: messages.getTokenInfoApiError.defaultMessage || '',
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

export class GetUtxoDataError extends LocalizableError {
  constructor() {
    super({
      id: messages.getUtxoDataError.id,
      defaultMessage: messages.getUtxoDataError.defaultMessage || '',
    });
  }
}
