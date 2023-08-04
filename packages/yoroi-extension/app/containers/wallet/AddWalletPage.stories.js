// @flow

import type { Node } from 'react';
import BigNumber from 'bignumber.js';

import { select, boolean } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { TransferStatus } from '../../types/TransferTypes';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import AddWalletPage from './AddWalletPage';
import {
  globalKnobs,
  getWalletNameCases,
  getMnemonicCases,
  getPasswordCreationCases,
  getPasswordValidationCases,
  trezorErrorCases,
  ledgerErrorCases,
  genUnitOfAccount,
  getValidationMnemonicCases,
  mockLedgerMeta,
} from '../../../stories/helpers/StoryWrapper';
import { THEMES } from '../../styles/utils';
import AdaApi from '../../api/ada/index';
import { NoInputsError, GenericApiError } from '../../api/common/errors';
import { withScreenshot } from 'storycap';
import { defaultToSelectedExplorer } from '../../domain/SelectedExplorer';
import { StepState } from '../../components/widgets/ProgressSteps';
import { ProgressStep } from '../../types/HWConnectStoreTypes';
import { RestoreSteps, generatePlates } from '../../stores/toplevel/WalletRestoreStore';
import WalletCreateDialog from '../../components/wallet/WalletCreateDialog';
import WalletBackupDialog from '../../components/wallet/WalletBackupDialog';
import WalletRestoreDialog from '../../components/wallet/WalletRestoreDialog';
import WalletRestoreOptionDialog from '../../components/wallet/add/option-dialog/WalletRestoreOptionDialog';
import WalletConnectHWOptionDialog from '../../components/wallet/add/option-dialog/WalletConnectHWOptionDialog';
import WalletTrezorConnectDialogContainer from './dialogs/WalletTrezorConnectDialogContainer';
import WalletLedgerConnectDialogContainer from './dialogs/WalletLedgerConnectDialogContainer';
import { getPaperWalletIntro } from '../../stores/toplevel/ProfileStore';
import WalletPaperDialog from '../../components/wallet/WalletPaperDialog';
import UserPasswordDialog from '../../components/wallet/add/paper-wallets/UserPasswordDialog';
import { ProgressStep as PaperWalletProgressStep } from '../../stores/ada/PaperWalletCreateStore';
import { PdfGenSteps } from '../../api/ada/paperWallet/paperWalletPdf';
import { ROUTES } from '../../routes-config';
import {
  defaultAssets,
  networks
} from '../../api/ada/lib/storage/database/prepackaged/networks';
import type { RestoreModeType } from '../../actions/common/wallet-restore-actions';
import config from '../../config';
import {
  genShelleyCIP1852SigningWalletWithCache,
  genTentativeShelleyTx,
} from '../../../stories/helpers/cardano/ShelleyCip1852Mocks';
import { allAddressSubgroups } from '../../stores/stateless/addressStores';
import type { IAddressTypeStore, IAddressTypeUiSubset } from '../../stores/stateless/addressStores';
import { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import { MultiToken } from '../../api/common/lib/MultiToken';
import { mockDefaultToken, mockFromDefaults } from '../../stores/toplevel/TokenInfoStore';
import { walletLookup } from '../../../stories/helpers/WalletCache';

export default {
  title: `${__filename.split('.')[0]}`,
  component: AddWalletPage,
  decorators: [withScreenshot],
};

const defaultProps: ({|
  openDialog?: Object,
  getParam?: <T>(number | string) => T,
  selectedNetwork: *,
  WalletCreateDialogContainerProps?: *,
  WalletPaperDialogContainerProps?: *,
  CreatePaperWalletDialogContainerProps?: *,
  WalletBackupDialogContainerProps?: *,
  WalletRestoreDialogContainerProps?: *,
  WalletTrezorConnectDialogContainerProps?: *,
  WalletLedgerConnectDialogContainerProps?: *,
  UpgradeTxDialogContainerProps?: *,
|}) => * = request => ({
  stores: {
    profile: {
      selectedNetwork: request.selectedNetwork,
    },
    uiDialogs: {
      hasOpen: request.openDialog != null,
      isOpen: clazz => clazz === request.openDialog,
      getParam: request.getParam || (() => (undefined: any)),
    },
    wallets: {
      hasAnyWallets: boolean('hasAnyWallets', false),
    },
  },
  actions: {
    router: {
      goToRoute: {
        trigger: action('goToRoute'),
      },
    },
    dialogs: {
      closeActiveDialog: {
        trigger: action('closeActiveDialog'),
      },
      open: {
        trigger: action('open'),
      },
      push: {
        trigger: action('push'),
      },
      pop: {
        trigger: action('pop'),
      },
    },
    profile: {
      setSelectedNetwork: {
        trigger: action('setSelectedNetwork'),
      },
    },
    wallets: {
      unselectWallet: {
        trigger: action('unselectWallet'),
      },
    },
    ada: {
      trezorConnect: {
        init: {
          trigger: action('trezorConnect init'),
        },
      },
      ledgerConnect: {
        init: {
          trigger: action('ledgerConnect init'),
        },
      },
    },
  },
  SidebarContainerProps: {
    generated: {
      stores: {
        profile: {
          isSidebarExpanded: false,
        },
        wallets: {
          hasAnyWallets: boolean('hasAnyWallets', false),
          selected: null,
        },
        app: { currentRoute: ROUTES.WALLETS.ADD },
        delegation: {
          getDelegationRequests: () => undefined,
        },
      },
      actions: {
        profile: {
          toggleSidebar: { trigger: async req => action('toggleSidebar')(req) },
        },
        router: {
          goToRoute: { trigger: action('goToRoute') },
        },
      },
    },
  },
  WalletCreateDialogContainerProps: request.WalletCreateDialogContainerProps || (null: any),
  WalletPaperDialogContainerProps: request.WalletPaperDialogContainerProps || (null: any),
  CreatePaperWalletDialogContainerProps:
    request.CreatePaperWalletDialogContainerProps || (null: any),
  WalletBackupDialogContainerProps: request.WalletBackupDialogContainerProps || (null: any),
  WalletRestoreDialogContainerProps: request.WalletRestoreDialogContainerProps || (null: any),
  WalletTrezorConnectDialogContainerProps:
    request.WalletTrezorConnectDialogContainerProps || (null: any),
  WalletLedgerConnectDialogContainerProps:
    request.WalletLedgerConnectDialogContainerProps || (null: any),
  BannerContainerProps: {
    generated: {
      stores: {
        serverConnectionStore: {
          checkAdaServerStatus: select(
            'checkAdaServerStatus',
            ServerStatusErrors,
            ServerStatusErrors.Healthy
          ),
          serverTime: undefined,
        },
        tokenInfoStore: {
          tokenInfo: mockFromDefaults(defaultAssets),
        },
        wallets: {
          selected: null,
        },
      },
      actions: Object.freeze({}),
    },
  },
});

export const MainPage = (): Node => (
  <AddWalletPage
    generated={defaultProps(
      Object.freeze({
        selectedNetwork: networks.CardanoMainnet,
      })
    )}
  />
);

export const CurrencySelect = (): Node => (
  <AddWalletPage
    generated={defaultProps(
      Object.freeze({
        openDialog: WalletCreateDialog,
        selectedNetwork: undefined,
        WalletCreateDialogContainerProps: {
          generated: {
            stores: {
              profile: {
                isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
              },
            },
            actions: {
              ada: {
                wallets: {
                  startWalletCreation: {
                    trigger: async req => action('startWalletCreation')(req),
                  },
                },
              },
            },
          },
        },
      })
    )}
  />
);

export const CreateWalletStart = (): Node => (
  <AddWalletPage
    generated={defaultProps(
      Object.freeze({
        selectedNetwork: networks.CardanoMainnet,
        openDialog: WalletCreateDialog,
        WalletCreateDialogContainerProps: {
          generated: {
            stores: {
              profile: {
                isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
              },
            },
            actions: {
              ada: {
                wallets: {
                  startWalletCreation: {
                    trigger: async req => action('startWalletCreation')(req),
                  },
                },
              },
            },
          },
        },
      })
    )}
  />
);

const creationRecoveryPhrase = 'horse horse wash ten deny mix fuel dinner mutual lesson possible soda hurdle march advice'.split(
  ' '
);

const walletBackupProps: ({|
  walletBackup: *,
  isExecuting?: boolean,
|}) => * = request => ({
  stores: {
    profile: {
      isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
    },
    walletBackup: {
      recoveryPhraseWords: creationRecoveryPhrase.map(word => ({ word })),
      ...request.walletBackup,
    },
    wallets: {
      createWalletRequest: {
        isExecuting: request.isExecuting || false,
      },
    },
  },
  actions: {
    walletBackup: {
      cancelWalletBackup: { trigger: action('cancelWalletBackup') },
      startWalletBackup: { trigger: action('startWalletBackup') },
      addWordToWalletBackupVerification: { trigger: action('addWordToWalletBackupVerification') },
      clearEnteredRecoveryPhrase: { trigger: action('clearEnteredRecoveryPhrase') },
      acceptWalletBackupTermDevice: { trigger: action('acceptWalletBackupTermDevice') },
      acceptWalletBackupTermRecovery: { trigger: action('acceptWalletBackupTermRecovery') },
      restartWalletBackup: { trigger: action('restartWalletBackup') },
      finishWalletBackup: { trigger: async req => action('finishWalletBackup')(req) },
      removeOneMnemonicWord: { trigger: action('removeOneMnemonicWord') },
      continueToPrivacyWarning: { trigger: action('continueToPrivacyWarning') },
      togglePrivacyNoticeForWalletBackup: { trigger: action('togglePrivacyNoticeForWalletBackup') },
      continueToRecoveryPhraseForWalletBackup: {
        trigger: action('continueToRecoveryPhraseForWalletBackup'),
      },
    },
  },
});

export const CreateWalletPrivacyDialog = (): Node => {
  const countdownCases = Object.freeze({
    CountingDown: 10,
    Elapsed: 0,
  });
  const countdownValue = () =>
    select('countdownCases', countdownCases, countdownCases.CountingDown);
  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          selectedNetwork: networks.CardanoMainnet,
          openDialog: WalletBackupDialog,
          WalletBackupDialogContainerProps: {
            generated: walletBackupProps({
              walletBackup: {
                currentStep: 'privacyWarning',
                enteredPhrase: [],
                isRecoveryPhraseValid: false,
                countdownRemaining: countdownValue(),
                recoveryPhraseSorted: [],
                isTermDeviceAccepted: false,
                isTermRecoveryAccepted: false,
                isPrivacyNoticeAccepted: boolean('isPrivacyNoticeAccepted', false),
              },
            }),
          },
        })
      )}
    />
  );
};

