import { defineMessages } from 'react-intl';
import LocalizableError from '../../i18n/LocalizableError';

const messages = defineMessages({
  walletAlreadyImportedError: {
    id: 'api.errors.WalletAlreadyImportedError',
    defaultMessage: '!!!Wallet you are trying to import already exists.',
    description: '"Wallet you are trying to import already exists." error message.'
  },
  redeemAdaError: {
    id: 'api.errors.RedeemAdaError',
    defaultMessage: '!!!Your ADA could not be redeemed correctly.',
    description: '"Your ADA could not be redeemed correctly." error message.'
  },
  walletFileImportError: {
    id: 'api.errors.WalletFileImportError',
    defaultMessage: '!!!Wallet could not be imported, please make sure you are providing a correct file.',
    description: '"Wallet could not be imported, please make sure you are providing a correct file." error message.'
  },
  notEnoughMoneyToSendError: {
    id: 'api.errors.NotEnoughMoneyToSendError',
    defaultMessage: '!!!Not enough money to make this transaction.',
    description: '"Not enough money to make this transaction." error message.'
  },
  updateAdaWalletError: {
    id: 'api.errors.updateAdaWalletError',
    defaultMessage: '!!!Error while updating ada wallet.',
    description: '"Error while updating ada wallet." error message'
  },
  getBalanceError: {
    id: 'api.errors.getBalanceError',
    defaultMessage: '!!!Error while getting Balance.',
    description: '"Error while getting Balance." error message'
  },
  updateAdaTxsHistoryError: {
    id: 'api.errors.updateAdaTxsHistoryError',
    defaultMessage: '!!!Error while updating ada transactions history.',
    description: '"Error while updating ada transactions history." error message'
  },
  transactionError: {
    id: 'api.errors.transactionError',
    defaultMessage: '!!!Error while creating transaction.',
    description: '"Error while creating transaction." error message'
  },
  pendingTransactionError: {
    id: 'api.errors.pendingTransactionError',
    defaultMessage: '!!!Error while updating pending transactions.',
    description: '"Error while updating pending transactions." error message'
  },
  getAddressesWithFundsError: {
    id: 'api.errors.getAddressesWithFundsError',
    defaultMessage: '!!!Error while getting addresses with funds.',
    description: '"Error while getting addresses with funds." error message'
  },
  noInputsError: {
    id: 'api.errors.noInputsError',
    defaultMessage: '!!!The wallet restored from your recovery phrase is empty. Please check your recovery phrase and attempt restoration again.',
    description: '"Wallet without funds" error message'
  },
  generateTransferTxError: {
    id: 'api.errors.generateTransferTxError',
    defaultMessage: '!!!Error while generating transfer transacion.',
    description: '"Error while generating transfer transacion." error message'
  },
  sendTransactionError: {
    id: 'api.errors.sendTransactionError',
    defaultMessage: '!!!Error received from api method call while sending tx.',
    description: '"Error received from api method call while sending tx." error message'
  },
  getAllUTXOsForAddressesError: {
    id: 'api.errors.getAllUTXOsForAddressesError',
    defaultMessage: '!!!Error received from api method call while getting utxos.',
    description: '"Error received from api method call while getting utxos." error message'
  },
  getTxsBodiesForUTXOsError: {
    id: 'api.errors.getTxsBodiesForUTXOsError',
    defaultMessage: '!!!Error received from api method call while getting TxBodies.',
    description: '"Error received from api method call while getting TxBodies." error message'
  },
  getTxsBodiesForUTXOsApiError: {
    id: 'api.errors.getTxsBodiesForUTXOsApiError',
    defaultMessage: '!!!Error received from server while getting TxBodies.',
    description: '"Error received from server while getting TxBodies." error message'
  },
  discoverAddressesError: {
    id: 'api.errors.discoverAddressesError',
    defaultMessage: '!!!Error received from api method call while discovering addresses.',
    description: '"Error received from api method call while discovering addresses." error message'
  },
  getUtxosForAddressesApiError: {
    id: 'api.errors.getUtxosForAddressesApiError',
    defaultMessage: '!!!Error received from server while getting UTXOs.',
    description: '"Error received from server while getting UTXOs." error message'
  },
  getUtxosSumsForAddressesApiError: {
    id: 'api.errors.getUtxosSumsForAddressesApiError',
    defaultMessage: '!!!Error received from server while getting balance.',
    description: '"Error received from server while getting balance." error message'
  },
  getTxHistoryForAddressesApiError: {
    id: 'api.errors.getTxHistoryForAddressesApiError',
    defaultMessage: '!!!Error received from server while getting txs.',
    description: '"Error received from server while getting txs." error message'
  },
  sendTransactionApiError: {
    id: 'api.errors.sendTransactionApiError',
    defaultMessage: '!!!Error received from server while sending tx.',
    description: '"Error received from server while sending tx." error message'
  },
  checkAdressesInUseApiError: {
    id: 'api.errors.checkAdressesInUseApiError',
    defaultMessage: '!!!Error received from server while checking used addresses.',
    description: '"Error received from server while checking used addresses." error message'
  },
  invalidWitnessError: {
    id: 'api.errors.invalidWitnessError',
    defaultMessage: '!!!The signature is invalid.',
    description: '"The signature is invalid." error message'
  },
  invalidCertificateError: {
    id: 'api.errors.invalidCertificateError',
    defaultMessage: '!!!Invalid certificate.',
    description: '"Invalid certificate." error message'
  },
  readFileError: {
    id: 'api.errors.readFileError',
    defaultMessage: '!!!Error while reading file.',
    description: '"Error while reading file." error message'
  },
  decryptionError: {
    id: 'api.errors.decryptionError',
    defaultMessage: '!!!Error while decrypting file.',
    description: '"Error while decrypting file." error message'
  },
  parsePDFFileError: {
    id: 'api.errors.parsePDFFileError',
    defaultMessage: '!!!Error while parsing PDF file.',
    description: '"Error while parsing PDF file." error message'
  },
  parsePDFPageError: {
    id: 'api.errors.parsePDFPageError',
    defaultMessage: '!!!Error while parsing PDF file page.',
    description: '"Error while parsing PDF file page." error message'
  },
  parsePDFKeyError: {
    id: 'api.errors.parsePDFKeyError',
    defaultMessage: '!!!Error while parsing secret key.',
    description: '"Error while parsing secret key." error message'
  },
  invalidMnemonicError: {
    id: 'api.errors.invalidMnemonicError',
    defaultMessage: '!!!Invalid phrase entered, please check.',
    description: '"Invalid phrase entered, please check." error message'
  },
  adaRedemptionEncryptedCertificateParseError: {
    id: 'api.errors.adaRedemptionEncryptedCertificateParseError',
    defaultMessage: '!!!The ADA redemption code could not be parsed, please check your passphrase.',
    description: '"The ADA redemption code could not be parsed, please check your passphrase." error message'
  },
  adaRedemptionCertificateParseError: {
    id: 'api.errors.adaRedemptionCertificateParseError',
    defaultMessage: '!!!The ADA redemption code could not be parsed from the given document.',
    description: '"The ADA redemption code could not be parsed from the given document." error message'
  },
  noCertificateError: {
    id: 'api.errors.noCertificateError',
    defaultMessage: '!!!Certificate File is required for parsing.',
    description: '"Certificate File is required for parsing." error message'
  },
  redemptionKeyAlreadyUsedError: {
    id: 'api.errors.redemptionKeyAlreadyUsedError',
    defaultMessage: '!!!Redemption key has already been used.',
    description: '"Redemption key has already been used." error message.'
  }
});

