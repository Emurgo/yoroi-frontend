// @flow

import BigNumber from 'bignumber.js';
import { withScreenshot } from 'storycap';
import { boolean, select, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import {
  globalKnobs,
  walletLookup,
  genDummyWithCache,
  genUnitOfAccount,
} from '../../../stories/helpers/StoryWrapper';
import { mockTransferProps, wrapTransfer, } from './Transfer.mock';
import { THEMES } from '../../themes';
import { getDefaultExplorer } from '../../domain/Explorer';
import { ROUTES } from '../../routes-config';
import YoroiTransferPage from './YoroiTransferPage';
import type { MockYoroiTransferStore } from './YoroiTransferPage';
import { TransferKind, TransferStatus, } from '../../types/TransferTypes';
import type { TransferKindType } from '../../types/TransferTypes';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import AdaApi from '../../api/ada/index';
import {
  GenerateTransferTxError,
  NotEnoughMoneyToSendError,
} from '../../api/ada/errors';
import {
  TransferFundsError,
  NoTransferTxError,
  WalletChangedError,
} from '../../stores/ada/YoroiTransferStore';

export default {
  title: `${__filename.split('.')[0]}`,
  component: YoroiTransferPage,
  decorators: [withScreenshot],
};

const genBaseProps: {|
  wallet: null | PublicDeriver<>,
  yoroiTransfer: {|
    ...InexactSubset<MockYoroiTransferStore>,
  |},
  transferKind?: TransferKindType,
  openDialog?: boolean,
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
    substores: {
      ada: {
        wallets: {
          isValidMnemonic: AdaApi.prototype.isValidMnemonic,
          isValidPaperMnemonic: AdaApi.prototype.isValidPaperMnemonic,
        },
        yoroiTransfer: {
          status: TransferStatus.UNINITIALIZED,
          error: undefined,
          transferTx: undefined,
          transferFundsRequest: Object.freeze({
            isExecuting: false,
          }),
          nextInternalAddress: (_publicDeriver) => (async () => 'Ae2tdPwUPEZ5PxKxoyZDgjsKgMWMpTRa4PH3sVgARSGBsWwNBH3qg7cMFsP'),
          recoveryPhrase: '',
          reset: action('reset'),
          ...request.yoroiTransfer,
        },
      },
    },
  },
  actions: {
    router: {
      goToRoute: { trigger: action('goToRoute') },
    },
    ada: {
      yoroiTransfer: {
        backToUninitialized: { trigger: action('backToUninitialized') },
        cancelTransferFunds: { trigger: action('cancelTransferFunds') },
        startHardwareMnemnoic: { trigger: action('startHardwareMnemnoic') },
        transferFunds: { trigger: async (req) => action('transferFunds')(req) },
        checkAddresses: { trigger: async (req) => action('checkAddresses')(req) },
        setupTransferFundsWithPaperMnemonic: { trigger: action('setupTransferFundsWithPaperMnemonic') },
        setupTransferFundsWithMnemonic: { trigger: action('setupTransferFundsWithMnemonic') },
        startTransferLegacyHardwareFunds: { trigger: action('startTransferLegacyHardwareFunds') },
        startTransferFunds: { trigger: action('startTransferFunds') },
        startTransferPaperFunds: { trigger: action('startTransferPaperFunds') },
      },
    },
  },
  YoroiPlateProps: {
    generated: {
      stores: {
        profile: {
          selectedExplorer: getDefaultExplorer(),
        },
        uiNotifications: {
          isOpen: (_request) => request.openDialog === true,
          getTooltipActiveNotification: () => null,
        },
        substores: {
          ada: {
            yoroiTransfer: {
              transferKind: request.transferKind == null
                ? TransferKind.NORMAL
                : request.transferKind,
              recoveryPhrase: request.yoroiTransfer.recoveryPhrase == null
                ? ''
                : request.yoroiTransfer.recoveryPhrase,
            },
          },
        },
      },
      actions: {
        notifications: {
          open: { trigger: action('open') },
        },
      },
    },
  },
});

export const GettingMnemonics = (): React$Node => {
  const wallet = genDummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    const baseProps = genBaseProps({
      wallet: wallet.publicDeriver,
      yoroiTransfer: {
        status: TransferStatus.GETTING_MNEMONICS,
      },
    });
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.YOROI,
        selected: wallet.publicDeriver,
        ...lookup,
        YoroiTransferPageProps: baseProps,
      }),
    );
  })();
};

export const GettingPaperMnemonics = (): React$Node => {
  const wallet = genDummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    const baseProps = genBaseProps({
      wallet: wallet.publicDeriver,
      yoroiTransfer: {
        status: TransferStatus.GETTING_PAPER_MNEMONICS,
      },
    });
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.YOROI,
        selected: wallet.publicDeriver,
        ...lookup,
        YoroiTransferPageProps: baseProps,
      }),
    );
  })();
};

export const HardwareDisclaimer = (): React$Node => {
  const wallet = genDummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    const baseProps = genBaseProps({
      wallet: wallet.publicDeriver,
      yoroiTransfer: {
        status: TransferStatus.HARDWARE_DISCLAIMER,
      },
    });
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.YOROI,
        selected: wallet.publicDeriver,
        ...lookup,
        YoroiTransferPageProps: baseProps,
      }),
    );
  })();
};

