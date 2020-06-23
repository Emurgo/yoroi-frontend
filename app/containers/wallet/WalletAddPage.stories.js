
// @flow

import type { Node } from 'react';
import React from 'react';
import BigNumber from 'bignumber.js';

import { select, boolean, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { TransferStatus } from '../../types/TransferTypes';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import WalletAddPage from './WalletAddPage';
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
} from '../../../stories/helpers/StoryWrapper';
import environment from '../../environment';
import { THEMES } from '../../themes';
import AdaApi from '../../api/ada/index';
import {
  generateWalletRootKey,
} from '../../api/ada/lib/cardanoCrypto/cryptoWallet';
import { GenericApiError, } from '../../api/common/errors';
import { NoInputsError } from '../../api/ada/errors';
import { withScreenshot } from 'storycap';
import { getDefaultExplorer } from '../../domain/Explorer';
import { StepState } from '../../components/widgets/ProgressSteps';
import { ProgressStep } from '../../types/HWConnectStoreTypes';
import { RestoreSteps, generatePlates } from '../../stores/toplevel/WalletRestoreStore';
import { RestoreMode } from '../../actions/common/wallet-restore-actions';
import WalletCreateDialog from '../../components/wallet/WalletCreateDialog';
import WalletBackupDialog from '../../components/wallet/WalletBackupDialog';
import WalletRestoreDialog from '../../components/wallet/WalletRestoreDialog';
import WalletRestoreOptionDialog from '../../components/wallet/add/option-dialog/WalletRestoreOptionDialog';
import WalletConnectHWOptionDialog from '../../components/wallet/add/option-dialog/WalletConnectHWOptionDialog';
import WalletTrezorConnectDialogContainer from './dialogs/WalletTrezorConnectDialogContainer';
import WalletLedgerConnectDialogContainer from './dialogs/WalletLedgerConnectDialogContainer';
import { getPaperWalletIntro } from '../../stores/toplevel/ProfileStore';
import { getApiMeta } from '../../api/common/utils';
import WalletCreateOptionDialog from '../../components/wallet/add/option-dialog/WalletCreateOptionDialog';
import WalletPaperDialog from '../../components/wallet/WalletPaperDialog';
import UserPasswordDialog from '../../components/wallet/add/paper-wallets/UserPasswordDialog';
import { ProgressStep as PaperWalletProgressStep } from '../../stores/ada/PaperWalletCreateStore';
import { PdfGenSteps } from '../../api/ada/paperWallet/paperWalletPdf';
import { ROUTES } from '../../routes-config';

export default {
  title: `${__filename.split('.')[0]}`,
  component: WalletAddPage,
  decorators: [withScreenshot],
};

const defaultProps: {|
  openDialog?: Object,
  getParam?: <T>(number | string) => T,
  selectedAPI: *,
  WalletCreateDialogContainerProps?: *,
  WalletPaperDialogContainerProps?: *,
  CreatePaperWalletDialogContainerProps?: *,
  WalletBackupDialogContainerProps?: *,
  WalletRestoreDialogContainerProps?: *,
  WalletTrezorConnectDialogContainerProps?: *,
  WalletLedgerConnectDialogContainerProps?: *,
|} => * = (request) => ({
  stores: {
    profile: {
      selectedAPI: request.selectedAPI,
    },
    uiDialogs: {
      activeDialog: request.openDialog,
      isOpen: (clazz) => clazz === request.openDialog,
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
    },
    profile: {
      setSelectedAPI: {
        trigger: action('setSelectedAPI'),
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
      },
      actions: {
        profile: {
          toggleSidebar: { trigger: async (req) => action('toggleSidebar')(req) },
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
            ServerStatusErrors.Healthy,
          ),
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
  <WalletAddPage
    generated={defaultProps(Object.freeze({
      selectedAPI: getApiMeta('ada'),
    }))}
  />
);

export const CurrencySelect = (): Node => (
  <WalletAddPage
    generated={defaultProps(Object.freeze({
      openDialog: WalletCreateDialog,
      selectedAPI: undefined,
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
                createWallet: {
                  trigger: async (req) => action('createWallet')(req),
                },
              },
            },
          },
        },
      },
    }))}
  />
);

