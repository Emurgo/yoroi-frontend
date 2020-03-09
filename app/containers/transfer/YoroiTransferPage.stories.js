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
          transferFundsRequest: {
            isExecuting: false,
          },
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
        transferFunds: { trigger: async () => action('transferFunds')() },
        checkAddresses: { trigger: async () => action('checkAddresses')() },
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
          isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
          selectedExplorer: getDefaultExplorer(),
        },
        uiNotifications: {
          isOpen: (_request) => false,
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
              generatePlates: () => ({
                byronPlate: undefined,
                shelleyPlate: undefined,
              }),
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
        const baseProps = genBaseProps({
          wallet: wallet.publicDeriver,
          yoroiTransfer: {
            status: TransferStatus.DISPLAY_CHECKSUM,
            recoveryPhrase: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon share',
          },
        });
        return (
          <YoroiTransferPage
            generated={{
              ...baseProps,
              // transferKind: 
            }}
          />
        );
      })()
    );
  })();
};