export class WalletAlreadyImportedError extends LocalizableError {
  constructor() {
    super({
      id: messages.walletAlreadyImportedError.id,
      defaultMessage: messages.walletAlreadyImportedError.defaultMessage,
    });
  }
}

export class RedeemAdaError extends LocalizableError {
  constructor() {
    super({
      id: messages.redeemAdaError.id,
      defaultMessage: messages.redeemAdaError.defaultMessage,
    });
  }
}

export class WalletFileImportError extends LocalizableError {
  constructor() {
    super({
      id: messages.walletFileImportError.id,
      defaultMessage: messages.walletFileImportError.defaultMessage,
    });
  }
}

export class NotEnoughMoneyToSendError extends LocalizableError {
  constructor() {
    super({
      id: messages.notEnoughMoneyToSendError.id,
      defaultMessage: messages.notEnoughMoneyToSendError.defaultMessage,
    });
  }
}

export class UpdateAdaWalletError extends LocalizableError {
  constructor() {
    super({
      id: messages.updateAdaWalletError.id,
      defaultMessage: messages.updateAdaWalletError.defaultMessage,
    });
  }
}

export class GetBalanceError extends LocalizableError {
  constructor() {
    super({
      id: messages.getBalanceError.id,
      defaultMessage: messages.getBalanceError.defaultMessage,
    });
  }
}

