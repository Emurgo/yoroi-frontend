// @flow

import React from 'react';

import { select, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import PaperWalletPage from './PaperWalletPage';
import { withScreenshot } from 'storycap';
import { getPaperWalletIntro } from '../../../stores/toplevel/ProfileStore';
import { ProgressStep } from '../../../stores/ada/PaperWalletCreateStore';
import { THEMES } from '../../../themes';
import { PdfGenSteps } from '../../../api/ada/paperWallet/paperWalletPdf';
import { wrapSettings } from '../../../Routes';
import { mockSettingsProps } from '../Settings.mock';
import { getDefaultExplorer } from '../../../domain/Explorer';
import {
  getValidationMnemonicCases,
  getPasswordValidationCases,
  globalKnobs,
  walletLookup,
} from '../../../../stories/helpers/StoryWrapper';
import { ROUTES } from '../../../routes-config';

export default {
  title: `${__filename.split('.')[0]}`,
  component: PaperWalletPage,
  decorators: [withScreenshot],
};

/* ===== Notable variations ===== */

export const NoDialog = () => {
  const lookup = walletLookup([]);
  return wrapSettings(
    mockSettingsProps({
      location: ROUTES.SETTINGS.PAPER_WALLET,
      selected: null,
      ...lookup,
    }),
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
};

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
    submitUserPassword: { trigger: async (req) => action('submitUserPassword')(req) },
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

export const UserPasswordDialog = () => {
  const lookup = walletLookup([]);
  return wrapSettings(
    mockSettingsProps({
      location: ROUTES.SETTINGS.PAPER_WALLET,
      selected: null,
      ...lookup,
    }),
    (() => {
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
                    progressInfo: ProgressStep.USER_PASSWORD,
                    userPassword: '',
                    pdfRenderStatus: null,
                    pdf: null,
                  },
                },
                actions: mockActions,
                verifyDefaultValues: undefined,
              },
            },
          }}
        />
      );
    })()
  );
};

export const CreateDialog = () => {
  const lookup = walletLookup([]);
  return wrapSettings(
    mockSettingsProps({
      location: ROUTES.SETTINGS.PAPER_WALLET,
      selected: null,
      ...lookup,
    }),
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
                verifyDefaultValues: undefined,
              },
            },
          }}
        />
      );
    })()
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
    hash: '7b9bf637f341bed7933c8673f9fb7e405097746115f24ec7d192f80fb6efb219da8bc1902dab99fc070f156b7877f29dd8e581da616ff7fdad28493d084a0db9',
    id: 'XLBS-6706',
  },
};

export const VerifyDialog = () => {
  const lookup = walletLookup([]);
  return wrapSettings(
    mockSettingsProps({
      location: ROUTES.SETTINGS.PAPER_WALLET,
      selected: null,
      ...lookup,
    }),
    (() => {
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
          }}
        />
      );
    })()
  );
};

export const FinalizeDialog = () => {
  const lookup = walletLookup([]);
  return wrapSettings(
    mockSettingsProps({
      location: ROUTES.SETTINGS.PAPER_WALLET,
      selected: null,
      ...lookup,
    }),
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
            verifyDefaultValues: undefined,
          },
        },
      }}
    />)
  );
};
