import { ReactNode } from 'react';

export interface SignTxTabsProps {
  connectionContent: ReactNode;
  utxosContent: ReactNode;
  detailsContent: ReactNode;
  isDataSignin: boolean;
} 