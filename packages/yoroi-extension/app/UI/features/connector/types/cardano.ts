import { ReactNode } from 'react';
import { BigNumber } from 'bignumber.js';
import type { LocalizableError } from '../../../../i18n/LocalizableError';
import type { Notification } from '../../../../types/notification.types';
import type { NetworkRow, TokenRow } from '../../../../api/ada/lib/storage/database/primitives/tables';
import type { SelectedExplorer } from '../../../../domain/SelectedExplorer';
import type { WhitelistEntry } from '../../../../../chrome/extension/connector/types';
import type { WalletState, WalletType } from '../../../../../chrome/extension/background/types';
import type { UnitOfAccountSettingType } from '../../../../types/unitOfAccountType';

export type { TokenRow };

export interface TokenLookupKey {
  identifier: string;
  networkId: number;
}

export interface TokenEntry {
  identifier: string;
  networkId: number;
  amount: BigNumber;
}

export interface TokenEntryWithFee extends TokenEntry {
  fee: BigNumber;
}

export interface DefaultTokenEntry extends TokenEntry {
  isDefault: boolean;
}

export interface DisplayAmount {
  fiatAmount: string | null;
  currency: string | null;
  amount: string;
  fee: string;
  total: string;
  ticker: ReactNode | string;
}

export interface SummaryAssetsData {
  total: DisplayAmount | object;
  isOnlyTxFee: boolean;
  sent: Array<any>;
  received: Array<any>;
}

export interface CardanoConnectorSignRequest {
  tx?: string;
  address?: string;
  payload?: string;
  amount?: string;
  fee?: string;
  total?: string;
  utxos?: Array<{
    amount: BigNumber;
    id: string;
    index: number;
  }>;
}

export interface SignSubmissionErrorType {
  code: string;
  message: string;
}

export interface CardanoSignTxPageProps {
  // Transaction data
  txData: CardanoConnectorSignRequest | null;
  signData: { address: string; payload: string } | null;
  
  // Token and network info
  getTokenInfo: (key: TokenLookupKey) => TokenRow | null;
  defaultToken: DefaultTokenEntry;
  network: NetworkRow;
  selectedExplorer: SelectedExplorer;
  
  // Website connection
  connectedWebsite: WhitelistEntry | null;
  
  // Actions
  onConfirm: (password: string) => Promise<void>;
  onCancel: () => void;
  onCopyAddressTooltip: (address: string, message: string) => void;
  
  // Display settings
  shouldHideBalance: boolean;
  unitOfAccountSetting: UnitOfAccountSettingType;
  getCurrentPrice: (from: string, to: string) => string | null;
  addressToDisplayString: (address: string) => string;
  
  // Wallet info
  selectedWallet: WalletState;
  walletType: WalletType;
  
  // Notifications and errors
  notification: Notification | null;
  submissionError: SignSubmissionErrorType | null;
  hwWalletError: LocalizableError | null;
  isHwWalletErrorRecoverable: boolean | null;
} 