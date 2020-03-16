// @flow

import React from 'react';
import BigNumber from 'bignumber.js';
import { withScreenshot } from 'storycap';
import { boolean, select, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import {
  globalKnobs,
  genDummyWithCache,
} from '../../../stories/helpers/StoryWrapper';
import { wrapTransfer } from '../../Routes';
import { mockTransferProps } from './Transfer.mock';
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
  title: `${module.id.split('.')[1]}`,
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
  return (() => {
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.YOROI
      }),
      (() => {
        const walletVal = walletValue();
        const baseProps = walletVal === walletCases.NoWallet
          ? genBaseProps({
            wallet: null,
            yoroiTransfer: Object.freeze({}),
          })
          : genBaseProps({
            wallet: wallet.publicDeriver,
            yoroiTransfer: Object.freeze({}),
          });
        return (
          <YoroiTransferPage
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
  return (() => {
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.YOROI
      }),
      (() => {
        const baseProps = genBaseProps({
          wallet: wallet.publicDeriver,
          yoroiTransfer: {
            status: TransferStatus.GETTING_MNEMONICS,
          },
        });
        return (
          <YoroiTransferPage
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
  return (() => {
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.YOROI
      }),
      (() => {
        const baseProps = genBaseProps({
          wallet: wallet.publicDeriver,
          yoroiTransfer: {
            status: TransferStatus.GETTING_PAPER_MNEMONICS,
          },
        });
        return (
          <YoroiTransferPage
            generated={{
              ...baseProps,
            }}
          />
        );
      })()
    );
  })();
};

export const HardwareDisclaimer = () => {
  const wallet = genDummyWithCache();
  return (() => {
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.YOROI
      }),
      (() => {
        const baseProps = genBaseProps({
          wallet: wallet.publicDeriver,
          yoroiTransfer: {
            status: TransferStatus.HARDWARE_DISCLAIMER,
          },
        });
        return (
          <YoroiTransferPage
            generated={{
              ...baseProps,
            }}
          />
        );
      })()
    );
  })();
};

export const HardwareMnemonic = () => {
  const wallet = genDummyWithCache();
  return (() => {
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.YOROI
      }),
      (() => {
        const baseProps = genBaseProps({
          wallet: wallet.publicDeriver,
          yoroiTransfer: {
            status: TransferStatus.GETTING_HARDWARE_MNEMONIC,
          },
        });
        return (
          <YoroiTransferPage
            generated={{
              ...baseProps,
            }}
          />
        );
      })()
    );
  })();
};

export const Checksum = () => {
  const wallet = genDummyWithCache();
  return (() => {
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.YOROI
      }),
      (() => {
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
        return (
          <YoroiTransferPage
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
  return (() => {
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.YOROI
      }),
      (() => {
        const baseProps = genBaseProps({
          wallet: wallet.publicDeriver,
          yoroiTransfer: {
            status: TransferStatus.RESTORING_ADDRESSES,
          },
        });
        return (
          <YoroiTransferPage
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
  return (() => {
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.YOROI
      }),
      (() => {
        const baseProps = genBaseProps({
          wallet: wallet.publicDeriver,
          yoroiTransfer: {
            status: TransferStatus.CHECKING_ADDRESSES,
          },
        });
        return (
          <YoroiTransferPage
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
  return (() => {
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.YOROI
      }),
      (() => {
        const baseProps = genBaseProps({
          wallet: wallet.publicDeriver,
          yoroiTransfer: {
            status: TransferStatus.GENERATING_TX,
          },
        });
        return (
          <YoroiTransferPage
            generated={{
              ...baseProps,
            }}
          />
        );
      })()
    );
  })();
};

export const TransferTx = () => {
  const wallet = genDummyWithCache();
  return (() => {
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.YOROI
      }),
      (() => {
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
        return (
          <YoroiTransferPage
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
  return (() => {
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.YOROI
      }),
      (() => {
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
        return (
          <YoroiTransferPage
            generated={{
              ...baseProps,
            }}
          />
        );
      })()
    );
  })();
};

export const Success = () => {
  const wallet = genDummyWithCache();
  return (() => {
    return wrapTransfer(
      mockTransferProps({
        currentRoute: ROUTES.TRANSFER.YOROI
      }),
      (() => {
        const baseProps = genBaseProps({
          wallet: wallet.publicDeriver,
          yoroiTransfer: {
            status: TransferStatus.SUCCESS,
          },
        });
        return (
          <YoroiTransferPage
            generated={{
              ...baseProps,
            }}
          />
        );
      })()
    );
  })();
};