export const CreateWalletOptions = (): Node => {
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        selectedAPI: getApiMeta('ada'),
        openDialog: WalletCreateOptionDialog,
      }))}
    />
  );
};

export const CreateWalletStart = (): Node => (
  <WalletAddPage
    generated={defaultProps(Object.freeze({
      selectedAPI: getApiMeta('ada'),
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
                createWallet: {
                  trigger: async (req) => action('createWallet')(req),
                },
              },
            },
          },
        },
      },
    }))}
  />
);

const creationRecoveryPhrase = 'horse horse wash ten deny mix fuel dinner mutual lesson possible soda hurdle march advice'
  .split(' ');

const walletBackupProps: {|
  walletBackup: *,
  isExecuting?: boolean,
|} => * = (request) => ({
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
      cancelWalletBackup: { trigger: action('cancelWalletBackup'), },
      startWalletBackup: { trigger: action('startWalletBackup'), },
      addWordToWalletBackupVerification: { trigger: action('addWordToWalletBackupVerification'), },
      clearEnteredRecoveryPhrase: { trigger: action('clearEnteredRecoveryPhrase'), },
      acceptWalletBackupTermDevice: { trigger: action('acceptWalletBackupTermDevice'), },
      acceptWalletBackupTermRecovery: { trigger: action('acceptWalletBackupTermRecovery'), },
      restartWalletBackup: { trigger: action('restartWalletBackup'), },
      finishWalletBackup: { trigger: async (req) => action('finishWalletBackup')(req), },
      removeOneMnemonicWord: { trigger: action('removeOneMnemonicWord'), },
      continueToPrivacyWarning: { trigger: action('continueToPrivacyWarning'), },
      acceptPrivacyNoticeForWalletBackup: { trigger: action('acceptPrivacyNoticeForWalletBackup'), },
      continueToRecoveryPhraseForWalletBackup: { trigger: action('continueToRecoveryPhraseForWalletBackup'), },
    },
  },
});

export const CreateWalletPrivacyDialog = (): Node => {
  const countdownCases = Object.freeze({
    CountingDown: 10,
    Elapsed: 0,
  });
  const countdownValue = () => select(
    'countdownCases',
    countdownCases,
    countdownCases.CountingDown
  );
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        selectedAPI: getApiMeta('ada'),
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
          })
        },
      }))}
    />
  );
};

export const CreateWalletRecoveryPhraseDisplay = (): Node => {
  const countdownCases = Object.freeze({
    CountingDown: 10,
    Elapsed: 0,
  });
  const countdownValue = () => select(
    'countdownCases',
    countdownCases,
    countdownCases.CountingDown
  );
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        selectedAPI: getApiMeta('ada'),
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
          })
        },
      }))}
    />
  );
};

export const CreateWalletRecoveryPhraseEnter = (): Node => {
  const entryCases = Object.freeze({
    None: 0,
    Single: 1,
    All: 2,
  });
  const getEntryValue = () => select(
    'entryCases',
    entryCases,
    entryCases.None
  );
  const recoveryPhraseSorted = (() => {
    const entryValue = getEntryValue();
    const base = creationRecoveryPhrase.map(word => ({
      word,
      isActive: !(entryValue === entryCases.All)
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
      return [{
        word: creationRecoveryPhrase[0],
        index: 0
      }];
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
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        selectedAPI: getApiMeta('ada'),
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
          })
        },
      }))}
    />
  );
};

export const CreateWalletFinalConfirm = (): Node => {
  const isTermDeviceAccepted = boolean('isTermDeviceAccepted', false);
  const isTermRecoveryAccepted = boolean('isTermRecoveryAccepted', false);
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        selectedAPI: getApiMeta('ada'),
        openDialog: WalletBackupDialog,
        WalletBackupDialogContainerProps: {
          generated: walletBackupProps({
            isExecuting: isTermDeviceAccepted && isTermRecoveryAccepted && boolean('isExecuting', false),
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
          })
        },
      }))}
    />
  );
};

