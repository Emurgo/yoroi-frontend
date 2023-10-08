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
  genWithdrawalTx,
} from '../../../stories/helpers/cardano/ShelleyCip1852Mocks';
import { mockTransferProps, wrapTransfer, } from './Transfer.mock';
import { THEMES } from '../../styles/utils';
import { defaultToSelectedExplorer } from '../../domain/SelectedExplorer';
import { ROUTES } from '../../routes-config';
import YoroiTransferPage from './YoroiTransferPage';
import { TransferStatus, } from '../../types/TransferTypes';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  GenerateTransferTxError,
  NotEnoughMoneyToSendError,
} from '../../api/common/errors';
import {
  TransferFundsError,
  NoTransferTxError,
  WalletChangedError,
} from '../../stores/toplevel/YoroiTransferStore';
import AdaApi from '../../api/ada/index';
import {
  HARD_DERIVATION_START,
  ChainDerivations,
} from '../../config/numbersConfig';
import type { RestoreModeType } from '../../actions/common/wallet-restore-actions';
import config from '../../config';
import type { TransferStatusT, TransferTx } from '../../types/TransferTypes';
import LocalizableError from '../../i18n/LocalizableError';
import type { IAddressTypeStore, IAddressTypeUiSubset } from '../../stores/stateless/addressStores';
import { allAddressSubgroups } from '../../stores/stateless/addressStores';
import type {
  Address, Addressing
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { defaultAssets, } from '../../api/ada/lib/storage/database/prepackaged/networks';
import {
  MultiToken,
} from '../../api/common/lib/MultiToken';
import { mockFromDefaults, getDefaultEntryTokenInfo, } from '../../stores/toplevel/TokenInfoStore';

export default {
  title: `${__filename.split('.')[0]}`,
  component: YoroiTransferPage,
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
  sendMoneyRequest?: *,
  withdrawalProps?: *,
  yoroiTransfer: {|
    ...InexactSubset<{|
      +status: TransferStatusT,
      +error: ?LocalizableError,
      +transferTx: ?TransferTx,
      +nextInternalAddress: (
        PublicDeriver<>
       ) => (void => Promise<{| ...Address, ...InexactSubset<Addressing> |}>),
      +recoveryPhrase: string,
    |}>,
  |},
  mode?: RestoreModeType,
  openDialog?: boolean,
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
    walletRestore: {
      selectedAccount: 0 + HARD_DERIVATION_START,
      isValidMnemonic: (isValidRequest) => {
        const { mnemonic, mode } = isValidRequest;
        if (!mode.length) {
          throw new Error(`${nameof(YoroiTransferPage)}::story no length in mode`);
        }
        if (isValidRequest.mode.extra === 'paper') {
          return AdaApi.prototype.isValidPaperMnemonic({ mnemonic, numberOfWords: mode.length  });
        }
        return AdaApi.isValidMnemonic({ mnemonic, numberOfWords: mode.length  });
      },
    },
    wallets: {
      selected: request.wallet,
      refreshWalletFromRemote: async () => action('refreshWalletFromRemote')(),
      sendMoneyRequest: request.sendMoneyRequest ?? Object.freeze({
        isExecuting: false,
      })
    },
    coinPriceStore: {
      getCurrentPrice: (_from, _to) => '5',
    },
    tokenInfoStore: {
      tokenInfo: mockFromDefaults(defaultAssets),
    },
    yoroiTransfer: {
      mode: request.mode,
      status: TransferStatus.UNINITIALIZED,
      error: undefined,
      transferTx: undefined,
      nextInternalAddress: (_publicDeriver) => (async () => ({
        address: 'Ae2tdPwUPEZ5PxKxoyZDgjsKgMWMpTRa4PH3sVgARSGBsWwNBH3qg7cMFsP'
      })),
      recoveryPhrase: '',
      ...request.yoroiTransfer,
    },
  },
  actions: {
    router: {
      goToRoute: { trigger: action('goToRoute') },
    },
    yoroiTransfer: {
      backToUninitialized: { trigger: action('backToUninitialized') },
      cancelTransferFunds: { trigger: action('cancelTransferFunds') },
      startHardwareMnemonic: { trigger: action('startHardwareMnemonic') },
      setPrivateKey: { trigger: action('setPrivateKey') },
      transferFunds: { trigger: async (req) => action('transferFunds')(req) },
      checkAddresses: { trigger: async (req) => action('checkAddresses')(req) },
      setupTransferFundsWithPaperMnemonic: { trigger: action('setupTransferFundsWithPaperMnemonic') },
      setupTransferFundsWithMnemonic: { trigger: action('setupTransferFundsWithMnemonic') },
    },
  },
  WithdrawalTxDialogContainerProps: {
    generated: {
      TransferSendProps: {
        generated: {
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
              sendMoneyRequest: {
                ...(request.sendMoneyRequest ?? Object.freeze({
                  isExecuting: false,
                })),
                error: undefined,
                reset: action('sendMoneyRequest reset'),
              },
            },
            coinPriceStore: {
              getCurrentPrice: (_from, _to) => '5',
            },
            tokenInfoStore: {
              tokenInfo: mockFromDefaults(defaultAssets),
            },
          },
          actions: {
            wallets: {
              sendMoney: {
                trigger: async (req) => action('sendMoney')(req),
              },
            },
            ada: {
              trezorSend: {
                sendUsingTrezor: {
                  trigger: async (req) => action('sendUsingTrezor')(req),
                },
                cancel: { trigger: () => {} },
              },
              ledgerSend: {
                sendUsingLedgerWallet: {
                  trigger: async (req) => action('sendUsingLedgerWallet')(req),
                },
                cancel: { trigger: () => {} },
              },
            },
          },
        },
      },
      ...(request.withdrawalProps ?? ({}: any)),
    },
  },
  YoroiPlateProps: {
    generated: {
      stores: {
        explorers: {
          selectedExplorer: defaultToSelectedExplorer(),
        },
        profile: {
          selectedNetwork: request.wallet == null
            ? undefined
            : request.wallet.getParent().getNetworkInfo()
        },
        uiNotifications: {
          isOpen: (_request) => request.openDialog === true,
          getTooltipActiveNotification: () => null,
        },
        yoroiTransfer: {
          mode: request.mode,
          recoveryPhrase: request.yoroiTransfer.recoveryPhrase == null
            ? ''
            : request.yoroiTransfer.recoveryPhrase,
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

export const GettingMnemonics = (): Node => {
  const wallet = genShelleyCip1852DummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    const baseProps = genBaseProps({
      wallet: wallet.publicDeriver,
      yoroiTransfer: {
        status: TransferStatus.GETTING_MNEMONICS,
      },
      mode: { type: 'bip44', extra: undefined, length: config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT },
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

export const GettingPaperMnemonics = (): Node => {
  const wallet = genShelleyCip1852DummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    const baseProps = genBaseProps({
      wallet: wallet.publicDeriver,
      yoroiTransfer: {
        status: TransferStatus.GETTING_PAPER_MNEMONICS,
      },
      mode: { type: 'bip44', extra: 'paper', length: config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT },
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

export const HardwareDisclaimer = (): Node => {
  const wallet = genShelleyCip1852DummyWithCache();
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

export const HardwareMnemonic = (): Node => {
  const wallet = genShelleyCip1852DummyWithCache();
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

export const Checksum = (): Node => {
  const wallet = genShelleyCip1852DummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    const modeOptions: {| [key: string]: RestoreModeType |} = {
      BYRON: { type: 'bip44', extra: undefined, length: 15 },
      SHELLEY15: { type: 'cip1852', extra: undefined, length: 15 },
      SHELLEY24: { type: 'cip1852', extra: undefined, length: 24 },
      PAPER: { type: 'bip44', extra: 'paper', length: config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT },
      TREZOR: { type: 'bip44', extra: 'trezor', },
    };
    const modeSelect = () => select(
      'mode',
      modeOptions,
      modeOptions.BYRON,
    );
    const mode = modeSelect();
    const baseProps = genBaseProps({
      wallet: wallet.publicDeriver,
      openDialog: true,
      mode,
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

export const RestoringAddresses = (): Node => {
  const wallet = genShelleyCip1852DummyWithCache();
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

export const CheckingAddresses = (): Node => {
  const wallet = genShelleyCip1852DummyWithCache();
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

export const GeneratingTx = (): Node => {
  const wallet = genShelleyCip1852DummyWithCache();
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

export const TransferTxPage = (): Node => {
  const wallet = genShelleyCip1852DummyWithCache();
  const lookup = walletLookup([wallet]);

  const primaryAssetConstant = defaultAssets.filter(
    asset => asset.NetworkId === wallet.publicDeriver.getParent().getNetworkInfo().NetworkId
  )[0];
  const defaultToken = wallet.publicDeriver.getParent().getDefaultToken();

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
      mode: { type: 'bip44', extra: undefined, length: config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT },
      wallet: wallet.publicDeriver,
      sendMoneyRequest: {
        isExecuting: boolean('isExecuting', false)
      },
      yoroiTransfer: {
        status: TransferStatus.READY_TO_TRANSFER,
        error: error === errorCases.NoError
          ? undefined
          : new WalletChangedError(),
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
          senders: ['Ae2tdPwUPEZE9RAm3d3zuuh22YjqDxhR1JF6G93uJsRrk51QGHzRUzLvDjL'],
          receivers: ['Ae2tdPwUPEZ5PxKxoyZDgjsKgMWMpTRa4PH3sVgARSGBsWwNBH3qg7cMFsP'],
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

export const WithdrawalKeyInput = (): Node => {
  const wallet = genShelleyCip1852DummyWithCache();
  const lookup = walletLookup([wallet]);
  return (() => {
    const baseProps = genBaseProps({
      wallet: wallet.publicDeriver,
      yoroiTransfer: {
        status: TransferStatus.GETTING_WITHDRAWAL_KEY,
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


export const WithdrawalTxPage = (): Node => {
  const wallet = genShelleyCip1852DummyWithCache();
  const lookup = walletLookup([wallet]);

  const primaryAssetConstant = defaultAssets.filter(
    asset => asset.NetworkId === wallet.publicDeriver.getParent().getNetworkInfo().NetworkId
  )[0];
  const defaultToken = wallet.publicDeriver.getParent().getDefaultToken();

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
      withdrawalProps: {
        actions: Object.freeze({}),
        stores: {
          profile: {
            selectedNetwork: wallet.publicDeriver.getParent().getNetworkInfo()
          },
          tokenInfoStore: {
            getDefaultTokenInfo: networkId => getDefaultEntryTokenInfo(
              networkId,
              mockFromDefaults(defaultAssets)
            ),
          },
          substores: {
            ada: {
              delegationTransaction: {
                createWithdrawalTx: {
                  error: undefined,
                  result: genWithdrawalTx(
                    wallet.publicDeriver,
                    boolean('deregister', true)
                  ),
                  reset: action('createWithdrawalTx reset'),
                },
              },
            },
          },
        },
      },
      mode: {
        type: 'cip1852',
        extra: undefined,
        length: config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT,
        chain: ChainDerivations.CHIMERIC_ACCOUNT,
      },
      wallet: wallet.publicDeriver,
      sendMoneyRequest: {
        isExecuting: boolean('isExecuting', false)
      },
      yoroiTransfer: {
        status: TransferStatus.READY_TO_TRANSFER,
        error: error === errorCases.NoError
          ? undefined
          : new WalletChangedError(),
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
          senders: ['Ae2tdPwUPEZE9RAm3d3zuuh22YjqDxhR1JF6G93uJsRrk51QGHzRUzLvDjL'],
          receivers: ['Ae2tdPwUPEZ5PxKxoyZDgjsKgMWMpTRa4PH3sVgARSGBsWwNBH3qg7cMFsP'],
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

export const ErrorPage = (): Node => {
  const wallet = genShelleyCip1852DummyWithCache();
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

export const Success = (): Node => {
  const wallet = genShelleyCip1852DummyWithCache();
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
