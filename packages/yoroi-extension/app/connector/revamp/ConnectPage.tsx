import type { StoresMap } from '../stores';
import type { WalletState } from '../../UI/features/connector/types/wallet';
import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { ConnectPage as ConnectPageUI } from '../../UI/features/connector/components/connect/ConnectPage';
import { Box } from '@mui/material';
import { LoadingWalletStates } from '../../UI/features/connector/types/connect';
import { userConnectResponse } from '../../api/thunk';
import { ampli } from '../../../ampli';
import { autorun } from 'mobx';

type Props = {
  stores: StoresMap;
};

export const ConnectPage: React.FC<Props> = observer(({ stores }) => {
  const [isAppAuth, setIsAppAuth] = useState(false);
  const { connector, profile } = stores;
  const {
    publicDerivers,
    connectedWallet,
    whiteList,
    error,
    loadingWallets: loading,
    selectedWallet,
    hidePasswordForm,
    onSelectWallet,
    connectingMessage,
  } = connector;

  const onUnload = () => {
    userConnectResponse({
      accepted: false,
      tabId: connectingMessage?.tabId,
    });
  };

  useEffect(() => {
    connector.refreshWallets();

    window.addEventListener('beforeunload', onUnload);
    window.addEventListener('unload', onUnload);

    autorun(() => {
      if (loading === LoadingWalletStates.SUCCESS) {
        ampli.dappPopupConnectWalletPageViewed({
          wallet_count: connector.wallets.length,
        });
      }
    });

    return () => {
      window.removeEventListener('beforeunload', onUnload);
      window.removeEventListener('unload', onUnload);
    };
  }, []);

  const handleConnect = async (deriver: WalletState, checksum: string, password: string): Promise<void> => {
    try {
      if (!deriver || !checksum || !password) return;
      // await connectWallet(deriver, checksum, password);
      setIsAppAuth(true);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    userConnectResponse({
      accepted: false,
      tabId: connectingMessage?.tabId,
    });
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
        message={
          website && {
            url: website.url || '',
            icon: website.icon,
          }
        }
        onSelectWallet={onSelectWallet}
        network={networkId}
        shouldHideBalance={profile.shouldHideBalance}
        isAppAuth={isAppAuth}
        onUpdateHideBalance={handleUpdateHideBalance}
        selectedWallet={selectedWallet || {}}
        onConnect={handleConnect}
        onCancel={handleCancel}
        hidePasswordForm={hidePasswordForm}
      />
    </Box>
  );
});