export const CreateWalletRecoveryPhraseDisplay = (): Node => {
  const countdownCases = Object.freeze({
    CountingDown: 10,
    Elapsed: 0,
  });
  const countdownValue = () =>
    select('countdownCases', countdownCases, countdownCases.CountingDown);
  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          selectedNetwork: networks.CardanoMainnet,
          openDialog: WalletBackupDialog,
          WalletBackupDialogContainerProps: {
            generated: walletBackupProps({
              walletBackup: {
                currentStep: 'recoveryPhraseDisplay',
                enteredPhrase: [],
                isRecoveryPhraseValid: false,
                countdownRemaining: countdownValue(),
                recoveryPhraseSorted: [],
                isTermDeviceAccepted: false,
                isTermRecoveryAccepted: false,
                isPrivacyNoticeAccepted: false,
              },
            }),
          },
        })
      )}
    />
  );
};

export const CreateWalletRecoveryPhraseEnter = (): Node => {
  const entryCases = Object.freeze({
    None: 0,
    Single: 1,
    All: 2,
  });
  const getEntryValue = () => select('entryCases', entryCases, entryCases.None);
  const recoveryPhraseSorted = (() => {
    const entryValue = getEntryValue();
    const base = creationRecoveryPhrase.map(word => ({
      word,
      isActive: !(entryValue === entryCases.All),
    }));
    if (entryValue === entryCases.Single) {
      base[0].isActive = false;
    }
    return base;
  })();
  const enteredPhrase = (() => {
    const entryValue = getEntryValue();
    if (entryValue === entryCases.None) {
      return [];
    }
    if (entryValue === entryCases.Single) {
      return [
        {
          word: creationRecoveryPhrase[0],
          index: 0,
        },
      ];
    }
    if (entryValue === entryCases.All) {
      return creationRecoveryPhrase.map((word, i) => ({
        word,
        index: i,
      }));
    }
    throw new Error('missing case enteredPhrase');
  })();
  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          selectedNetwork: networks.CardanoMainnet,
          openDialog: WalletBackupDialog,
          WalletBackupDialogContainerProps: {
            generated: walletBackupProps({
              walletBackup: {
                currentStep: 'recoveryPhraseEntry',
                enteredPhrase,
                isRecoveryPhraseValid: false,
                countdownRemaining: 0,
                recoveryPhraseSorted,
                isTermDeviceAccepted: false,
                isTermRecoveryAccepted: false,
                isPrivacyNoticeAccepted: false,
              },
            }),
          },
        })
      )}
    />
  );
};

