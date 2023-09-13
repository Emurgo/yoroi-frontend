// @flow

import type { Node } from 'react';
import { select, } from '@storybook/addon-knobs';
import { withScreenshot } from 'storycap';
import {
  walletLookup,
} from '../../../stories/helpers/WalletCache';
import {
  genShelleyCip1852DummyWithCache,
} from '../../../stories/helpers/cardano/ShelleyCip1852Mocks';
import ByronEraOptionDialogContainer from './options/ByronEraOptionDialogContainer';
import { ROUTES } from '../../routes-config';
import Transfer from './Transfer';
import { mockTransferProps } from './Transfer.mock';

export default {
  title: `${__filename.split('.')[0]}`,
  component: Transfer,
  decorators: [withScreenshot],
};

export const MainPage = (): Node => {
  const wallet = genShelleyCip1852DummyWithCache();
  const walletCases = {
    NoWallet: 0,
    HasWallet: 1
  };
  const walletValue = () => select(
    'walletCases',
    walletCases,
    walletCases.HasWallet,
  );
  const walletVal = walletValue();
  const lookup = walletLookup(walletVal === walletCases.NoWallet
    ? []
    : [wallet]);
  return (<Transfer
    {...mockTransferProps({
      currentRoute: ROUTES.TRANSFER.YOROI,
      selected: walletVal === walletCases.NoWallet ? null : wallet.publicDeriver,
      ...lookup,
    })}
  />);
};


export const ByronDialog = (): Node => {
  const wallet = genShelleyCip1852DummyWithCache();
  const lookup = walletLookup([wallet]);
  return (<Transfer
    {...mockTransferProps({
      currentRoute: ROUTES.TRANSFER.YOROI,
      dialog: ByronEraOptionDialogContainer,
      selected: wallet.publicDeriver,
      ...lookup,
    })}
  />);
};
