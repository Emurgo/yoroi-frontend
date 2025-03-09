export interface WalletChecksum {
  TextPart: string;
  ImagePart: string;
}

export interface WalletPlate {
  TextPart: string;
  ImagePart: string;
}

export interface WalletState {
  id: string;
  name: string;
  type: 'mnemonic' | 'hardware';
  plate?: WalletChecksum;
  balance?: string | number;
}

export interface ConnectedWalletProps {
  publicDeriver: WalletState;
  walletBalance?: React.ReactNode;
  onClick?: () => void;
} 