export const CreateWalletFinalConfirm = (): Node => {
  const isTermDeviceAccepted = boolean('isTermDeviceAccepted', false);
  const isTermRecoveryAccepted = boolean('isTermRecoveryAccepted', false);
  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          selectedNetwork: networks.CardanoMainnet,
          openDialog: WalletBackupDialog,
          WalletBackupDialogContainerProps: {
            generated: walletBackupProps({
              isExecuting:
                isTermDeviceAccepted && isTermRecoveryAccepted && boolean('isExecuting', false),
              walletBackup: {
                currentStep: 'recoveryPhraseEntry',
                enteredPhrase: [],
                isRecoveryPhraseValid: true,
                countdownRemaining: 0,
                recoveryPhraseSorted: [],
                isTermDeviceAccepted,
                isTermRecoveryAccepted,
                isPrivacyNoticeAccepted: false,
              },
            }),
          },
        })
      )}
    />
  );
};

const restoreWalletProps: ({|
  step: *,
  selectedNetwork: *,
  lookup: *,
  walletRestoreMeta?: *,
  recoveryResult?: *,
  restoreRequest?: *,
  yoroiTransferStep?: *,
  yoroiTransferError?: *,
|}) => * = request => ({
  stores: {
    explorers: {
      selectedExplorer: defaultToSelectedExplorer(),
    },
    profile: {
      selectedNetwork: request.selectedNetwork,
      isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
      unitOfAccount: genUnitOfAccount(),
      shouldHideBalance: false,
    },
    delegation: {
      getDelegationRequests: () => {},
    },
    walletSettings: {
      getConceptualWalletSettingsCache: request.lookup.getConceptualWalletSettingsCache,
    },
    uiNotifications: {
      isOpen: () => false,
      getTooltipActiveNotification: () => null,
    },
    wallets: {
      sendMoneyRequest: {
        isExecuting:
          request.yoroiTransferStep === TransferStatus.READY_TO_TRANSFER
            ? boolean('isExecuting', false)
            : false,
      },
      getPublicKeyCache: request.lookup.getPublicKeyCache,
      restoreRequest: request.restoreRequest || {
        isExecuting: false,
        error: undefined,
        reset: action('reset'),
      },
    },
    tokenInfoStore: {
      tokenInfo: mockFromDefaults(defaultAssets),
    },
    coinPriceStore: {
      getCurrentPrice: (_from, _to) => '5',
    },
    walletRestore: {
      step: request.step,
      walletRestoreMeta: request.walletRestoreMeta,
      recoveryResult: request.recoveryResult,
      isValidMnemonic: isValidRequest => {
        const { mnemonic, mode } = isValidRequest;
        if (!mode.length) {
          throw new Error(`${nameof(AddWalletPage)}::story no length in mode`);
        }
        if (isValidRequest.mode.extra === 'paper') {
          return AdaApi.prototype.isValidPaperMnemonic({ mnemonic, numberOfWords: mode.length });
        }
        return AdaApi.isValidMnemonic({ mnemonic, numberOfWords: mode.length });
      },
      duplicatedWallet: null,
    },
    transactions: {
      getTxRequests: request.lookup.getTransactions,
    },
    yoroiTransfer: {
      status: request.yoroiTransferStep || TransferStatus.UNINITIALIZED,
      error: request.yoroiTransferError,
      transferTx: {
        encodedTx: new Uint8Array([]),
        fee: new MultiToken(
          [
            {
              identifier: defaultAssets.filter(
                asset => asset.NetworkId === request.selectedNetwork.NetworkId
              )[0].Identifier,
              amount: new BigNumber(1_000_000),
              networkId: request.selectedNetwork.NetworkId,
            },
          ],
          mockDefaultToken(request.selectedNetwork.NetworkId)
        ),
        id: 'b65ae37bcc560e323ea8922de6573004299b6646e69ab9fac305f62f0c94c3ab',
        receivers: ['Ae2tdPwUPEZ5PxKxoyZDgjsKgMWMpTRa4PH3sVgARSGBsWwNBH3qg7cMFsP'],
        recoveredBalance: new MultiToken(
          [
            {
              identifier: defaultAssets.filter(
                asset => asset.NetworkId === request.selectedNetwork.NetworkId
              )[0].Identifier,
              amount: new BigNumber(1000_000_000),
              networkId: request.selectedNetwork.NetworkId,
            },
          ],
          mockDefaultToken(request.selectedNetwork.NetworkId)
        ),
        senders: ['Ae2tdPwUPEZE9RAm3d3zuuh22YjqDxhR1JF6G93uJsRrk51QGHzRUzLvDjL'],
      },
    },
  },
  actions: {
    notifications: {
      open: {
        trigger: action('open'),
      },
    },
    wallets: {
      setActiveWallet: { trigger: action('setActiveWallet') },
    },
    router: {
      goToRoute: { trigger: action('goToRoute') },
    },
    profile: {
      updateHideBalance: { trigger: async req => action('updateHideBalance')(req) },
    },
    walletRestore: {
      reset: {
        trigger: action('reset'),
      },
      setMode: {
        trigger: action('setMode'),
      },
      back: {
        trigger: action('back'),
      },
      verifyMnemonic: {
        trigger: async req => action('verifyMnemonic')(req),
      },
      startRestore: {
        trigger: async req => action('startRestore')(req),
      },
      startCheck: {
        trigger: async req => action('startCheck')(req),
      },
      submitFields: {
        trigger: async req => action('submitFields')(req),
      },
    },
    ada: {
      walletRestore: {
        transferFromLegacy: {
          trigger: async req => action('transferFromLegacy')(req),
        },
      },
    },
  },
});