export class UpdateAdaTxsHistoryError extends LocalizableError {
  constructor() {
    super({
      id: messages.updateAdaTxsHistoryError.id,
      defaultMessage: messages.updateAdaTxsHistoryError.defaultMessage,
    });
  }
}

export class TransactionError extends LocalizableError {
  constructor() {
    super({
      id: messages.transactionError.id,
      defaultMessage: messages.transactionError.defaultMessage,
    });
  }
}

export class PendingTransactionError extends LocalizableError {
  constructor() {
    super({
      id: messages.pendingTransactionError.id,
      defaultMessage: messages.pendingTransactionError.defaultMessage,
    });
  }
}

export class GetAddressesWithFundsError extends LocalizableError {
  constructor() {
    super({
      id: messages.getAddressesWithFundsError.id,
      defaultMessage: messages.getAddressesWithFundsError.defaultMessage
    });
  }
}

export class NoInputsError extends LocalizableError {
  constructor() {
    super({
      id: messages.noInputsError.id,
      defaultMessage: messages.noInputsError.defaultMessage
    });
  }
}

export class GenerateTransferTxError extends LocalizableError {
  constructor() {
    super({
      id: messages.generateTransferTxError.id,
      defaultMessage: messages.generateTransferTxError.defaultMessage
    });
  }
}

export class SendTransactionError extends LocalizableError {
  constructor() {
    super({
      id: messages.sendTransactionError.id,
      defaultMessage: messages.sendTransactionError.defaultMessage
    });
  }
}

export class GetAllUTXOsForAddressesError extends LocalizableError {
  constructor() {
    super({
      id: messages.getAllUTXOsForAddressesError.id,
      defaultMessage: messages.getAllUTXOsForAddressesError.defaultMessage
    });
  }
}

export class DiscoverAddressesError extends LocalizableError {
  constructor() {
    super({
      id: messages.discoverAddressesError.id,
      defaultMessage: messages.discoverAddressesError.defaultMessage
    });
  }
}

export class GetUtxosForAddressesApiError extends LocalizableError {
  constructor() {
    super({
      id: messages.getUtxosForAddressesApiError.id,
      defaultMessage: messages.getUtxosForAddressesApiError.defaultMessage
    });
  }
}

export class GetTxsBodiesForUTXOsError extends LocalizableError {
  constructor() {
    super({
      id: messages.getTxsBodiesForUTXOsError.id,
      defaultMessage: messages.getTxsBodiesForUTXOsError.defaultMessage
    });
  }
}

