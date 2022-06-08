// @flow

import type { Node } from 'react';
import BigNumber from 'bignumber.js';
import { withScreenshot } from 'storycap';
import { select, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import URILandingPage from './URILandingPage';
import { THEMES } from '../../styles/utils';
import {
  globalKnobs,
  genUnitOfAccount,
} from '../../../stories/helpers/StoryWrapper';
import { defaultToSelectedExplorer } from '../../domain/SelectedExplorer';
import {
  MultiToken,
} from '../../api/common/lib/MultiToken';
import { networks, defaultAssets } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { getDefaultEntryToken, mockFromDefaults } from '../../stores/toplevel/TokenInfoStore';

export default {
  title: `${__filename.split('.')[0]}`,
  component: URILandingPage,
  decorators: [withScreenshot],
};

export const GettingMnemonics = (): Node => {
  const linkCases = {
    Send: 0,
    Invalid: 1,
  };
  const linkValue = () => select(
    'linkCases',
    linkCases,
    linkCases.Send,
  );

  const cardanoMeta = defaultAssets.filter(
    asset => asset.NetworkId === networks.CardanoMainnet.NetworkId
  )[0];
  const uriParams = (() => {
    const linkVal = linkValue();
    if (linkVal === linkCases.Send) {
      return {
        address: 'Ae2tdPwUPEZ5PxKxoyZDgjsKgMWMpTRa4PH3sVgARSGBsWwNBH3qg7cMFsP',
        amount: new MultiToken(
          [{
            identifier: cardanoMeta.Identifier,
            networkId: cardanoMeta.NetworkId,
            amount: new BigNumber(1_000_000),
          }],
          getDefaultEntryToken(cardanoMeta)
        ),
      };
    }
    return null;
  })();
  return (
    <URILandingPage
      generated={{
        stores: {
          profile: {
            isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
          },
          loading: {
            uriParams,
            resetUriParams: action('resetUriParams'),
          },
          wallets: {
            hasAnyWallets: false,
            publicDerivers: []
          },
        },
        actions: {
          dialogs: {
            closeActiveDialog: { trigger: action('closeActiveDialog') },
          },
          router: {
            goToRoute: { trigger: action('goToRoute') },
          },
        },
        URILandingDialogContainerProps: {
          generated: {
            stores: {
              explorers: {
                selectedExplorer: defaultToSelectedExplorer(),
              },
              profile: {
                isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
                unitOfAccount: genUnitOfAccount(),
              },
              tokenInfoStore: {
                tokenInfo: mockFromDefaults(defaultAssets),
              },
              coinPriceStore: {
                getCurrentPrice: (_from, _to) => '5',
              },
              loading: {
                uriParams,
              },
            },
            firstSelectedWallet: null,
          },
        },
      }}
    />
  );
};
