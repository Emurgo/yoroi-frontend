// @flow

import type { Node } from 'react';
import { action } from '@storybook/addon-actions';

import SupportSettingsPage from './SupportSettingsPage';
import { withScreenshot } from 'storycap';
import { wrapSettings } from '../../../Routes';
import { mockSettingsProps } from '../Settings.mock';
import { ROUTES } from '../../../routes-config';
import {
  walletLookup,
} from '../../../../stories/helpers/WalletCache';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver';
import { ComplexityLevels } from '../../../types/complexityLevelType';
import { select, } from '@storybook/addon-knobs';
import WalletStore from '../../../stores/toplevel/WalletStore';
import {
  genShelleyCip1852DummyWithCache,
} from '../../../../stories/helpers/cardano/ShelleyCip1852Mocks';
import IncludePublicKeyDialog from './IncludePublicKeyDialog';

export default {
  title: `${__filename.split('.')[0]}`,
  component: SupportSettingsPage,
  decorators: [withScreenshot],
};

const genBaseProps: {|
  wallet: null | PublicDeriver<>,
  openDialog?: any,
  getPublicKeyCache:
    typeof WalletStore.prototype.getPublicKeyCache,
|} => * = (request) => ({
  actions: {
    dialogs: {
      open: { trigger: action('open') },
    },
  },
  stores: {
    uiDialogs: {
      isOpen: (dialog) => dialog === request.openDialog,
    },
    profile: {
      selectedComplexityLevel: select('complexityLevel', ComplexityLevels, ComplexityLevels.Simple),
    },
    wallets: {
      selected: request.wallet,
      getPublicKeyCache: request.getPublicKeyCache,
    },
  },
  IncludePublicKeyDialogProps: {
    generated: {
      stores: Object.freeze({}),
      actions: {
        dialogs: {
          closeActiveDialog: { trigger: action('closeActiveDialog') },
        },
      },
    },
  },
});

export const Generic = (): Node => {
  const lookup = walletLookup([]);
  return wrapSettings(
    mockSettingsProps({
      location: ROUTES.SETTINGS.SUPPORT,
      selected: null,
      ...lookup,
    }),
    (<SupportSettingsPage
      generated={genBaseProps({
        wallet: null,
        getPublicKeyCache: lookup.getPublicKeyCache,
      })}
    />)
  );
};

export const IncludeKeyDialog = (): Node => {
  const wallet = genShelleyCip1852DummyWithCache();
  const lookup = walletLookup([wallet]);
  return wrapSettings(
    mockSettingsProps({
      location: ROUTES.SETTINGS.SUPPORT,
      selected: null,
      ...lookup,
    }),
    (<SupportSettingsPage
      generated={genBaseProps({
        wallet: wallet.publicDeriver,
        openDialog: IncludePublicKeyDialog,
        getPublicKeyCache: lookup.getPublicKeyCache,
      })}
    />)
  );
};

/* ===== Notable variations ===== */
