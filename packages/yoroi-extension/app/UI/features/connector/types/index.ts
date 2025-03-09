export interface ConnectorState {
  isConnected: boolean;
  isLoading: boolean;
  error?: string;
}

export interface WalletInfo {
  id: string;
  name: string;
  icon?: string;
  apiVersion: string;
}

export interface ConnectorProps {
  onConnect?: (walletInfo: WalletInfo) => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
}

export interface ConnectedWalletProps {
  wallet: WalletInfo;
  onDisconnect: () => void;
}

export interface ProgressBarProps {
  step?: number;
  max?: number;
} 