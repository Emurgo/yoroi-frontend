// @flow

import type { Node } from 'react';
import React from 'react';
import BigNumber from 'bignumber.js';
import { withScreenshot } from 'storycap';
import { select, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import URILandingPage from './URILandingPage';
import { THEMES } from '../../themes';
import {
  globalKnobs,
  genUnitOfAccount,
} from '../../../stories/helpers/StoryWrapper';
import { getDefaultExplorer } from '../../domain/Explorer';

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
  const uriParams = (() => {
    const linkVal = linkValue();
    if (linkVal === linkCases.Send) {
      return {
        address: 'Ae2tdPwUPEZ5PxKxoyZDgjsKgMWMpTRa4PH3sVgARSGBsWwNBH3qg7cMFsP',
        amount: new BigNumber(1),
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
            first: null,
          },
          coinPriceStore: {
            getCurrentPrice: (_from, _to) => 5,
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
              profile: {
                selectedAPI: globalKnobs.selectedAPI(),
                isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
                selectedExplorer: getDefaultExplorer(),
                unitOfAccount: genUnitOfAccount(),
              },
              coinPriceStore: {
                getCurrentPrice: (_from, _to) => 5,
              },
              loading: {
                uriParams,
              },
            },
          },
        },
      }}
    />
  );
};
