// @flow

import React from 'react';
import BigNumber from 'bignumber.js';
import { withScreenshot } from 'storycap';
import { boolean, select, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import {
  globalKnobs,
  walletLookup,
  genDummyWithCache,
} from '../../../stories/helpers/StoryWrapper';
import { wrapTransfer } from '../../Routes';
import { mockTransferProps } from './LegacyTransfer.mock';
import { THEMES } from '../../themes';
import { getDefaultExplorer } from '../../domain/Explorer';
import { ROUTES } from '../../routes-config';
import DaedalusTransferPage from './DaedalusTransferPage';
import type { MockDaedalusTransferStore } from './DaedalusTransferPage';
import { TransferStatus } from '../../types/TransferTypes';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import AdaApi from '../../api/ada/index';
import {
  TransferFundsError,
  NoTransferTxError,
  WebSocketRestoreError,
} from '../../stores/ada/DaedalusTransferStore';
import {
  GenerateTransferTxError,
  NotEnoughMoneyToSendError,
} from '../../api/ada/errors';

export default {
  title: `${__filename.split('.')[0]}`,
  component: DaedalusTransferPage,
  decorators: [withScreenshot],
};

const genBaseProps: {|
  wallet: null | PublicDeriver<>,
  daedalusTransfer: InexactSubset<MockDaedalusTransferStore>,
|} => * = (request) => ({
  stores: {
    profile: {
      isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
      selectedExplorer: getDefaultExplorer(),
    },
    wallets: {
      selected: request.wallet,
      activeWalletRoute: request.wallet == null ? null : '',
      refreshWalletFromRemote: async () => action('refreshWalletFromRemote')(),
    },
    substores: {
      ada: {
        wallets: {
          isValidMnemonic: AdaApi.prototype.isValidMnemonic,
          isValidPaperMnemonic: AdaApi.prototype.isValidPaperMnemonic,
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
    },
  },
  actions: {
    router: {
      goToRoute: { trigger: action('goToRoute') },
    },
    ada: {
      daedalusTransfer: {
        backToUninitialized: { trigger: action('backToUninitialized') },
        cancelTransferFunds: { trigger: action('cancelTransferFunds') },
        transferFunds: { trigger: async (req) => action('transferFunds')(req) },
        setupTransferFundsWithMasterKey: { trigger: async (req) => action('setupTransferFundsWithMasterKey')(req) },
        setupTransferFundsWithMnemonic: { trigger: async (req) => action('setupTransferFundsWithMnemonic')(req) },
        startTransferFunds: { trigger: action('startTransferFunds') },
        startTransferPaperFunds: { trigger: action('startTransferPaperFunds') },
        startTransferMasterKey: { trigger: action('startTransferMasterKey') },
      },
    },
  },
});

export const Uninitialized = () => {
  const wallet = genDummyWithCache();
  const walletCases = {
    NoWallet: 0,
    HasWallet: 1
  };
  const walletValue = () => select(
    'walletCases',
    walletCases,
    walletCases.NoWallet,
  );
  const walletVal = walletValue();
  const lookup = walletLookup(walletVal === walletCases.NoWallet
    ? []
    : [wallet]);
  return (() => {
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.DAEDALUS,
        selected: walletVal === walletCases.NoWallet ? null : wallet.publicDeriver,
        ...lookup,
      }),
      (() => {
        const baseProps = walletVal === walletCases.NoWallet
          ? genBaseProps({
            wallet: null,
            daedalusTransfer: Object.freeze({}),
          })
          : genBaseProps({
            wallet: wallet.publicDeriver,
            daedalusTransfer: Object.freeze({}),
          });
        return (
          <DaedalusTransferPage
            generated={{
              ...baseProps,
            }}
          />
        );
      })()
    );
  })();
};


export const GettingMnemonics = () => {
  const wallet = genDummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.DAEDALUS,
        selected: wallet.publicDeriver,
        ...lookup,
      }),
      (() => {
        const baseProps = genBaseProps({
          wallet: wallet.publicDeriver,
          daedalusTransfer: {
            status: TransferStatus.GETTING_MNEMONICS,
          },
        });
        return (
          <DaedalusTransferPage
            generated={{
              ...baseProps,
            }}
          />
        );
      })()
    );
  })();
};