export const CardanoRestoreOptions = (): Node => {
  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          selectedNetwork: networks.CardanoMainnet,
          openDialog: WalletRestoreOptionDialog,
        })
      )}
    />
  );
};

export const ErgoRestoreOptions = (): Node => {
  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          selectedNetwork: networks.ErgoMainnet,
          openDialog: WalletRestoreOptionDialog,
        })
      )}
    />
  );
};

export const RestoreWalletStart = (): Node => {
  const modeOptions: {| [key: string]: RestoreModeType |} = {
    SHELLEY15: { type: 'cip1852', extra: undefined, length: 15 },
    PAPER: {
      type: 'bip44',
      extra: 'paper',
      length: config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT,
    },
  };
  const getRestoreMode = () => select('restoreMode', modeOptions, modeOptions.SHELLEY15);
  const nameCases = getWalletNameCases();
  const password = getPasswordCreationCases();
  const paperPassword = getPasswordValidationCases('paper_password');

  const selectedNetwork = networks.CardanoMainnet;
  const lookup = walletLookup([]);
  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          selectedNetwork,
          openDialog: WalletRestoreDialog,
          getParam: <T>() => getRestoreMode(), // eslint-disable-line no-unused-vars
          WalletRestoreDialogContainerProps: {
            generated: restoreWalletProps({
              selectedNetwork,
              lookup,
              step: RestoreSteps.START,
              walletRestoreMeta: {
                recoveryPhrase: (() => {
                  const restoreMode = getRestoreMode();
                  if (restoreMode.extra === undefined && restoreMode.length) {
                    const cases = getMnemonicCases(restoreMode.length);
                    return select('regularRecoveryPhrase', cases, cases.Empty);
                  }
                  if (restoreMode.extra === 'paper' && restoreMode.length) {
                    const cases = getMnemonicCases(restoreMode.length);
                    return select('paperRecoveryPhrase', cases, cases.Empty);
                  }
                  throw new Error(`recoveryPhrase unknown mode`);
                })(),
                walletName: select('walletName', nameCases, nameCases.None),
                walletPassword: select('walletPassword', password, password.Empty),
                paperPassword:
                  getRestoreMode().extra === 'paper'
                    ? select('paperPassword', paperPassword, paperPassword.Empty)
                    : '',
              },
            }),
          },
        })
      )}
    />
  );
};

export const RestoreVerify = (): Node => {
  const modeOptions: {| [key: string]: RestoreModeType |} = {
    BYRON: { type: 'bip44', extra: undefined, length: 15 },
    SHELLEY15: { type: 'cip1852', extra: undefined, length: 15 },
    SHELLEY24: { type: 'cip1852', extra: undefined, length: 24 },
    PAPER: {
      type: 'bip44',
      extra: 'paper',
      length: config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT,
    },
  };
  const getRestoreMode = () => select('restoreMode', modeOptions, modeOptions.SHELLEY15);
  const recoveryPhrase = creationRecoveryPhrase.join(' ');
  const selectedNetwork = networks.CardanoMainnet;
  const plates = generatePlates(
    recoveryPhrase,
    0, // 0th account
    getRestoreMode(),
    selectedNetwork
  );
  const lookup = walletLookup([]);

  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          openDialog: WalletRestoreDialog,
          selectedNetwork,
          getParam: <T>() => getRestoreMode(), // eslint-disable-line no-unused-vars
          WalletRestoreDialogContainerProps: {
            generated: restoreWalletProps({
              selectedNetwork,
              step: RestoreSteps.VERIFY_MNEMONIC,
              restoreRequest: {
                isExecuting: boolean('isExecuting', false),
                error: undefined,
                reset: action('reset'),
              },
              recoveryResult: {
                phrase: recoveryPhrase,
                plates,
              },
              lookup,
            }),
          },
        })
      )}
    />
  );
};

export const RestoreLegacyExplanation = (): Node => {
  const selectedNetwork = networks.CardanoMainnet;
  const lookup = walletLookup([]);
  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          openDialog: WalletRestoreDialog,
          selectedNetwork,
          // eslint-disable-next-line no-unused-vars
          getParam: <T>() => ({ type: 'bip44', extra: undefined, length: 15 }),
          WalletRestoreDialogContainerProps: {
            generated: restoreWalletProps({
              selectedNetwork,
              step: RestoreSteps.LEGACY_EXPLANATION,
              lookup,
              restoreRequest: {
                isExecuting: boolean('isExecuting', false),
                error: undefined,
                reset: action('reset'),
              },
            }),
          },
        })
      )}
    />
  );
};

export const RestoreUpgradeRestoringAddresses = (): Node => {
  const selectedNetwork = networks.CardanoMainnet;
  const lookup = walletLookup([]);
  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          openDialog: WalletRestoreDialog,
          selectedNetwork,
          // eslint-disable-next-line no-unused-vars
          getParam: <T>() => ({ type: 'cip1852', extra: undefined, length: 15 }),
          WalletRestoreDialogContainerProps: {
            generated: restoreWalletProps({
              selectedNetwork,
              step: RestoreSteps.TRANSFER_TX_GEN,
              yoroiTransferStep: TransferStatus.RESTORING_ADDRESSES,
              lookup,
            }),
          },
        })
      )}
    />
  );
};