const restoreWalletProps: {|
  step: *,
  selectedAPI: *,
  walletRestoreMeta?: *,
  recoveryResult?: *,
  restoreRequest?: *,
  yoroiTransferStep?: *,
  yoroiTransferError?: *,
|} => * = (request) => ({
  stores: {
    profile: {
      selectedAPI: request.selectedAPI,
      isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
      selectedExplorer: getDefaultExplorer(),
      unitOfAccount: genUnitOfAccount(),
    },
    uiNotifications: {
      isOpen: () => false,
      getTooltipActiveNotification: () => null,
    },
    wallets: {
      restoreRequest: request.restoreRequest || {
        isExecuting: false,
        error: undefined,
        reset: action('reset'),
      },
    },
    coinPriceStore: {
      getCurrentPrice: (_from, _to) => 5,
    },
    walletRestore: {
      step: request.step,
      walletRestoreMeta: request.walletRestoreMeta,
      recoveryResult: request.recoveryResult,
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
        yoroiTransfer: {
          status: request.yoroiTransferStep || TransferStatus.UNINITIALIZED,
          error: request.yoroiTransferError,
          transferTx: {
            encodedTx: new Uint8Array([]),
            fee: new BigNumber(1),
            id: 'b65ae37bcc560e323ea8922de6573004299b6646e69ab9fac305f62f0c94c3ab',
            receiver: 'Ae2tdPwUPEZ5PxKxoyZDgjsKgMWMpTRa4PH3sVgARSGBsWwNBH3qg7cMFsP',
            recoveredBalance: new BigNumber(1000),
            senders: ['Ae2tdPwUPEZE9RAm3d3zuuh22YjqDxhR1JF6G93uJsRrk51QGHzRUzLvDjL'],
          },
          transferFundsRequest: {
            isExecuting: request.yoroiTransferStep === TransferStatus.READY_TO_TRANSFER
              ? boolean('isExecuting', false)
              : false,
          },
        },
      },
    },
  },
  actions: {
    notifications: {
      open: {
        trigger: action('open'),
      },
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
        trigger: async (req) => action('verifyMnemonic')(req),
      },
      startRestore: {
        trigger: async (req) => action('startRestore')(req),
      },
      startCheck: {
        trigger: async (req) => action('startCheck')(req),
      },
      submitFields: {
        trigger: action('submitFields'),
      },
    },
    ada: {
      walletRestore: {
        transferFromLegacy: {
          trigger: async (req) => action('transferFromLegacy')(req),
        },
      },
    },
  }
});

export const RestoreOptions = (): Node => {
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        selectedAPI: getApiMeta('ada'),
        openDialog: WalletRestoreOptionDialog,
      }))}
    />
  );
};

export const RestoreWalletStart = (): Node => {
  const restoreMode = Object.freeze({
    Regular: 0,
    Paper: 1,
  });
  const getRestoreMode = () => select(
    'restoreMode',
    restoreMode,
    restoreMode.Regular
  );
  const nameCases = getWalletNameCases();
  const password = getPasswordCreationCases();
  const paperPassword = getPasswordValidationCases('paper_password');

  const selectedAPI = getApiMeta('ada');
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        selectedAPI,
        openDialog: WalletRestoreDialog,
        getParam: <T>() => getRestoreMode(), // eslint-disable-line no-unused-vars
        WalletRestoreDialogContainerProps: {
          generated: restoreWalletProps({
            selectedAPI,
            step: RestoreSteps.START,
            walletRestoreMeta: {
              recoveryPhrase: (() => {
                if (getRestoreMode() === restoreMode.Regular) {
                  const cases = getMnemonicCases(15);
                  return select('regularRecoveryPhrase', cases, cases.Empty);
                }
                if (getRestoreMode() === restoreMode.Paper) {
                  const cases = getMnemonicCases(21);
                  return select('paperRecoveryPhrase', cases, cases.Empty);
                }
                throw new Error(`recoveryPhrase unknown mode`);
              })(),
              walletName: select('walletName', nameCases, nameCases.None),
              walletPassword: select('walletPassword', password, password.Empty),
              paperPassword: getRestoreMode() === RestoreMode.PAPER
                ? select('paperPassword', paperPassword, paperPassword.Empty)
                : '',
            },
          })
        },
      }))}
    />
  );
};