export const HardwareMnemonic = (): React$Node => {
  const wallet = genDummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    const baseProps = genBaseProps({
      wallet: wallet.publicDeriver,
      yoroiTransfer: {
        status: TransferStatus.GETTING_HARDWARE_MNEMONIC,
      },
    });
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.YOROI,
        selected: wallet.publicDeriver,
        ...lookup,
        YoroiTransferPageProps: baseProps,
      }),
    );
  })();
};

export const Checksum = (): React$Node => {
  const wallet = genDummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    const transferKindSelect = () => select(
      'transferKind',
      TransferKind,
      TransferKind.NORMAL,
    );
    const transferKind = transferKindSelect();
    const baseProps = genBaseProps({
      wallet: wallet.publicDeriver,
      openDialog: true,
      transferKind,
      yoroiTransfer: {
        status: TransferStatus.DISPLAY_CHECKSUM,
        recoveryPhrase: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon share',
      },
    });
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.YOROI,
        selected: wallet.publicDeriver,
        ...lookup,
        YoroiTransferPageProps: baseProps,
      }),
    );
  })();
};

export const RestoringAddresses = (): React$Node => {
  const wallet = genDummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    const baseProps = genBaseProps({
      wallet: wallet.publicDeriver,
      yoroiTransfer: {
        status: TransferStatus.RESTORING_ADDRESSES,
      },
    });
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.YOROI,
        selected: wallet.publicDeriver,
        ...lookup,
        YoroiTransferPageProps: baseProps,
      }),
    );
  })();
};

export const CheckingAddresses = (): React$Node => {
  const wallet = genDummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    const baseProps = genBaseProps({
      wallet: wallet.publicDeriver,
      yoroiTransfer: {
        status: TransferStatus.CHECKING_ADDRESSES,
      },
    });
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.YOROI,
        selected: wallet.publicDeriver,
        ...lookup,
        YoroiTransferPageProps: baseProps,
      }),
    );
  })();
};

export const GeneratingTx = (): React$Node => {
  const wallet = genDummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    const baseProps = genBaseProps({
      wallet: wallet.publicDeriver,
      yoroiTransfer: {
        status: TransferStatus.GENERATING_TX,
      },
    });
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.YOROI,
        selected: wallet.publicDeriver,
        ...lookup,
        YoroiTransferPageProps: baseProps,
      }),
    );
  })();
};

export const TransferTx = (): React$Node => {
  const wallet = genDummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    const errorCases = {
      NoError: 0,
      WalletChangedError: 1,
    };
    const errorValue = () => select(
      'errorCases',
      errorCases,
      errorCases.NoError,
    );
    const error = errorValue();
    const baseProps = genBaseProps({
      wallet: wallet.publicDeriver,
      yoroiTransfer: {
        status: TransferStatus.READY_TO_TRANSFER,
        error: error === errorCases.NoError
          ? undefined
          : new WalletChangedError(),
        transferTx: {
          recoveredBalance: new BigNumber(1),
          fee: new BigNumber(0.1),
          id: 'b65ae37bcc560e323ea8922de6573004299b6646e69ab9fac305f62f0c94c3ab',
          encodedTx: new Uint8Array([]),
          senders: ['Ae2tdPwUPEZE9RAm3d3zuuh22YjqDxhR1JF6G93uJsRrk51QGHzRUzLvDjL'],
          receiver: 'Ae2tdPwUPEZ5PxKxoyZDgjsKgMWMpTRa4PH3sVgARSGBsWwNBH3qg7cMFsP',
        },
        transferFundsRequest: {
          isExecuting: boolean('isExecuting', false),
        },
      },
    });
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.YOROI,
        selected: wallet.publicDeriver,
        ...lookup,
        YoroiTransferPageProps: baseProps,
      }),
    );
  })();
};

export const Error = (): React$Node => {
  const wallet = genDummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    const errorCases = {
      NotEnoughMoneyToSendError: new NotEnoughMoneyToSendError(),
      TransferFundsError: new TransferFundsError(),
      NoTransferTxError: new NoTransferTxError(),
      GenerateTransferTxError: new GenerateTransferTxError(),
    };
    const errorValue = () => select(
      'errorCases',
      errorCases,
      errorCases.NotEnoughMoneyToSendError,
    );
    const baseProps = genBaseProps({
      wallet: wallet.publicDeriver,
      yoroiTransfer: {
        status: TransferStatus.ERROR,
        error: errorValue(),
      },
    });
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.YOROI,
        selected: wallet.publicDeriver,
        ...lookup,
        YoroiTransferPageProps: baseProps,
      }),
    );
  })();
};

export const Success = (): React$Node => {
  const wallet = genDummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    const baseProps = genBaseProps({
      wallet: wallet.publicDeriver,
      yoroiTransfer: {
        status: TransferStatus.SUCCESS,
      },
    });
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.YOROI,
        selected: wallet.publicDeriver,
        ...lookup,
        YoroiTransferPageProps: baseProps,
      }),
    );
  })();
};
