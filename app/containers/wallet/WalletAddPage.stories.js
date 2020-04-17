// @flow

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
} from '../../../stories/helpers/StoryWrapper';
import environment from '../../environment';
import { THEMES } from '../../themes';
import AdaApi from '../../api/ada/index';
import {
  generateWalletRootKey,
} from '../../api/ada/lib/cardanoCrypto/cryptoWallet';
import { GenericApiError, } from '../../api/common';
import { NoInputsError } from '../../api/ada/errors';
import { withScreenshot } from 'storycap';
import { getDefaultExplorer } from '../../domain/Explorer';
import { StepState } from '../../components/widgets/ProgressSteps';
import { ProgressStep } from '../../types/HWConnectStoreTypes';
import { RestoreSteps, generatePlates } from '../../stores/ada/WalletRestoreStore';
import { RestoreMode } from '../../actions/ada/wallet-restore-actions';
import WalletCreateDialog from '../../components/wallet/WalletCreateDialog';
import WalletBackupDialog from '../../components/wallet/WalletBackupDialog';
import WalletRestoreDialog from '../../components/wallet/WalletRestoreDialog';
import WalletRestoreOptionDialog from '../../components/wallet/add/option-dialog/WalletRestoreOptionDialog';
import WalletConnectHWOptionDialog from '../../components/wallet/add/option-dialog/WalletConnectHWOptionDialog';
import WalletTrezorConnectDialogContainer from './dialogs/WalletTrezorConnectDialogContainer';
import WalletLedgerConnectDialogContainer from './dialogs/WalletLedgerConnectDialogContainer';

export default {
  title: `${__filename.split('.')[0]}`,
  component: WalletAddPage,
  decorators: [withScreenshot],
};

const defaultProps: {|
  openDialog?: Object,
  getParam?: <T>(number | string) => T,
  WalletCreateDialogContainerProps?: *,
  WalletBackupDialogContainerProps?: *,
  WalletRestoreDialogContainerProps?: *,
  WalletTrezorConnectDialogContainerProps?: *,
  WalletLedgerConnectDialogContainerProps?: *,
|} => * = (request) => ({
  stores: {
    uiDialogs: {
      isOpen: (clazz) => clazz === request.openDialog,
      getParam: request.getParam || (() => (undefined: any)),
    },
    wallets: {
      hasAnyWallets: boolean('hasAnyWallets', false),
    },
    substores: {
      ada: {
        serverConnectionStore: {
          checkAdaServerStatus: select(
            'checkAdaServerStatus',
            ServerStatusErrors,
            ServerStatusErrors.Healthy,
          ),
        },
      },
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
        topbar: {
          isActiveCategory: (_category) => false,
          categories: [],
        },
        profile: {
          isSidebarExpanded: false,
        },
      },
      actions: {
        profile: {
          toggleSidebar: { trigger: async (req) => action('toggleSidebar')(req) },
        },
        topbar: {
          activateTopbarCategory: { trigger: action('activateTopbarCategory') },
        },
      },
    },
  },
  WalletCreateDialogContainerProps: request.WalletCreateDialogContainerProps || (null: any),
  WalletBackupDialogContainerProps: request.WalletBackupDialogContainerProps || (null: any),
  WalletRestoreDialogContainerProps: request.WalletRestoreDialogContainerProps || (null: any),
  WalletTrezorConnectDialogContainerProps:
    request.WalletTrezorConnectDialogContainerProps || (null: any),
  WalletLedgerConnectDialogContainerProps:
    request.WalletLedgerConnectDialogContainerProps || (null: any),
});

export const MainPage = () => (
  <WalletAddPage
    generated={defaultProps(Object.freeze({
    }))}
  />
);

