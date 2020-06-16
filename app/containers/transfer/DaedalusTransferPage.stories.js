// @flow

import BigNumber from 'bignumber.js';
import type { Node } from 'react';
import { withScreenshot } from 'storycap';
import { boolean, select, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import {
  globalKnobs,
  walletLookup,
  genDummyWithCache,
  genUnitOfAccount,
} from '../../../stories/helpers/StoryWrapper';
import { mockTransferProps, wrapTransfer } from './Transfer.mock';
import { THEMES } from '../../themes';
import { getDefaultExplorer } from '../../domain/Explorer';
import { ROUTES } from '../../routes-config';
import DaedalusTransferPage from './DaedalusTransferPage';
import type { MockDaedalusTransferStore } from './DaedalusTransferPage';
import { TransferStatus } from '../../types/TransferTypes';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  TransferFundsError,
  NoTransferTxError,
  WebSocketRestoreError,
} from '../../stores/ada/DaedalusTransferStore';
import {
  GenerateTransferTxError,
  NotEnoughMoneyToSendError,
} from '../../api/ada/errors';
import AdaApi from '../../api/ada/index';
import { RestoreMode } from '../../actions/common/wallet-restore-actions';

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
      unitOfAccount: genUnitOfAccount(),
    },
    wallets: {
      selected: request.wallet,
      activeWalletRoute: request.wallet == null ? null : '',
      refreshWalletFromRemote: async () => action('refreshWalletFromRemote')(),
    },
    coinPriceStore: {
      getCurrentPrice: (_from, _to) => 5,
    },
    walletRestore: {
      isValidMnemonic: (isValidRequest) => {
        const { mnemonic, numberOfWords } = isValidRequest;
        if (isValidRequest.mode === RestoreMode.REGULAR) {
          return AdaApi.isValidMnemonic({ mnemonic, numberOfWords });
        }
        return AdaApi.prototype.isValidPaperMnemonic({ mnemonic, numberOfWords });
      },
    },
    substores: {
      ada: {
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
      },
    },
  },
});

export const GettingMnemonics = (): Node => {
  const wallet = genDummyWithCache();
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
  const wallet = genDummyWithCache();
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
  const wallet = genDummyWithCache();
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
  const wallet = genDummyWithCache();
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
  const wallet = genDummyWithCache();
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
  const wallet = genDummyWithCache();
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
  const wallet = genDummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
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

export const Error = (): Node => {
  const wallet = genDummyWithCache();
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
