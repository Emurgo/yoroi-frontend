import type { StoresMap } from '../../../../stores';
import * as React from 'react';
import { observer } from 'mobx-react';
import { addressHexToBech32 } from '../../../../api/ada/lib/cardanoCrypto/utils';
import { CoreAddressTypes } from '../../../../api/ada/lib/storage/database/primitives/enums';

const defaultReceiveState = {
  spendableBalance: null,
  getTokenInfo: () => null,
  selectedWallet: null,
  isSelectedWalletSingleAddress: false,
  updateSelectedWalletSingleAddressMode: async (_mode: boolean) => {},
  walletAddress: '',
  isAddressUsed: false,
  selectedExplorerForNetwork: null,
};
export const ReceiveContext = React.createContext<any>(defaultReceiveState);

type ReceiveContextProviderProps = {
  children: React.ReactNode;
  stores: StoresMap;
};

export const ReceiveContextProvider = observer(({ children, stores }: ReceiveContextProviderProps) => {
  const { wallets } = stores;

  const selectedWallet = wallets.selected;

  const firstAddress = stores.wallets.selectedOrFail.allAddresses.utxoAddresses.find(
    a => a.address.Type === CoreAddressTypes.CARDANO_BASE
  );
  if (!firstAddress) {
    throw new Error('unexpectedly missing base address');
  }
  const walletAddress = addressHexToBech32(firstAddress.address.Hash);

  const selectedExplorerForNetwork =
    stores.explorers.selectedExplorer.get(stores.wallets.selectedOrFail.networkId) ??
    (() => {
      throw new Error('No explorer for wallet network');
    })();

  const initialState = {
    isAddressUsed: firstAddress.IsUsed,
    walletAddress,
    selectedWallet,
    isSelectedWalletSingleAddress: wallets.isSelectedWalletSingleAddress,
    updateSelectedWalletSingleAddressMode: wallets.updateSelectedWalletSingleAddressMode,
    selectedExplorerForNetwork,
  };

  const state = React.useMemo(
    () => ({
      ...defaultReceiveState,
      ...initialState,
    }),
    [initialState]
  );

  const actions = React.useRef({}).current;

  const context = React.useMemo(
    () => ({
      ...state,
      ...actions,
    }),
    [state, actions]
  );

  return <ReceiveContext.Provider value={context}>{children}</ReceiveContext.Provider>;
});

export const useReceive = () =>
  React.useContext(ReceiveContext) ?? console.log('useReceive: needs to be wrapped in a Receive ContextProvider');