export const CreateWalletStart = () => (
  <WalletAddPage
    generated={defaultProps(Object.freeze({
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

export const CreateWalletPrivacyDialog = () => {
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

export const CreateWalletRecoveryPhraseDisplay = () => {
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

export const CreateWalletRecoveryPhraseEnter = () => {
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

export const CreateWalletFinalConfirm = () => {
  const isTermDeviceAccepted = boolean('isTermDeviceAccepted', false);
  const isTermRecoveryAccepted = boolean('isTermRecoveryAccepted', false);
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
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
  walletRestoreMeta?: *,
  recoveryResult?: *,
  restoreRequest?: *,
  yoroiTransferStep?: *,
  yoroiTransferError?: *,
|} => * = (request) => ({
  stores: {
    profile: {
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
        walletRestore: {
          step: request.step,
          walletRestoreMeta: request.walletRestoreMeta,
          recoveryResult: request.recoveryResult,
        },
        wallets: {
          isValidMnemonic: AdaApi.prototype.isValidMnemonic,
          isValidPaperMnemonic: AdaApi.prototype.isValidPaperMnemonic,
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
    ada: {
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
        transferFromLegacy: {
          trigger: async (req) => action('transferFromLegacy')(req),
        },
        submitFields: {
          trigger: action('submitFields'),
        },
      },
    },
  }
});

export const RestoreOptions = () => {
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletRestoreOptionDialog,
      }))}
    />
  );
};

export const RestoreWalletStart = () => {
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
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletRestoreDialog,
        getParam: <T>() => getRestoreMode(), // eslint-disable-line no-unused-vars
        WalletRestoreDialogContainerProps: {
          generated: restoreWalletProps({
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

export const RestoreVerify = () => {
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
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletRestoreDialog,
        getParam: <T>() => getRestoreMode(), // eslint-disable-line no-unused-vars
        WalletRestoreDialogContainerProps: {
          generated: restoreWalletProps({
            step: RestoreSteps.VERIFY_MNEMONIC,
            restoreRequest: {
              isExecuting: !environment.isShelley() && boolean('isExecuting', false),
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

export const RestoreLegacyExplanation = () => {
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletRestoreDialog,
        WalletRestoreDialogContainerProps: {
          generated: restoreWalletProps({
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

export const RestoreUpgradeRestoringAddresses = () => {
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletRestoreDialog,
        WalletRestoreDialogContainerProps: {
          generated: restoreWalletProps({
            step: RestoreSteps.TRANSFER_TX_GEN,
            yoroiTransferStep: TransferStatus.RESTORING_ADDRESSES,
          })
        },
      }))}
    />
  );
};

export const RestoreUpgradeCheckingAddresses = () => {
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletRestoreDialog,
        WalletRestoreDialogContainerProps: {
          generated: restoreWalletProps({
            step: RestoreSteps.TRANSFER_TX_GEN,
            yoroiTransferStep: TransferStatus.CHECKING_ADDRESSES,
          })
        },
      }))}
    />
  );
};

export const RestoreUpgradeGeneratingTx = () => {
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletRestoreDialog,
        WalletRestoreDialogContainerProps: {
          generated: restoreWalletProps({
            step: RestoreSteps.TRANSFER_TX_GEN,
            yoroiTransferStep: TransferStatus.GENERATING_TX,
          })
        },
      }))}
    />
  );
};

export const RestoreUpgradeReadyToTransfer = () => {
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletRestoreDialog,
        WalletRestoreDialogContainerProps: {
          generated: restoreWalletProps({
            step: RestoreSteps.TRANSFER_TX_GEN,
            yoroiTransferStep: TransferStatus.READY_TO_TRANSFER,
          })
        },
      }))}
    />
  );
};

export const RestoreUpgradeError = () => {
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletRestoreDialog,
        WalletRestoreDialogContainerProps: {
          generated: restoreWalletProps({
            step: RestoreSteps.TRANSFER_TX_GEN,
            yoroiTransferError: new GenericApiError(),
            yoroiTransferStep: TransferStatus.ERROR,
          })
        },
      }))}
    />
  );
};

export const RestoreUpgradeNoNeed = () => {
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletRestoreDialog,
        WalletRestoreDialogContainerProps: {
          generated: restoreWalletProps({
            step: RestoreSteps.TRANSFER_TX_GEN,
            yoroiTransferError: new NoInputsError(),
            yoroiTransferStep: TransferStatus.ERROR,
          })
        },
      }))}
    />
  );
};

export const HardwareOptions = () => {
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletConnectHWOptionDialog,
      }))}
    />
  );
};

const trezorPops: {|
  trezorConnect: *,
|} => * = (request) => ({
  stores: {
    profile: {
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

export const TrezorCheck = () => {
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletTrezorConnectDialogContainer,
        WalletTrezorConnectDialogContainerProps: {
          generated: trezorPops({
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


export const TrezorConnect = () => {
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
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletTrezorConnectDialogContainer,
        WalletTrezorConnectDialogContainerProps: {
          generated: trezorPops({
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

export const TrezorSave = () => {
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
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletTrezorConnectDialogContainer,
        WalletTrezorConnectDialogContainerProps: {
          generated: trezorPops({
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
|} => * = (request) => ({
  stores: {
    profile: {
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

export const LedgerCheck = () => {
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletLedgerConnectDialogContainer,
        WalletLedgerConnectDialogContainerProps: {
          generated: ledgerProps({
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


export const LedgerConnect = () => {
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
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletLedgerConnectDialogContainer,
        WalletLedgerConnectDialogContainerProps: {
          generated: ledgerProps({
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

export const LedgerSave = () => {
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
  return (
    <WalletAddPage
      generated={defaultProps(Object.freeze({
        openDialog: WalletLedgerConnectDialogContainer,
        WalletLedgerConnectDialogContainerProps: {
          generated: ledgerProps({
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