export const RestoreUpgradeCheckingAddresses = (): Node => {
  const selectedNetwork = networks.CardanoMainnet;
  const lookup = walletLookup([]);
  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          openDialog: WalletRestoreDialog,
          selectedNetwork,
          // eslint-disable-next-line no-unused-vars
          getParam: <T>() => ({ type: 'cip1852', extra: undefined, length: 15 }),
          WalletRestoreDialogContainerProps: {
            generated: restoreWalletProps({
              selectedNetwork,
              step: RestoreSteps.TRANSFER_TX_GEN,
              yoroiTransferStep: TransferStatus.CHECKING_ADDRESSES,
              lookup,
            }),
          },
        })
      )}
    />
  );
};

export const RestoreUpgradeGeneratingTx = (): Node => {
  const selectedNetwork = networks.CardanoMainnet;
  const lookup = walletLookup([]);
  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          openDialog: WalletRestoreDialog,
          selectedNetwork,
          // eslint-disable-next-line no-unused-vars
          getParam: <T>() => ({ type: 'cip1852', extra: undefined, length: 15 }),
          WalletRestoreDialogContainerProps: {
            generated: restoreWalletProps({
              selectedNetwork,
              step: RestoreSteps.TRANSFER_TX_GEN,
              yoroiTransferStep: TransferStatus.GENERATING_TX,
              lookup,
            }),
          },
        })
      )}
    />
  );
};

export const RestoreUpgradeReadyToTransfer = (): Node => {
  const selectedNetwork = networks.CardanoMainnet;
  const lookup = walletLookup([]);
  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          openDialog: WalletRestoreDialog,
          selectedNetwork,
          // eslint-disable-next-line no-unused-vars
          getParam: <T>() => ({ type: 'cip1852', extra: undefined, length: 15 }),
          WalletRestoreDialogContainerProps: {
            generated: restoreWalletProps({
              selectedNetwork,
              step: RestoreSteps.TRANSFER_TX_GEN,
              yoroiTransferStep: TransferStatus.READY_TO_TRANSFER,
              lookup,
            }),
          },
        })
      )}
    />
  );
};

export const RestoreUpgradeError = (): Node => {
  const selectedNetwork = networks.CardanoMainnet;
  const lookup = walletLookup([]);

  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          openDialog: WalletRestoreDialog,
          selectedNetwork,
          // eslint-disable-next-line no-unused-vars
          getParam: <T>() => ({ type: 'cip1852', extra: undefined, length: 15 }),
          WalletRestoreDialogContainerProps: {
            generated: restoreWalletProps({
              selectedNetwork,
              step: RestoreSteps.TRANSFER_TX_GEN,
              yoroiTransferError: new GenericApiError(),
              yoroiTransferStep: TransferStatus.ERROR,
              lookup,
            }),
          },
        })
      )}
    />
  );
};

export const RestoreUpgradeNoNeed = (): Node => {
  const selectedNetwork = networks.CardanoMainnet;
  const lookup = walletLookup([]);
  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          openDialog: WalletRestoreDialog,
          selectedNetwork,
          // eslint-disable-next-line no-unused-vars
          getParam: <T>() => ({ type: 'cip1852', extra: undefined, length: 15 }),
          WalletRestoreDialogContainerProps: {
            generated: restoreWalletProps({
              selectedNetwork,
              step: RestoreSteps.TRANSFER_TX_GEN,
              yoroiTransferError: new NoInputsError(),
              yoroiTransferStep: TransferStatus.ERROR,
              lookup,
            }),
          },
        })
      )}
    />
  );
};

export const HardwareOptions = (): Node => {
  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          openDialog: WalletConnectHWOptionDialog,
          selectedNetwork: networks.CardanoMainnet,
        })
      )}
    />
  );
};

const trezorPops: ({|
  trezorConnect: *,
  selectedNetwork: *,
|}) => * = request => ({
  stores: {
    profile: {
      selectedNetwork: request.selectedNetwork,
      isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
    },
    substores: {
      ada: {
        trezorConnect: request.trezorConnect,
      },
    },
  },
  actions: {
    ada: {
      trezorConnect: {
        setMode: {
          trigger: action('setMode'),
        },
        submitCheck: {
          trigger: action('submitCheck'),
        },
        goBackToCheck: {
          trigger: action('goBackToCheck'),
        },
        submitConnect: {
          trigger: async req => action('submitConnect')(req),
        },
        submitSave: {
          trigger: async req => action('submitSave')(req),
        },
        cancel: {
          trigger: action('cancel'),
        },
      },
    },
  },
});

export const TrezorCheck = (): Node => {
  const selectedNetwork = networks.CardanoMainnet;
  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          openDialog: WalletTrezorConnectDialogContainer,
          selectedNetwork,
          // eslint-disable-next-line no-unused-vars
          getParam: <T>() => ({ type: 'bip44', extra: 'trezor' }),
          WalletTrezorConnectDialogContainerProps: {
            generated: trezorPops({
              selectedNetwork,
              trezorConnect: {
                progressInfo: {
                  currentStep: ProgressStep.CHECK,
                  stepState: StepState.LOAD,
                },
                isActionProcessing: boolean('isActionProcessing', false),
                error: undefined,
                defaultWalletName: 'Test wallet',
              },
            }),
          },
        })
      )}
    />
  );
};

export const TrezorConnect = (): Node => {
  const isActionProcessing = boolean('isActionProcessing', false);
  const getErrorValue = () => select('errorCases', trezorErrorCases, trezorErrorCases.None);
  const step = () => {
    if (getErrorValue() !== trezorErrorCases.None) {
      return StepState.ERROR;
    }
    if (isActionProcessing) {
      return StepState.PROCESS;
    }
    return StepState.LOAD;
  };
  const selectedNetwork = networks.CardanoMainnet;
  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          openDialog: WalletTrezorConnectDialogContainer,
          selectedNetwork,
          // eslint-disable-next-line no-unused-vars
          getParam: <T>() => ({ type: 'bip44', extra: 'trezor' }),
          WalletTrezorConnectDialogContainerProps: {
            generated: trezorPops({
              selectedNetwork,
              trezorConnect: {
                progressInfo: {
                  currentStep: ProgressStep.CONNECT,
                  stepState: step(),
                },
                isActionProcessing,
                error: getErrorValue() === trezorErrorCases.None ? undefined : getErrorValue(),
                defaultWalletName: 'Test wallet',
              },
            }),
          },
        })
      )}
    />
  );
};