export class GetTxsBodiesForUTXOsApiError extends LocalizableError {
  constructor() {
    super({
      id: messages.getTxsBodiesForUTXOsApiError.id,
      defaultMessage: messages.getTxsBodiesForUTXOsApiError.defaultMessage
    });
  }
}

export class GetUtxosSumsForAddressesApiError extends LocalizableError {
  constructor() {
    super({
      id: messages.getUtxosSumsForAddressesApiError.id,
      defaultMessage: messages.getUtxosSumsForAddressesApiError.defaultMessage
    });
  }
}

export class GetTxHistoryForAddressesApiError extends LocalizableError {
  constructor() {
    super({
      id: messages.getTxHistoryForAddressesApiError.id,
      defaultMessage: messages.getTxHistoryForAddressesApiError.defaultMessage
    });
  }
}

export class SendTransactionApiError extends LocalizableError {
  constructor() {
    super({
      id: messages.sendTransactionApiError.id,
      defaultMessage: messages.sendTransactionApiError.defaultMessage
    });
  }
}

export class CheckAdressesInUseApiError extends LocalizableError {
  constructor() {
    super({
      id: messages.checkAdressesInUseApiError.id,
      defaultMessage: messages.checkAdressesInUseApiError.defaultMessage
    });
  }
}

export class InvalidWitnessError extends LocalizableError {
  constructor() {
    super({
      id: messages.invalidWitnessError.id,
      defaultMessage: messages.invalidWitnessError.defaultMessage
    });
  }
}

export class InvalidCertificateError extends LocalizableError {
  constructor() {
    super({
      id: messages.invalidCertificateError.id,
      defaultMessage: messages.invalidCertificateError.defaultMessage
    });
  }
}

export class ReadFileError extends LocalizableError {
  constructor() {
    super({
      id: messages.readFileError.id,
      defaultMessage: messages.readFileError.defaultMessage
    });
  }
}

export class DecryptionError extends LocalizableError {
  constructor() {
    super({
      id: messages.decryptionError.id,
      defaultMessage: messages.decryptionError.defaultMessage
    });
  }
}

export class ParsePDFFileError extends LocalizableError {
  constructor() {
    super({
      id: messages.parsePDFFileError.id,
      defaultMessage: messages.parsePDFFileError.defaultMessage
    });
  }
}

export class ParsePDFPageError extends LocalizableError {
  constructor() {
    super({
      id: messages.parsePDFPageError.id,
      defaultMessage: messages.parsePDFPageError.defaultMessage
    });
  }
}

export class ParsePDFKeyError extends LocalizableError {
  constructor() {
    super({
      id: messages.parsePDFKeyError.id,
      defaultMessage: messages.parsePDFKeyError.defaultMessage
    });
  }
}

export class InvalidMnemonicError extends LocalizableError {
  constructor() {
    super({
      id: messages.invalidMnemonicError.id,
      defaultMessage: messages.invalidMnemonicError.defaultMessage
    });
  }
}

export class AdaRedemptionEncryptedCertificateParseError extends LocalizableError {
  constructor() {
    super({
      id: messages.adaRedemptionEncryptedCertificateParseError.id,
      defaultMessage: messages.adaRedemptionEncryptedCertificateParseError.defaultMessage
    });
  }
}

export class AdaRedemptionCertificateParseError extends LocalizableError {
  constructor() {
    super({
      id: messages.adaRedemptionCertificateParseError.id,
      defaultMessage: messages.adaRedemptionCertificateParseError.defaultMessage
    });
  }
}

export class NoCertificateError extends LocalizableError {
  constructor() {
    super({
      id: messages.noCertificateError.id,
      defaultMessage: messages.noCertificateError.defaultMessage
    });
  }
}

export class RedemptionKeyAlreadyUsedError extends LocalizableError {
  constructor() {
    super({
      id: messages.redemptionKeyAlreadyUsedError.id,
      defaultMessage: messages.redemptionKeyAlreadyUsedError.defaultMessage,
    });
  }
}
