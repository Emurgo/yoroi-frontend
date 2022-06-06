// @flow

import BigNumber from 'bignumber.js';
import type { Node } from 'react';
import { withScreenshot } from 'storycap';
import { boolean, select, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import {
  globalKnobs,
  genUnitOfAccount,
} from '../../../stories/helpers/StoryWrapper';
import {
  walletLookup,
} from '../../../stories/helpers/WalletCache';
import {
  genShelleyCip1852DummyWithCache,
} from '../../../stories/helpers/cardano/ShelleyCip1852Mocks';
import { mockTransferProps, wrapTransfer } from './Transfer.mock';
import { THEMES } from '../../styles/utils';
import { defaultToSelectedExplorer } from '../../domain/SelectedExplorer';
import { ROUTES } from '../../routes-config';
import DaedalusTransferPage from './DaedalusTransferPage';
import type { MockDaedalusTransferStore } from './DaedalusTransferPage';
import { TransferStatus } from '../../types/TransferTypes';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  TransferFundsError,
  NoTransferTxError,
  WebSocketRestoreError,
} from '../../stores/toplevel/DaedalusTransferStore';
import {
  GenerateTransferTxError,
  NotEnoughMoneyToSendError,
} from '../../api/common/errors';
import AdaApi from '../../api/ada/index';
import type { IAddressTypeStore, IAddressTypeUiSubset } from '../../stores/stateless/addressStores';
import { allAddressSubgroups } from '../../stores/stateless/addressStores';
import { defaultAssets, } from '../../api/ada/lib/storage/database/prepackaged/networks';
import {
  MultiToken,
} from '../../api/common/lib/MultiToken';
import { mockFromDefaults } from '../../stores/toplevel/TokenInfoStore';

export default {
  title: `${__filename.split('.')[0]}`,
  component: DaedalusTransferPage,
  decorators: [withScreenshot],
};

const genDefaultGroupMap: (
  void => Map<Class<IAddressTypeStore>, IAddressTypeUiSubset>
) = () => {
  return new Map(
    allAddressSubgroups.map(type => [
      type.class,
      {
        all: [],
        wasExecuted: true,
      },
    ])
  );
};


const genBaseProps: {|
  wallet: null | PublicDeriver<>,
  daedalusTransfer: InexactSubset<MockDaedalusTransferStore>,
|} => * = (request) => ({
  stores: {
    addresses: {
      addressSubgroupMap: genDefaultGroupMap(),
    },
    explorers: {
      selectedExplorer: defaultToSelectedExplorer(),
    },
    profile: {
      isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
      unitOfAccount: genUnitOfAccount(),
    },
    wallets: {
      selected: request.wallet,
      refreshWalletFromRemote: async () => action('refreshWalletFromRemote')(),
    },
    coinPriceStore: {
      getCurrentPrice: (_from, _to) => '5',
    },
    tokenInfoStore: {
      tokenInfo: mockFromDefaults(defaultAssets),
    },
    walletRestore: {
      isValidMnemonic: (isValidRequest) => {
        const { mnemonic, mode } = isValidRequest;
        if (!mode.length) {
          throw new Error(`${nameof(DaedalusTransferPage)}::story no length in mode`);
        }
        if (isValidRequest.mode.extra === 'paper') {
          return AdaApi.prototype.isValidPaperMnemonic({ mnemonic, numberOfWords: mode.length });
        }
        return AdaApi.isValidMnemonic({ mnemonic, numberOfWords: mode.length  });
      },
    },
    daedalusTransfer: {
      status: TransferStatus.UNINITIALIZED,
      error: undefined,
      transferTx: undefined,
      transferFundsRequest: {
        isExecuting: false,
      },
      ...request.daedalusTransfer,
    },
  },
  actions: {
    router: {
      goToRoute: { trigger: action('goToRoute') },
    },
    daedalusTransfer: {
      backToUninitialized: { trigger: action('backToUninitialized') },
      cancelTransferFunds: { trigger: action('cancelTransferFunds') },
      transferFunds: { trigger: async (req) => action('transferFunds')(req) },
      setupTransferFundsWithMasterKey: { trigger: async (req) => action('setupTransferFundsWithMasterKey')(req) },
      setupTransferFundsWithMnemonic: { trigger: async (req) => action('setupTransferFundsWithMnemonic')(req) },
    },
  },
});

export const GettingMnemonics = (): Node => {
  const wallet = genShelleyCip1852DummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    const baseProps = genBaseProps({
      wallet: wallet.publicDeriver,
      daedalusTransfer: {
        status: TransferStatus.GETTING_MNEMONICS,
      },
    });
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.DAEDALUS,
        selected: wallet.publicDeriver,
        ...lookup,
        DaedalusTransferPageProps: baseProps,
      }),
    );
  })();
};

