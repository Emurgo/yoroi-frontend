// @flow

import React from 'react';

import { select, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import PaperWalletPage from './PaperWalletPage';
import { withScreenshot } from 'storycap';
import {
  globalKnobs,
  getMnemonicCases,
  getPasswordValidationCases,
} from '../../../../stories/helpers/StoryWrapper';
import { getPaperWalletIntro } from '../../../stores/toplevel/ProfileStore';
import { ProgressStep } from '../../../stores/ada/PaperWalletCreateStore';
import { THEMES } from '../../../themes';
import { PdfGenSteps } from '../../../api/ada/paperWallet/paperWalletPdf';
import { wrapSettings } from '../../../Routes';
import { mockSettingsProps } from '../Settings.mock';
import { getDefaultExplorer } from '../../../domain/Explorer';

export default {
  title: `Container/${nameof(PaperWalletPage)}`,
  component: PaperWalletPage,
  decorators: [withScreenshot],
};

/* ===== Notable variations ===== */

export const NoDialog = () => wrapSettings(
  mockSettingsProps,
  (<PaperWalletPage
    generated={{
      stores: {
        profile: {
          paperWalletsIntro: getPaperWalletIntro(globalKnobs.locale(), ''),
        },
        uiDialogs: {
          isOpen: () => false,
        },
      },
      actions: {
        dialogs: {
          open: { trigger: action('open') },
          updateDataForActiveDialog: { trigger: action('updateDataForActiveDialog') },
        },
      },
      CreatePaperWalletDialogContainerProps: (null: any),
    }}
  />)
);

const mockActions = {
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
    submitUserPassword: { trigger: async () => action('submitUserPassword')() },
    backToCreate: { trigger: action('backToCreate') },
    submitVerify: { trigger: action('submitVerify') },
    submitCreate: { trigger: action('submitCreate') },
    downloadPaperWallet: { trigger: action('downloadPaperWallet') },
  },
};

const OpenDialogBase = {
  stores: {
    profile: {
      paperWalletsIntro: getPaperWalletIntro(globalKnobs.locale(), ''),
    },
    uiDialogs: {
      isOpen: () => true,
    },
  },
  actions: {
    dialogs: {
      open: { trigger: action('open') },
      updateDataForActiveDialog: { trigger: action('updateDataForActiveDialog') },
    },
  },
};

export const UserPasswordDialog = () => wrapSettings(
  mockSettingsProps,
  (<PaperWalletPage
    generated={{
      ...OpenDialogBase,
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
              progressInfo: ProgressStep.USER_PASSWORD,
              userPassword: '',
              pdfRenderStatus: null,
              pdf: null,
            },
          },
          actions: mockActions,
        },
      },
    }}
  />)
);

export const CreateDialog = () => wrapSettings(
  mockSettingsProps,
  (() => {
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
    return (
      <PaperWalletPage
        generated={{
          ...OpenDialogBase,
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
                  progressInfo: ProgressStep.CREATE,
                  userPassword: '',
                  pdfRenderStatus: getRealStep(),
                  pdf: extendedSteps() === modifiedSteps.hasPdf
                    ? new Blob(['this is just fake data'])
                    : null,
                },
              },
              actions: mockActions,
            },
          },
        }}
      />
    );
  })()
);


const constructedPaperWallet = {
  addresses: [
    'Ae2tdPwUPEZCdEXujtvAFSnhqnNsPbd8YoCt5obzpWAH91tbLP6LsHxCVwB',
    'Ae2tdPwUPEZJJzyff4UXcgsaj19twRknh9miCxjsLoAQLt5cpQ3nDnwZKMN',
    'Ae2tdPwUPEZJcoYz71M8SZdsrtvxbsKX9oL1N6j24ULPSY6c5iAPUSAGzgB',
    'Ae2tdPwUPEZ588oVb86pCyANsrPGJZVHU2mqhYqPzLWU1uo6jS2qM1vgn1P',
    'Ae2tdPwUPEZAPUqpvUgoBB7QjrfAbu1RXbFRoLcdYYV8r4FaSJrq4oowAhv',
  ],
  scrambledWords: getMnemonicCases(21).Correct.split(' '),
  accountPlate: {
    hash: '7b9bf637f341bed7933c8673f9fb7e405097746115f24ec7d192f80fb6efb219da8bc1902dab99fc070f156b7877f29dd8e581da616ff7fdad28493d084a0db9',
    id: 'XLBS-6706',
  },
};

export const VerifyDialog = () => wrapSettings(
  mockSettingsProps,
  (() => {
    const mnemonicCases = getMnemonicCases(21);
    const mneonicsValue = () => select(
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
    return (
      <PaperWalletPage
        generated={{
          ...OpenDialogBase,
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
                  progressInfo: ProgressStep.VERIFY,
                  userPassword: correctPassword,
                  pdfRenderStatus: null,
                  pdf: null,
                },
              },
              actions: mockActions,
              verifyDefaultValues: passwordValue() === passwordCases.Empty &&
                mneonicsValue() === mnemonicCases.Empty
                ? undefined
                : {
                  paperPassword: passwordValue(),
                  recoveryPhrase: mneonicsValue(),
                  walletName: '',
                  walletPassword: '',
                }
            },
          },
        }}
      />
    );
  })()
);


export const FinalizeDialog = () => wrapSettings(
  mockSettingsProps,
  (<PaperWalletPage
    generated={{
      ...OpenDialogBase,
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
              progressInfo: ProgressStep.FINALIZE,
              userPassword: '',
              pdfRenderStatus: null,
              pdf: null,
            },
          },
          actions: mockActions,
        },
      },
    }}
  />)
);
