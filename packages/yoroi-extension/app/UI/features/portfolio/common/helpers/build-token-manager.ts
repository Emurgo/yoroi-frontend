import { portfolioApiMaker, portfolioTokenManagerMaker } from '@yoroi/portfolio';
import { App, Chain, Portfolio } from '@yoroi/types';
import { freeze } from 'immer';

const buildPortfolioTokenManager = ({ network }: { network: Chain.SupportedNetworks }) => {

  const api = portfolioApiMaker({
    network,
    maxConcurrentRequests: 3,
    maxIdsPerRequest: 120,
  });

  const tokenManager = portfolioTokenManagerMaker({
    api,
    storage: {
      token: {
        infos: {
          save: () => {},
          read: (keys: readonly `${string}.${string}`[]) => {
            return keys.map(key => [key, null] as [`${string}.${string}`, null]);
          },
          all: () => {
            return [];
          },
          keys: () => [],
          clear: () => {},
        },
      },
      clear: () => {},
    },
  });

  tokenManager.hydrate({ sourceId: 'initial' });
  return { tokenManager };
};

export const buildPortfolioTokenManagers = () => {
  const mainnetPortfolioTokenManager = buildPortfolioTokenManager({ network: Chain.Network.Mainnet });
  const preprodPortfolioTokenManager = buildPortfolioTokenManager({ network: Chain.Network.Preprod });
  const previewPortfolioTokenManager = buildPortfolioTokenManager({ network: Chain.Network.Preview });

  const tokenManagers: Readonly<{
    [Chain.Network.Mainnet]: Portfolio.Manager.Token;
    [Chain.Network.Preprod]: Portfolio.Manager.Token;
    [Chain.Network.Preview]: Portfolio.Manager.Token;
  }> = freeze(
    {
      [Chain.Network.Mainnet]: mainnetPortfolioTokenManager.tokenManager,
      [Chain.Network.Preprod]: preprodPortfolioTokenManager.tokenManager,
      [Chain.Network.Preview]: previewPortfolioTokenManager.tokenManager,
    },
    true
  );

  const tokenStorages: Readonly<{
    [Chain.Network.Mainnet]: App.Storage<false, Portfolio.Token.Id>;
    [Chain.Network.Preprod]: App.Storage<false, Portfolio.Token.Id>;
    [Chain.Network.Preview]: App.Storage<false, Portfolio.Token.Id>;
  }> = freeze(
    {
      [Chain.Network.Mainnet]: mainnetPortfolioTokenManager.storage,
      [Chain.Network.Preprod]: preprodPortfolioTokenManager.storage,
      [Chain.Network.Preview]: previewPortfolioTokenManager.storage,
    },
    true
  );

  return { tokenManagers, tokenStorages };
};


export const { tokenManagers } = buildPortfolioTokenManagers();