export const RestoreVerify = (): Node => {
  const restoreMode = Object.freeze({
    Regular: 0,
    Paper: 1,
  });
  const getRestoreMode = () => select(
    'restoreMode',
    restoreMode,
    restoreMode.Regular
  );
  const recoveryPhrase = creationRecoveryPhrase.join(' ');
  const rootPk = generateWalletRootKey(recoveryPhrase);
  const { byronPlate, shelleyPlate } = generatePlates(rootPk, getRestoreMode());
  const selectedAPI = getApiMeta('ada');
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletRestoreDialog,
        selectedAPI,
        getParam: <T>() => getRestoreMode(), // eslint-disable-line no-unused-vars
        WalletRestoreDialogContainerProps: {
          generated: restoreWalletProps({
            selectedAPI,
            step: RestoreSteps.VERIFY_MNEMONIC,
            restoreRequest: {
              isExecuting: !environment.isJormungandr() && boolean('isExecuting', false),
              error: undefined,
              reset: action('reset'),
            },
            recoveryResult: {
              phrase: recoveryPhrase,
              byronPlate,
              shelleyPlate,
            },
          })
        },
      }))}
    />
  );
};

export const RestoreLegacyExplanation = (): Node => {
  const selectedAPI = getApiMeta('ada');
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletRestoreDialog,
        selectedAPI,
        WalletRestoreDialogContainerProps: {
          generated: restoreWalletProps({
            selectedAPI,
            step: RestoreSteps.LEGACY_EXPLANATION,
            restoreRequest: {
              isExecuting: boolean('isExecuting', false),
              error: undefined,
              reset: action('reset'),
            },
          })
        },
      }))}
    />
  );
};

export const RestoreUpgradeRestoringAddresses = (): Node => {
  const selectedAPI = getApiMeta('ada');
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletRestoreDialog,
        selectedAPI,
        WalletRestoreDialogContainerProps: {
          generated: restoreWalletProps({
            selectedAPI,
            step: RestoreSteps.TRANSFER_TX_GEN,
            yoroiTransferStep: TransferStatus.RESTORING_ADDRESSES,
          })
        },
      }))}
    />
  );
};

export const RestoreUpgradeCheckingAddresses = (): Node => {
  const selectedAPI = getApiMeta('ada');
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletRestoreDialog,
        selectedAPI,
        WalletRestoreDialogContainerProps: {
          generated: restoreWalletProps({
            selectedAPI,
            step: RestoreSteps.TRANSFER_TX_GEN,
            yoroiTransferStep: TransferStatus.CHECKING_ADDRESSES,
          })
        },
      }))}
    />
  );
};

export const RestoreUpgradeGeneratingTx = (): Node => {
  const selectedAPI = getApiMeta('ada');
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletRestoreDialog,
        selectedAPI,
        WalletRestoreDialogContainerProps: {
          generated: restoreWalletProps({
            selectedAPI,
            step: RestoreSteps.TRANSFER_TX_GEN,
            yoroiTransferStep: TransferStatus.GENERATING_TX,
          })
        },
      }))}
    />
  );
};

export const RestoreUpgradeReadyToTransfer = (): Node => {
  const selectedAPI = getApiMeta('ada');
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletRestoreDialog,
        selectedAPI,
        WalletRestoreDialogContainerProps: {
          generated: restoreWalletProps({
            selectedAPI,
            step: RestoreSteps.TRANSFER_TX_GEN,
            yoroiTransferStep: TransferStatus.READY_TO_TRANSFER,
          })
        },
      }))}
    />
  );
};

export const RestoreUpgradeError = (): Node => {
  const selectedAPI = getApiMeta('ada');
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletRestoreDialog,
        selectedAPI,
        WalletRestoreDialogContainerProps: {
          generated: restoreWalletProps({
            selectedAPI,
            step: RestoreSteps.TRANSFER_TX_GEN,
            yoroiTransferError: new GenericApiError(),
            yoroiTransferStep: TransferStatus.ERROR,
          })
        },
      }))}
    />
  );
};