export const TrezorSave = (): Node => {
  const isActionProcessing = boolean('isActionProcessing', false);
  const errorCases = Object.freeze({
    None: undefined,
    Error: new GenericApiError(),
  });
  const getErrorValue = () => select('errorCases', errorCases, errorCases.None);
  const step = () => {
    if (getErrorValue() !== errorCases.None) {
      return StepState.ERROR;
    }
    if (isActionProcessing) {
      return StepState.PROCESS;
    }
    return StepState.LOAD;
  };
  const nameCases = getWalletNameCases();
  const selectedNetwork = networks.CardanoMainnet;
  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          openDialog: WalletTrezorConnectDialogContainer,
          selectedNetwork,
          // eslint-disable-next-line no-unused-vars
          getParam: <T>() => ({ type: 'bip44', extra: 'trezor' }),
          WalletTrezorConnectDialogContainerProps: {
            generated: trezorPops({
              selectedNetwork,
              trezorConnect: {
                progressInfo: {
                  currentStep: ProgressStep.SAVE,
                  stepState: step(),
                },
                isActionProcessing,
                error: getErrorValue() === errorCases.None ? undefined : getErrorValue(),
                defaultWalletName: select('defaultWalletName', nameCases, nameCases.None),
              },
            }),
          },
        })
      )}
    />
  );
};

const ledgerProps: ({|
  ledgerConnect: *,
  selectedNetwork: *,
  UpgradeTxDialogContainerProps?: *,
|}) => * = request => ({
  stores: {
    profile: {
      selectedNetwork: request.selectedNetwork,
      isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
    },
    substores: {
      ada: {
        ledgerConnect: request.ledgerConnect,
      },
    },
  },
  actions: {
    ada: {
      ledgerConnect: {
        setMode: {
          trigger: action('setMode'),
        },
        submitCheck: {
          trigger: action('submitCheck'),
        },
        goBackToCheck: {
          trigger: action('goBackToCheck'),
        },
        submitConnect: {
          trigger: async req => action('submitConnect')(req),
        },
        submitSave: {
          trigger: async req => action('submitSave')(req),
        },
        cancel: {
          trigger: action('cancel'),
        },
        finishTransfer: {
          trigger: action('finishTransfer'),
        },
      },
    },
  },
  UpgradeTxDialogContainerProps: request.UpgradeTxDialogContainerProps || (null: any),
});

export const LedgerCheck = (): Node => {
  const selectedNetwork = networks.CardanoMainnet;
  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          openDialog: WalletLedgerConnectDialogContainer,
          selectedNetwork,
          // eslint-disable-next-line no-unused-vars
          getParam: <T>() => ({ type: 'bip44', extra: 'ledger' }),
          WalletLedgerConnectDialogContainerProps: {
            generated: ledgerProps({
              selectedNetwork,
              ledgerConnect: {
                progressInfo: {
                  currentStep: ProgressStep.CHECK,
                  stepState: StepState.LOAD,
                },
                isActionProcessing: boolean('isActionProcessing', false),
                error: undefined,
                defaultWalletName: 'Test wallet',
              },
            }),
          },
        })
      )}
    />
  );
};

export const LedgerConnect = (): Node => {
  const isActionProcessing = boolean('isActionProcessing', false);
  const getErrorValue = () => select('errorCases', ledgerErrorCases, ledgerErrorCases.None);
  const step = () => {
    if (getErrorValue() !== ledgerErrorCases.None) {
      return StepState.ERROR;
    }
    if (isActionProcessing) {
      return StepState.PROCESS;
    }
    return StepState.LOAD;
  };
  const selectedNetwork = networks.CardanoMainnet;
  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          openDialog: WalletLedgerConnectDialogContainer,
          selectedNetwork,
          // eslint-disable-next-line no-unused-vars
          getParam: <T>() => ({ type: 'bip44', extra: 'ledger' }),
          WalletLedgerConnectDialogContainerProps: {
            generated: ledgerProps({
              selectedNetwork,
              ledgerConnect: {
                progressInfo: {
                  currentStep: ProgressStep.CONNECT,
                  stepState: step(),
                },
                isActionProcessing,
                error: getErrorValue() === ledgerErrorCases.None ? undefined : getErrorValue(),
                defaultWalletName: 'Test wallet',
              },
            }),
          },
        })
      )}
    />
  );
};

export const LedgerSave = (): Node => {
  const isActionProcessing = boolean('isActionProcessing', false);
  const errorCases = Object.freeze({
    None: undefined,
    Error: new GenericApiError(),
  });
  const getErrorValue = () => select('errorCases', errorCases, errorCases.None);
  const step = () => {
    if (getErrorValue() !== errorCases.None) {
      return StepState.ERROR;
    }
    if (isActionProcessing) {
      return StepState.PROCESS;
    }
    return StepState.LOAD;
  };
  const nameCases = getWalletNameCases();
  const selectedNetwork = networks.CardanoMainnet;
  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          openDialog: WalletLedgerConnectDialogContainer,
          selectedNetwork,
          // eslint-disable-next-line no-unused-vars
          getParam: <T>() => ({ type: 'bip44', extra: 'ledger' }),
          WalletLedgerConnectDialogContainerProps: {
            generated: ledgerProps({
              selectedNetwork,
              ledgerConnect: {
                progressInfo: {
                  currentStep: ProgressStep.SAVE,
                  stepState: step(),
                },
                isActionProcessing,
                error: getErrorValue() === errorCases.None ? undefined : getErrorValue(),
                defaultWalletName: select('defaultWalletName', nameCases, nameCases.None),
              },
            }),
          },
        })
      )}
    />
  );
};

const genDefaultGroupMap: boolean => Map<
  Class<IAddressTypeStore>,
  IAddressTypeUiSubset
> = wasExecuted => {
  return new Map(
    allAddressSubgroups.map(type => [
      type.class,
      {
        all: [],
        wasExecuted,
      },
    ])
  );
};

