import type { StoresMap } from '../../../../stores/index';
import * as React from 'react';
import { defaultDappCenterActions, defaultDappCenterState } from './state';
import { genLookupOrFail } from '../../../../stores/stateless/tokenHelpers';
import { observer } from 'mobx-react';

const initialDappCenterProvider = {
  ...defaultDappCenterState,
  ...defaultDappCenterActions,
};
const DappCenterContext = React.createContext(initialDappCenterProvider);

type DappCenterProviderProps = {
  children: React.ReactNode;
  stores: StoresMap;
};

export const DappCenterContextProvider = observer(({ children, stores }: DappCenterProviderProps) => {
  const { connector, wallets, profile, tokenInfoStore } = stores;

  const initialState = {
    whitelistEntries: connector.currentConnectorWhitelist,
    wallets: wallets.wallets,
    shouldHideBalance: profile.shouldHideBalance,
    tokenInfo: tokenInfoStore.tokenInfo,
  };

  const state = React.useMemo(
    () => ({
      ...defaultDappCenterState,
      ...initialState,
    }),
    [initialState]
  );
  console.log('state', state);

  React.useEffect(() => {
    const prepareConnector = async () => {
      await connector.refreshActiveSites();
      await connector.getConnectorWhitelist();
    };

    prepareConnector();
  }, [stores]);

  const removeWalletFromWhitelist = (url: string) => connector.removeWalletFromWhitelist1({ url });

  const actions = React.useRef({
    removeWalletFromWhitelist,
    getTokenInfo: genLookupOrFail(tokenInfoStore.tokenInfo),
  }).current;

  const context = React.useMemo(
    () => ({
      ...state,
      ...actions,
    }),
    [state, actions]
  );

  return <DappCenterContext.Provider value={context}>{children}</DappCenterContext.Provider>;
});

export const useDappCenter = () =>
  React.useContext(DappCenterContext) ?? console.log('useDappCenter: needs to be wrapped in a DappCenterManagerProvider');