export const RestoreUpgradeNoNeed = (): Node => {
  const selectedAPI = getApiMeta('ada');
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletRestoreDialog,
        selectedAPI,
        WalletRestoreDialogContainerProps: {
          generated: restoreWalletProps({
            selectedAPI,
            step: RestoreSteps.TRANSFER_TX_GEN,
            yoroiTransferError: new NoInputsError(),
            yoroiTransferStep: TransferStatus.ERROR,
          })
        },
      }))}
    />
  );
};

export const HardwareOptions = (): Node => {
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletConnectHWOptionDialog,
        selectedAPI: getApiMeta('ada'),
      }))}
    />
  );
};

const trezorPops: {|
  trezorConnect: *,
  selectedAPI: *,
|} => * = (request) => ({
  stores: {
    profile: {
      selectedAPI: request.selectedAPI,
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
        submitCheck: {
          trigger: action('submitCheck'),
        },
        goBackToCheck: {
          trigger: action('goBackToCheck'),
        },
        submitConnect: {
          trigger: async (req) => action('submitConnect')(req),
        },
        submitSave: {
          trigger: async (req) => action('submitSave')(req),
        },
        cancel: {
          trigger: action('cancel'),
        },
      },
    },
  },
});

export const TrezorCheck = (): Node => {
  const selectedAPI = getApiMeta('ada');
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletTrezorConnectDialogContainer,
        selectedAPI,
        WalletTrezorConnectDialogContainerProps: {
          generated: trezorPops({
            selectedAPI,
            trezorConnect: {
              progressInfo: {
                currentStep: ProgressStep.CHECK,
                stepState: StepState.LOAD,
              },
              isActionProcessing: boolean('isActionProcessing', false),
              error: undefined,
              defaultWalletName: 'Test wallet',
            }
          })
        },
      }))}
    />
  );
};


export const TrezorConnect = (): Node => {
  const isActionProcessing = boolean('isActionProcessing', false);
  const getErrorValue = () => select(
    'errorCases',
    trezorErrorCases,
    trezorErrorCases.None
  );
  const step = (() => {
    if (getErrorValue() !== trezorErrorCases.None) {
      return StepState.ERROR;
    }
    if (isActionProcessing) {
      return StepState.PROCESS;
    }
    return StepState.LOAD;
  });
  const selectedAPI = getApiMeta('ada');
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletTrezorConnectDialogContainer,
        selectedAPI,
        WalletTrezorConnectDialogContainerProps: {
          generated: trezorPops({
            selectedAPI,
            trezorConnect: {
              progressInfo: {
                currentStep: ProgressStep.CONNECT,
                stepState: step(),
              },
              isActionProcessing,
              error: getErrorValue() === trezorErrorCases.None
                ? undefined
                : getErrorValue(),
              defaultWalletName: 'Test wallet',
            }
          })
        },
      }))}
    />
  );
};

export const TrezorSave = (): Node => {
  const isActionProcessing = boolean('isActionProcessing', false);
  const errorCases = Object.freeze({
    None: undefined,
    Error: new GenericApiError(),
  });
  const getErrorValue = () => select(
    'errorCases',
    errorCases,
    errorCases.None
  );
  const step = (() => {
    if (getErrorValue() !== errorCases.None) {
      return StepState.ERROR;
    }
    if (isActionProcessing) {
      return StepState.PROCESS;
    }
    return StepState.LOAD;
  });
  const nameCases = getWalletNameCases();
  const selectedAPI = getApiMeta('ada');
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletTrezorConnectDialogContainer,
        selectedAPI,
        WalletTrezorConnectDialogContainerProps: {
          generated: trezorPops({
            selectedAPI,
            trezorConnect: {
              progressInfo: {
                currentStep: ProgressStep.SAVE,
                stepState: step(),
              },
              isActionProcessing,
              error: getErrorValue() === errorCases.None
                ? undefined
                : getErrorValue(),
              defaultWalletName: select('defaultWalletName', nameCases, nameCases.None),
            }
          })
        },
      }))}
    />
  );
};