export const GettingPaperMnemonics = (): Node => {
  const wallet = genShelleyCip1852DummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    const baseProps = genBaseProps({
      wallet: wallet.publicDeriver,
      daedalusTransfer: {
        status: TransferStatus.GETTING_PAPER_MNEMONICS,
      },
    });
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.DAEDALUS,
        selected: wallet.publicDeriver,
        ...lookup,
        DaedalusTransferPageProps: baseProps,
      }),
    );
  })();
};

export const GettingMasterKey = (): Node => {
  const wallet = genShelleyCip1852DummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    const baseProps = genBaseProps({
      wallet: wallet.publicDeriver,
      daedalusTransfer: {
        status: TransferStatus.GETTING_MASTER_KEY,
      },
    });
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.DAEDALUS,
        selected: wallet.publicDeriver,
        ...lookup,
        DaedalusTransferPageProps: baseProps,
      }),
    );
  })();
};

export const RestoringAddresses = (): Node => {
  const wallet = genShelleyCip1852DummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    const baseProps = genBaseProps({
      wallet: wallet.publicDeriver,
      daedalusTransfer: {
        status: TransferStatus.RESTORING_ADDRESSES,
      },
    });
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.DAEDALUS,
        selected: wallet.publicDeriver,
        ...lookup,
        DaedalusTransferPageProps: baseProps,
      }),
    );
  })();
};

export const CheckingAddresses = (): Node => {
  const wallet = genShelleyCip1852DummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    const baseProps = genBaseProps({
      wallet: wallet.publicDeriver,
      daedalusTransfer: {
        status: TransferStatus.CHECKING_ADDRESSES,
      },
    });
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.DAEDALUS,
        selected: wallet.publicDeriver,
        ...lookup,
        DaedalusTransferPageProps: baseProps,
      }),
    );
  })();
};

export const GeneratingTx = (): Node => {
  const wallet = genShelleyCip1852DummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    const baseProps = genBaseProps({
      wallet: wallet.publicDeriver,
      daedalusTransfer: {
        status: TransferStatus.GENERATING_TX,
      },
    });
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.DAEDALUS,
        selected: wallet.publicDeriver,
        ...lookup,
        DaedalusTransferPageProps: baseProps,
      }),
    );
  })();
};

export const ReadyToTransfer = (): Node => {
  const wallet = genShelleyCip1852DummyWithCache();
  const lookup = walletLookup([wallet]);

  const primaryAssetConstant = defaultAssets.filter(
    asset => asset.NetworkId === wallet.publicDeriver.getParent().getNetworkInfo().NetworkId
  )[0];
  const defaultToken = wallet.publicDeriver.getParent().getDefaultToken();

  return (() => {
    const baseProps = genBaseProps({
      wallet: wallet.publicDeriver,
      daedalusTransfer: {
        status: TransferStatus.READY_TO_TRANSFER,
        error: undefined,
        transferTx: {
          recoveredBalance: new MultiToken(
            [{
              identifier: primaryAssetConstant.Identifier,
              amount: new BigNumber(1_000_000),
              networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
            }],
            defaultToken
          ),
          fee: new MultiToken(
            [{
              identifier: primaryAssetConstant.Identifier,
              amount: new BigNumber(100_000),
              networkId: wallet.publicDeriver.getParent().getNetworkInfo().NetworkId,
            }],
            defaultToken
          ),
          id: 'b65ae37bcc560e323ea8922de6573004299b6646e69ab9fac305f62f0c94c3ab',
          encodedTx: new Uint8Array([]),
          senders: ['DdzFFzCqrhsmcx7z25PRkdbeUNqNNW4brhznpVxbm1EknAahjaCFEjYXg9KJRqkixjgGyz8D9GSX3CFDRoNrZyfJsi61N2FxCnq9yWBy'],
          receivers: ['Ae2tdPwUPEZ5PxKxoyZDgjsKgMWMpTRa4PH3sVgARSGBsWwNBH3qg7cMFsP'],
        },
        transferFundsRequest: {
          isExecuting: boolean('isExecuting', false),
        },
      },
    });
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.DAEDALUS,
        selected: wallet.publicDeriver,
        ...lookup,
        DaedalusTransferPageProps: baseProps,
      }),
    );
  })();
};

export const ErrorPage = (): Node => {
  const wallet = genShelleyCip1852DummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    const errorCases = {
      NotEnoughMoneyToSendError: new NotEnoughMoneyToSendError(),
      TransferFundsError: new TransferFundsError(),
      NoTransferTxError: new NoTransferTxError(),
      WebSocketRestoreError: new WebSocketRestoreError(),
      GenerateTransferTxError: new GenerateTransferTxError(),
    };
    const errorValue = () => select(
      'errorCases',
      errorCases,
      errorCases.NotEnoughMoneyToSendError,
    );
    const baseProps = genBaseProps({
      wallet: wallet.publicDeriver,
      daedalusTransfer: {
        status: TransferStatus.ERROR,
        error: errorValue(),
      },
    });
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.DAEDALUS,
        selected: wallet.publicDeriver,
        ...lookup,
        DaedalusTransferPageProps: baseProps,
      }),
    );
  })();
};
