// @flow

// Define types that are exposed to connect to the API layer

import BigNumber from 'bignumber.js';
import { defineMessages } from 'react-intl';

import LocalizableError from '../i18n/LocalizableError';
import WalletTransaction from '../domain/WalletTransaction';
import WalletAddress from '../domain/WalletAddress';
import Wallet from '../domain/Wallet';
import { HWFeatures } from '../types/HWConnectStoreTypes';
import type { SignedResponse } from './ada/lib/yoroi-backend-api';
import type {
  TransactionExportRow,
  TransactionExportDataFormat,
  TransactionExportFileType
} from './export';

const messages = defineMessages({
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
});

export class GenericApiError extends LocalizableError {
  constructor() {
    super({
      id: messages.genericApiError.id,
      defaultMessage: messages.genericApiError.defaultMessage,
    });
  }
}

export class IncorrectWalletPasswordError extends LocalizableError {
  constructor() {
    super({
      id: messages.incorrectWalletPasswordError.id,
      defaultMessage: messages.incorrectWalletPasswordError.defaultMessage,
    });
  }
}

export class WalletAlreadyRestoredError extends LocalizableError {
  constructor() {
    super({
      id: messages.walletAlreadyRestoredError.id,
      defaultMessage: messages.walletAlreadyRestoredError.defaultMessage,
    });
  }
}

export class ReportRequestError extends LocalizableError {
  constructor() {
    super({
      id: messages.reportRequestError.id,
      defaultMessage: messages.reportRequestError.defaultMessage,
    });
  }
}

export class UnusedAddressesError extends LocalizableError {
  constructor() {
    super({
      id: messages.unusedAddressesError.id,
      defaultMessage: messages.unusedAddressesError.defaultMessage,
    });
  }
}

export type GetAddressesRequest = {
  walletId: string
};
export type GetAddressesResponse = {
  accountId: ?string,
  addresses: Array<WalletAddress>
};

export type GetTransactionsRequesOptions = {
  skip: number,
  limit: number,
};
export type GetTransactionsRequest = {
  walletId: string,
} & GetTransactionsRequesOptions;
export type GetTransactionsResponse = {
  transactions: Array<WalletTransaction>,
  total: number,
};

export type GetTransactionRowsToExportRequest = void; // TODO: Implement in the Next iteration
export type GetTransactionRowsToExportResponse = Array<TransactionExportRow>;

export type ExportTransactionsRequest = {
  rows: Array<TransactionExportRow>,
  format?: TransactionExportDataFormat,
  fileType?: TransactionExportFileType,
  fileName?: string
};
export type ExportTransactionsResponse = void;  // TODO: Implement in the Next iteration

export type CreateWalletRequest = {
  name: string,
  mnemonic: string,
  password: string,
};
export type CreateWalletResponse = Wallet;

export type DeleteWalletRequest = {
  walletId: string,
};
export type DeleteWalletResponse = boolean;

export type RestoreWalletRequest = {
  recoveryPhrase: string,
  walletName: string,
  walletPassword: string,
};
export type RestoreWalletResponse = Wallet;

export type CreateHardwareWalletRequest = {
  walletName: string,
  publicMasterKey: string,
  hwFeatures: HWFeatures,
};
export type CreateHardwareWalletResponse = Wallet;

export type UpdateWalletPasswordRequest = {
  walletId: string,
  oldPassword: string,
  newPassword: string,
};
export type UpdateWalletPasswordResponse = boolean;

export type UpdateWalletResponse = Wallet;

export type CreateTransactionResponse = SignedResponse;

export type BroadcastTrezorSignedTxResponse = SignedResponse;

export type PrepareAndBroadcastLedgerSignedTxResponse = SignedResponse;

export type GetWalletsResponse = Array<Wallet>;

export type GenerateWalletRecoveryPhraseResponse = Array<string>;

export type RefreshPendingTransactionsResponse = Array<WalletTransaction>;

export type GetBalanceResponse = BigNumber;
