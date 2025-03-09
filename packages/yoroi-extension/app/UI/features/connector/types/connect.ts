import { PublicDeriver } from '../../../../api/ada/lib/storage/models/PublicDeriver';
import { WalletChecksum } from './wallet';

export enum LoadingWalletStates {
  IDLE = 'IDLE',
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  REJECTED = 'REJECTED'
}

export interface ConnectMessage {
  url: string;
  icon?: string;
}

export interface ConnectPageProps {
  loading: LoadingWalletStates;
  error?: string;
  publicDerivers: Array<PublicDeriver>;
  message?: ConnectMessage;
  onSelectWallet: (wallet: PublicDeriver, checksum: string | null) => void;
  network: string;
  shouldHideBalance: boolean;
  isAppAuth: boolean;
  onUpdateHideBalance: () => void;
  selectedWallet: {
    deriver?: any;
    checksum?: string;
  };
  onConnect: (deriver: any, checksum: string, password: string) => Promise<void>;
  onCancel: () => void;
  hidePasswordForm: () => void;
}

export interface ConnectedWalletProps {
  publicDeriver: {
    id: string;
    name: string;
    plate?: WalletChecksum;
  };
  walletBalance: string | null;
  onClick?: () => void;
} 