const ledgerProps: {|
  ledgerConnect: *,
  selectedAPI: *,
|} => * = (request) => ({
  stores: {
    profile: {
      selectedAPI: request.selectedAPI,
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
        submitCheck: {
          trigger: action('submitCheck'),
        },
        goBackToCheck: {
          trigger: action('goBackToCheck'),
        },
        submitConnect: {
          trigger: async (req) => action('submitConnect')(req),
        },
        submitSave: {
          trigger: async (req) => action('submitSave')(req),
        },
        cancel: {
          trigger: action('cancel'),
        },
      },
    },
  },
});

export const LedgerCheck = (): Node => {
  const selectedAPI = getApiMeta('ada');
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletLedgerConnectDialogContainer,
        selectedAPI,
        WalletLedgerConnectDialogContainerProps: {
          generated: ledgerProps({
            selectedAPI,
            ledgerConnect: {
              progressInfo: {
                currentStep: ProgressStep.CHECK,
                stepState: StepState.LOAD,
              },
              isActionProcessing: boolean('isActionProcessing', false),
              error: undefined,
              defaultWalletName: 'Test wallet',
            }
          })
        },
      }))}
    />
  );
};


export const LedgerConnect = (): Node => {
  const isActionProcessing = boolean('isActionProcessing', false);
  const getErrorValue = () => select(
    'errorCases',
    ledgerErrorCases,
    ledgerErrorCases.None
  );
  const step = (() => {
    if (getErrorValue() !== ledgerErrorCases.None) {
      return StepState.ERROR;
    }
    if (isActionProcessing) {
      return StepState.PROCESS;
    }
    return StepState.LOAD;
  });
  const selectedAPI = getApiMeta('ada');
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletLedgerConnectDialogContainer,
        selectedAPI,
        WalletLedgerConnectDialogContainerProps: {
          generated: ledgerProps({
            selectedAPI,
            ledgerConnect: {
              progressInfo: {
                currentStep: ProgressStep.CONNECT,
                stepState: step(),
              },
              isActionProcessing,
              error: getErrorValue() === ledgerErrorCases.None
                ? undefined
                : getErrorValue(),
              defaultWalletName: 'Test wallet',
            }
          })
        },
      }))}
    />
  );
};

export const LedgerSave = (): Node => {
  const isActionProcessing = boolean('isActionProcessing', false);
  const errorCases = Object.freeze({
    None: undefined,
    Error: new GenericApiError(),
  });
  const getErrorValue = () => select(
    'errorCases',
    errorCases,
    errorCases.None
  );
  const step = (() => {
    if (getErrorValue() !== errorCases.None) {
      return StepState.ERROR;
    }
    if (isActionProcessing) {
      return StepState.PROCESS;
    }
    return StepState.LOAD;
  });
  const nameCases = getWalletNameCases();
  const selectedAPI = getApiMeta('ada');
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletLedgerConnectDialogContainer,
        selectedAPI,
        WalletLedgerConnectDialogContainerProps: {
          generated: ledgerProps({
            selectedAPI,
            ledgerConnect: {
              progressInfo: {
                currentStep: ProgressStep.SAVE,
                stepState: step(),
              },
              isActionProcessing,
              error: getErrorValue() === errorCases.None
                ? undefined
                : getErrorValue(),
              defaultWalletName: select('defaultWalletName', nameCases, nameCases.None),
            }
          })
        },
      }))}
    />
  );
};


export const PaperWalletCreate = (): Node => (
  <WalletAddPage
    generated={defaultProps(Object.freeze({
      selectedAPI: getApiMeta('ada'),
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
          }
        },
      },
    }))}
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
    submitUserPassword: { trigger: async (req) => action('submitUserPassword')(req) },
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
  const passwordValue = () => select(
    'passwordCases',
    passwordCases,
    passwordCases.Untouched,
  );
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
  const selectedAPI = getApiMeta('ada');
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: UserPasswordDialog,
        selectedAPI,
        CreatePaperWalletDialogContainerProps: {
          generated: {
            stores: {
              profile: {
                paperWalletsIntro: getPaperWalletIntro(globalKnobs.locale(), ''),
                isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
                selectedExplorer: getDefaultExplorer(),
              },
              uiDialogs: {
                dataForActiveDialog: {
                  numAddresses: 5,
                  printAccountPlate: true,
                  repeatedPasswordValue: getRepeatPassword(),
                  passwordValue: getNewPassword(),
                }
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
      }))}
    />
  );
};

