import React from 'react';
import { observer } from 'mobx-react';
import type { StoresMap } from '../stores';
import { ConnectPage as ConnectPageUI } from '../../UI/features/connector/components/connect/ConnectPage';
import { Box } from '@mui/material';
import { LoadingWalletStates } from '../../UI/features/connector/types/connect';
import type { WalletState } from '../../UI/features/connector/types/wallet';

type Props = {
  stores: StoresMap;
};

export const ConnectPage: React.FC<Props> = observer(({ stores }) => {
  const { connector, profile } = stores;
  const { 
    publicDerivers,
    connectedWallet,
    whiteList,
    error,
    connectWallet,
    cancelConnectWallet,
    loading,
    selectedWallet,
    hidePasswordForm,
    onSelectWallet
  } = connector;

  const handleConnect = async (
    deriver: WalletState,
    checksum: string,
    password: string
  ): Promise<void> => {
    try {
      if (!deriver || !checksum || !password) return;
      await connectWallet(deriver, checksum, password);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  const handleUpdateHideBalance = async (): Promise<void> => {
    if (profile.updateHideBalance) {
      await profile.updateHideBalance();
    }
  };

  const networkId = selectedWallet?.networkId || connectedWallet?.networkId || 'mainnet';
  const website = whiteList?.[0];

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <ConnectPageUI
        loading={loading || LoadingWalletStates.IDLE}
        error={error || ''}
        publicDerivers={publicDerivers || []}
        message={website ? { 
          url: website.url || '', 
          icon: website.icon 
        } : undefined}
        onSelectWallet={onSelectWallet}
        network={networkId}
        shouldHideBalance={profile.shouldHideBalance}
        isAppAuth={!!website?.isAppAuth}
        onUpdateHideBalance={handleUpdateHideBalance}
        selectedWallet={selectedWallet || {}}
        onConnect={handleConnect}
        onCancel={cancelConnectWallet}
        hidePasswordForm={hidePasswordForm}
      />
    </Box>
  );
}); 