export const GettingPaperMnemonics = () => {
  const wallet = genDummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.DAEDALUS,
        selected: wallet.publicDeriver,
        ...lookup,
      }),
      (() => {
        const baseProps = genBaseProps({
          wallet: wallet.publicDeriver,
          daedalusTransfer: {
            status: TransferStatus.GETTING_PAPER_MNEMONICS,
          },
        });
        return (
          <DaedalusTransferPage
            generated={{
              ...baseProps,
            }}
          />
        );
      })()
    );
  })();
};

export const GettingMasterKey = () => {
  const wallet = genDummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.DAEDALUS,
        selected: wallet.publicDeriver,
        ...lookup,
      }),
      (() => {
        const baseProps = genBaseProps({
          wallet: wallet.publicDeriver,
          daedalusTransfer: {
            status: TransferStatus.GETTING_MASTER_KEY,
          },
        });
        return (
          <DaedalusTransferPage
            generated={{
              ...baseProps,
            }}
          />
        );
      })()
    );
  })();
};

export const RestoringAddresses = () => {
  const wallet = genDummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.DAEDALUS,
        selected: wallet.publicDeriver,
        ...lookup,
      }),
      (() => {
        const baseProps = genBaseProps({
          wallet: wallet.publicDeriver,
          daedalusTransfer: {
            status: TransferStatus.RESTORING_ADDRESSES,
          },
        });
        return (
          <DaedalusTransferPage
            generated={{
              ...baseProps,
            }}
          />
        );
      })()
    );
  })();
};

export const CheckingAddresses = () => {
  const wallet = genDummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.DAEDALUS,
        selected: wallet.publicDeriver,
        ...lookup,
      }),
      (() => {
        const baseProps = genBaseProps({
          wallet: wallet.publicDeriver,
          daedalusTransfer: {
            status: TransferStatus.CHECKING_ADDRESSES,
          },
        });
        return (
          <DaedalusTransferPage
            generated={{
              ...baseProps,
            }}
          />
        );
      })()
    );
  })();
};

export const GeneratingTx = () => {
  const wallet = genDummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.DAEDALUS,
        selected: wallet.publicDeriver,
        ...lookup,
      }),
      (() => {
        const baseProps = genBaseProps({
          wallet: wallet.publicDeriver,
          daedalusTransfer: {
            status: TransferStatus.GENERATING_TX,
          },
        });
        return (
          <DaedalusTransferPage
            generated={{
              ...baseProps,
            }}
          />
        );
      })()
    );
  })();
};

export const ReadyToTransfer = () => {
  const wallet = genDummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.DAEDALUS,
        selected: wallet.publicDeriver,
        ...lookup,
      }),
      (() => {
        const baseProps = genBaseProps({
          wallet: wallet.publicDeriver,
          daedalusTransfer: {
            status: TransferStatus.READY_TO_TRANSFER,
            error: undefined,
            transferTx: {
              recoveredBalance: new BigNumber(1),
              fee: new BigNumber(0.1),
              id: 'b65ae37bcc560e323ea8922de6573004299b6646e69ab9fac305f62f0c94c3ab',
              encodedTx: new Uint8Array([]),
              senders: ['DdzFFzCqrhsmcx7z25PRkdbeUNqNNW4brhznpVxbm1EknAahjaCFEjYXg9KJRqkixjgGyz8D9GSX3CFDRoNrZyfJsi61N2FxCnq9yWBy'],
              receiver: 'Ae2tdPwUPEZ5PxKxoyZDgjsKgMWMpTRa4PH3sVgARSGBsWwNBH3qg7cMFsP',
            },
            transferFundsRequest: {
              isExecuting: boolean('isExecuting', false),
            },
          },
        });
        return (
          <DaedalusTransferPage
            generated={{
              ...baseProps,
            }}
          />
        );
      })()
    );
  })();
};

export const Error = () => {
  const wallet = genDummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.DAEDALUS,
        selected: wallet.publicDeriver,
        ...lookup,
      }),
      (() => {
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
        return (
          <DaedalusTransferPage
            generated={{
              ...baseProps,
            }}
          />
        );
      })()
    );
  })();
};