export const PaperWalletCreateDialog = (): Node => {
  const modifiedSteps = {
    undefined: 'undefined',
    ...PdfGenSteps,
    hasPdf: 'hasPdf',
  };
  const extendedSteps = () => select(
    'currentStep',
    modifiedSteps,
    modifiedSteps.initializing,
  );
  const getRealStep = () => {
    if (extendedSteps() === modifiedSteps.undefined) {
      return undefined;
    }
    if (extendedSteps() === modifiedSteps.hasPdf) {
      return modifiedSteps.done;
    }
    return extendedSteps();
  };
  const selectedAPI = getApiMeta('ada');
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: UserPasswordDialog,
        selectedAPI,
        CreatePaperWalletDialogContainerProps: {
          generated: {
            stores: {
              profile: {
                paperWalletsIntro: getPaperWalletIntro(globalKnobs.locale(), ''),
                isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
                selectedExplorer: getDefaultExplorer(),
              },
              uiDialogs: {
                dataForActiveDialog: {
                  numAddresses: 5,
                  printAccountPlate: true,
                  repeatedPasswordValue: '',
                  passwordValue: '',
                }
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
                pdf: extendedSteps() === modifiedSteps.hasPdf
                  ? new Blob(['this is just fake data'])
                  : null,
              },
            },
            actions: paperWalletMockActions,
            verifyDefaultValues: undefined,
          },
        },
      }))}
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
  accountPlate: {
    ImagePart: '7b9bf637f341bed7933c8673f9fb7e405097746115f24ec7d192f80fb6efb219da8bc1902dab99fc070f156b7877f29dd8e581da616ff7fdad28493d084a0db9',
    TextPart: 'XLBS-6706',
  },
};

export const PaperWalletVerifyDialog = (): Node => {
  const mnemonicCases = getValidationMnemonicCases(21);
  const mnemonicsValue = () => select(
    'mnemonicCases',
    mnemonicCases,
    mnemonicCases.Empty,
  );
  const correctPassword = 'asdfasdfasdf';
  const passwordCases = getPasswordValidationCases(correctPassword);
  const passwordValue = () => select(
    'passwordCases',
    passwordCases,
    passwordCases.Empty,
  );
  const selectedAPI = getApiMeta('ada');
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: UserPasswordDialog,
        selectedAPI,
        CreatePaperWalletDialogContainerProps: {
          generated: {
            stores: {
              profile: {
                paperWalletsIntro: getPaperWalletIntro(globalKnobs.locale(), ''),
                isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
                selectedExplorer: getDefaultExplorer(),
              },
              uiDialogs: {
                dataForActiveDialog: {
                  numAddresses: 5,
                  printAccountPlate: true,
                  repeatedPasswordValue: '',
                  passwordValue: '',
                }
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
            verifyDefaultValues: passwordValue() === passwordCases.Empty &&
              mnemonicsValue() === mnemonicCases.Empty
              ? undefined
              : {
                paperPassword: passwordValue(),
                recoveryPhrase: mnemonicsValue(),
                walletName: '',
                walletPassword: '',
              }
          },
        },
      }))}
    />
  );
};

export const PaperWalletFinalizeDialog = (): Node => {
  const selectedAPI = getApiMeta('ada');
  return (<WalletAddPage
    generated={defaultProps(Object.freeze({
      openDialog: UserPasswordDialog,
      selectedAPI,
      CreatePaperWalletDialogContainerProps: {
        generated: {
          stores: {
            profile: {
              paperWalletsIntro: getPaperWalletIntro(globalKnobs.locale(), ''),
              isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
              selectedExplorer: getDefaultExplorer(),
            },
            uiDialogs: {
              dataForActiveDialog: {
                numAddresses: 5,
                printAccountPlate: true,
                repeatedPasswordValue: '',
                passwordValue: '',
              }
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
    }))}
  />);
};