export const LedgerUpgrade = (): Node => {
  const selectedNetwork = networks.CardanoMainnet;
  const wallet = genShelleyCIP1852SigningWalletWithCache(ConceptualWalletId => ({
    ConceptualWalletId,
    ...mockLedgerMeta,
  }));

  const tentativeTx = genTentativeShelleyTx(wallet.publicDeriver).tentativeTx;
  if (!(tentativeTx instanceof HaskellShelleyTxSignRequest)) {
    throw new Error(`Not ${nameof(HaskellShelleyTxSignRequest)}`);
  }
  const signRequest = tentativeTx;
  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          openDialog: WalletLedgerConnectDialogContainer,
          selectedNetwork,
          // eslint-disable-next-line no-unused-vars
          getParam: <T>() => ({ type: 'bip44', extra: 'ledger' }),
          WalletLedgerConnectDialogContainerProps: {
            generated: ledgerProps({
              selectedNetwork,
              ledgerConnect: {
                progressInfo: {
                  currentStep: ProgressStep.TRANSFER,
                  stepState: StepState.PROCESS,
                },
                isActionProcessing: false,
                error: undefined,
                defaultWalletName: 'Test wallet',
              },
              UpgradeTxDialogContainerProps: {
                generated: {
                  stores: {
                    addresses: {
                      addressSubgroupMap: genDefaultGroupMap(true),
                    },
                    explorers: {
                      selectedExplorer: defaultToSelectedExplorer(),
                    },
                    profile: {
                      isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
                      unitOfAccount: genUnitOfAccount(),
                    },
                    tokenInfoStore: {
                      tokenInfo: mockFromDefaults(defaultAssets),
                    },
                    wallets: {
                      selected: wallet.publicDeriver,
                      sendMoneyRequest: {
                        isExecuting: false,
                        error: undefined,
                        reset: action('sendMoneyRequest reset'),
                      },
                    },
                    coinPriceStore: {
                      getCurrentPrice: (_from, _to) => '5',
                    },
                    substores: {
                      ada: {
                        yoroiTransfer: {
                          transferRequest: {
                            error: undefined,
                            reset: action('transferRequest reset'),
                            result: {
                              publicKey: {
                                addressing: {
                                  startLevel: 1,
                                  path: wallet.publicDeriver.getPathToPublic(),
                                },
                                key: (null: any),
                              },
                              signRequest,
                            },
                          },
                        },
                      },
                    },
                  },
                  actions: {
                    ada: {
                      ledgerSend: {
                        sendUsingLedgerKey: {
                          trigger: async req => action('sendUsingLedgerKey')(req),
                        },
                      },
                    },
                  },
                },
              },
            }),
          },
        })
      )}
    />
  );
};

export const PaperWalletCreate = (): Node => (
  <AddWalletPage
    generated={defaultProps(
      Object.freeze({
        selectedNetwork: networks.CardanoMainnet,
        openDialog: WalletPaperDialog,
        WalletPaperDialogContainerProps: {
          generated: {
            stores: {
              profile: {
                paperWalletsIntro: getPaperWalletIntro(globalKnobs.locale(), ''),
              },
            },
            actions: {
              dialogs: {
                open: { trigger: action('open') },
                updateDataForActiveDialog: { trigger: action('updateDataForActiveDialog') },
              },
            },
          },
        },
      })
    )}
  />
);

const paperWalletMockActions = {
  dialogs: {
    updateDataForActiveDialog: { trigger: action('updateDataForActiveDialog') },
    closeActiveDialog: { trigger: action('closeActiveDialog') },
  },
  notifications: {
    open: { trigger: action('open') },
  },
  paperWallets: {
    cancel: { trigger: action('cancel') },
    submitInit: { trigger: action('submitInit') },
    submitUserPassword: { trigger: async req => action('submitUserPassword')(req) },
    backToCreate: { trigger: action('backToCreate') },
    submitVerify: { trigger: action('submitVerify') },
    submitCreate: { trigger: action('submitCreate') },
    downloadPaperWallet: { trigger: action('downloadPaperWallet') },
  },
};

export const PaperWalletUserPasswordDialog = (): Node => {
  const passwordCases = {
    Untouched: 0,
    TooShort: 1,
    MisMatch: 2,
    Correct: 3,
  };
  const passwordValue = () => select('passwordCases', passwordCases, passwordCases.Untouched);
  const getNewPassword = () => {
    const val = passwordValue();
    if (val === passwordCases.Correct) return 'asdfasdfasdf';
    if (val === passwordCases.MisMatch) return 'asdfasdfasdf';
    if (val === passwordCases.TooShort) return 'a';
    return '';
  };
  const getRepeatPassword = () => {
    const val = passwordValue();
    if (val === passwordCases.Correct) return 'asdfasdfasdf';
    if (val === passwordCases.MisMatch) return 'zxcvzxcvzxcv';
    if (val === passwordCases.TooShort) return 'a';
    return '';
  };
  const selectedNetwork = networks.CardanoMainnet;
  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          openDialog: UserPasswordDialog,
          selectedNetwork,
          CreatePaperWalletDialogContainerProps: {
            generated: {
              stores: {
                explorers: {
                  selectedExplorer: defaultToSelectedExplorer(),
                },
                profile: {
                  paperWalletsIntro: getPaperWalletIntro(globalKnobs.locale(), ''),
                  isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
                  selectedNetwork,
                },
                uiDialogs: {
                  getActiveData: key =>
                    ({
                      numAddresses: 5,
                      printAccountPlate: true,
                      repeatedPasswordValue: getRepeatPassword(),
                      passwordValue: getNewPassword(),
                    }[key]),
                },
                uiNotifications: {
                  isOpen: () => false,
                  getTooltipActiveNotification: () => null,
                },
                paperWallets: {
                  paper: null,
                  progressInfo: PaperWalletProgressStep.USER_PASSWORD,
                  userPassword: '',
                  pdfRenderStatus: null,
                  pdf: null,
                },
              },
              actions: paperWalletMockActions,
              verifyDefaultValues: undefined,
            },
          },
        })
      )}
    />
  );
};

export const PaperWalletCreateDialog = (): Node => {
  const modifiedSteps = {
    undefined: 'undefined',
    ...PdfGenSteps,
    hasPdf: 'hasPdf',
  };
  const extendedSteps = () => select('currentStep', modifiedSteps, modifiedSteps.initializing);
  const getRealStep = () => {
    if (extendedSteps() === modifiedSteps.undefined) {
      return undefined;
    }
    if (extendedSteps() === modifiedSteps.hasPdf) {
      return modifiedSteps.done;
    }
    return extendedSteps();
  };
  const selectedNetwork = networks.CardanoMainnet;
  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          openDialog: UserPasswordDialog,
          selectedNetwork,
          CreatePaperWalletDialogContainerProps: {
            generated: {
              stores: {
                explorers: {
                  selectedExplorer: defaultToSelectedExplorer(),
                },
                profile: {
                  paperWalletsIntro: getPaperWalletIntro(globalKnobs.locale(), ''),
                  isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
                  selectedNetwork,
                },
                uiDialogs: {
                  getActiveData: key =>
                    ({
                      numAddresses: 5,
                      printAccountPlate: true,
                      repeatedPasswordValue: '',
                      passwordValue: '',
                    }[key]),
                },
                uiNotifications: {
                  isOpen: () => false,
                  getTooltipActiveNotification: () => null,
                },
                paperWallets: {
                  paper: null,
                  progressInfo: PaperWalletProgressStep.CREATE,
                  userPassword: '',
                  pdfRenderStatus: getRealStep(),
                  pdf:
                    extendedSteps() === modifiedSteps.hasPdf
                      ? new Blob(['this is just fake data'])
                      : null,
                },
              },
              actions: paperWalletMockActions,
              verifyDefaultValues: undefined,
            },
          },
        })
      )}
    />
  );
};

const constructedPaperWallet = {
  addresses: [
    'Ae2tdPwUPEZCdEXujtvAFSnhqnNsPbd8YoCt5obzpWAH91tbLP6LsHxCVwB',
    'Ae2tdPwUPEZJJzyff4UXcgsaj19twRknh9miCxjsLoAQLt5cpQ3nDnwZKMN',
    'Ae2tdPwUPEZJcoYz71M8SZdsrtvxbsKX9oL1N6j24ULPSY6c5iAPUSAGzgB',
    'Ae2tdPwUPEZ588oVb86pCyANsrPGJZVHU2mqhYqPzLWU1uo6jS2qM1vgn1P',
    'Ae2tdPwUPEZAPUqpvUgoBB7QjrfAbu1RXbFRoLcdYYV8r4FaSJrq4oowAhv',
  ],
  scrambledWords: getValidationMnemonicCases(21).Correct.split(' '),
  plate: {
    ImagePart:
      '7b9bf637f341bed7933c8673f9fb7e405097746115f24ec7d192f80fb6efb219da8bc1902dab99fc070f156b7877f29dd8e581da616ff7fdad28493d084a0db9',
    TextPart: 'XLBS-6706',
  },
};

export const PaperWalletVerifyDialog = (): Node => {
  const mnemonicCases = getValidationMnemonicCases(21);
  const mnemonicsValue = () => select('mnemonicCases', mnemonicCases, mnemonicCases.Empty);
  const correctPassword = 'asdfasdfasdf';
  const passwordCases = getPasswordValidationCases(correctPassword);
  const passwordValue = () => select('passwordCases', passwordCases, passwordCases.Empty);
  const selectedNetwork = networks.CardanoMainnet;
  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          openDialog: UserPasswordDialog,
          selectedNetwork,
          CreatePaperWalletDialogContainerProps: {
            generated: {
              stores: {
                explorers: {
                  selectedExplorer: defaultToSelectedExplorer(),
                },
                profile: {
                  paperWalletsIntro: getPaperWalletIntro(globalKnobs.locale(), ''),
                  isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
                  selectedNetwork,
                },
                uiDialogs: {
                  getActiveData: key =>
                    ({
                      numAddresses: 5,
                      printAccountPlate: true,
                      repeatedPasswordValue: '',
                      passwordValue: '',
                    }[key]),
                },
                uiNotifications: {
                  isOpen: () => false,
                  getTooltipActiveNotification: () => null,
                },
                paperWallets: {
                  paper: constructedPaperWallet,
                  progressInfo: PaperWalletProgressStep.VERIFY,
                  userPassword: correctPassword,
                  pdfRenderStatus: null,
                  pdf: null,
                },
              },
              actions: paperWalletMockActions,
              verifyDefaultValues:
                passwordValue() === passwordCases.Empty && mnemonicsValue() === mnemonicCases.Empty
                  ? undefined
                  : {
                      paperPassword: passwordValue(),
                      recoveryPhrase: mnemonicsValue(),
                      walletName: '',
                      walletPassword: '',
                    },
            },
          },
        })
      )}
    />
  );
};

export const PaperWalletFinalizeDialog = (): Node => {
  const selectedNetwork = networks.CardanoMainnet;
  return (
    <AddWalletPage
      generated={defaultProps(
        Object.freeze({
          openDialog: UserPasswordDialog,
          selectedNetwork,
          CreatePaperWalletDialogContainerProps: {
            generated: {
              stores: {
                explorers: {
                  selectedExplorer: defaultToSelectedExplorer(),
                },
                profile: {
                  paperWalletsIntro: getPaperWalletIntro(globalKnobs.locale(), ''),
                  isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
                  selectedNetwork,
                },
                uiDialogs: {
                  getActiveData: key =>
                    ({
                      numAddresses: 5,
                      printAccountPlate: true,
                      repeatedPasswordValue: '',
                      passwordValue: '',
                    }[key]),
                },
                uiNotifications: {
                  isOpen: () => false,
                  getTooltipActiveNotification: () => null,
                },
                paperWallets: {
                  paper: constructedPaperWallet,
                  progressInfo: PaperWalletProgressStep.FINALIZE,
                  userPassword: '',
                  pdfRenderStatus: null,
                  pdf: null,
                },
              },
              actions: paperWalletMockActions,
              verifyDefaultValues: undefined,
            },
          },
        })
      )}
    />
  );
};
