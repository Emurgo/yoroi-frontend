// @flow

import React from 'react';
import { select, boolean, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import WalletSettingsPage from './WalletSettingsPage';
import { withScreenshot } from 'storycap';
import { THEMES } from '../../../themes';
import { globalKnobs, getDummyWallet } from '../../../../stories/helpers/StoryWrapper';
import { IncorrectWalletPasswordError } from '../../../api/common';
import ChangeWalletPasswordDialogContainer from '../../wallet/dialogs/ChangeWalletPasswordDialogContainer';
import RemoveWalletDialog from '../../../components/wallet/settings/RemoveWalletDialog';
import { wrapSettings } from '../../../Routes';
import { mockSettingsProps } from '../Settings.mock';

export default {
  title: `Container/${nameof(WalletSettingsPage)}`,
  component: WalletSettingsPage,
  decorators: [withScreenshot],
};

/* ===== Notable variations ===== */

const defaultSettingsPageProps = {
  stores: {
    profile: {
      isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
    },
    walletSettings: {
      removeWalletRequest: {
        reset: action('removeWalletRequest reset'),
        isExecuting: false,
        error: undefined,
      },
      clearHistory: {
        reset: action('clearHistory reset'),
        isExecuting: false,
      },
      renameModelRequest: {
        error: undefined,
        isExecuting: false,
        wasExecuted: false,
        result: undefined,
      },
      lastUpdatedWalletField: null,
      walletFieldBeingEdited: null,
    },
    uiDialogs: {
      isOpen: () => false,
    },
    wallets: {
      selected: getDummyWallet(),
    },
  },
  actions: {
    walletSettings: {
      startEditingWalletField: { trigger: action('startEditingWalletField') },
      stopEditingWalletField: { trigger: action('stopEditingWalletField') },
      cancelEditingWalletField: { trigger: action('cancelEditingWalletField') },
      renameConceptualWallet: { trigger: async () => action('renameConceptualWallet')() },
      resyncHistory: { trigger: async () => action('resyncHistory')() },
      removeWallet: { trigger: async () => action('removeWallet')() },
    },
    dialogs: {
      open: { trigger: action('open') },
      closeActiveDialog: { trigger: action('closeActiveDialog') },
    },
  },
};
export const EditName = () => wrapSettings(
  mockSettingsProps,
  (() => {
    const nameCases = {
      Untouched: 0,
      Editing: 1,
      Done: 2,
    };
    const nameValue = select(
      'nameCases',
      nameCases,
      nameCases.Untouched,
    );
    return (
      <WalletSettingsPage
        generated={{
          ...defaultSettingsPageProps,
          stores: {
            ...defaultSettingsPageProps.stores,
            walletSettings: {
              ...defaultSettingsPageProps.stores.walletSettings,
              lastUpdatedWalletField: nameValue === nameCases.Done ? 'name' : null,
              walletFieldBeingEdited: nameValue === nameCases.Editing ? 'name' : null,
            },
          },
          ChangeWalletPasswordDialogContainerProps: (null: any),
        }}
      />
    );
  })()
);

export const PasswordUpdateTime = wrapSettings(
  mockSettingsProps,
  (() => {
    return (
      <WalletSettingsPage
        generated={{
          ...defaultSettingsPageProps,
          stores: {
            ...defaultSettingsPageProps.stores,
            wallets: {
              ...defaultSettingsPageProps.stores.wallets,
              selected: getDummyWallet({
                signingKeyUpdateDate: new Date(0),
              }),
            },
          },
          ChangeWalletPasswordDialogContainerProps: (null: any),
        }}
      />
    );
  })()
);

export const ResyncWallet = () => wrapSettings(
  mockSettingsProps,
  (() => {
    return (
      <WalletSettingsPage
        generated={{
          ...defaultSettingsPageProps,
          stores: {
            ...defaultSettingsPageProps.stores,
            walletSettings: {
              ...defaultSettingsPageProps.stores.walletSettings,
              clearHistory: {
                ...defaultSettingsPageProps.stores.walletSettings.clearHistory,
                isExecuting: true,
              },
            },
          },
          ChangeWalletPasswordDialogContainerProps: (null: any),
        }}
      />
    );
  })()
);

const defaultChangeWalletPasswordDialogContainerProps = {
  stores: {
    walletSettings: {
      changeSigningKeyRequest: {
        reset: action('changeSigningKeyRequest reset'),
        isExecuting: false,
        error: undefined,
      },
    },
    profile: {
      isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
    },
    wallets: {
      selected: getDummyWallet(),
    },
    uiDialogs: {
      dataForActiveDialog: {
        currentPasswordValue: '',
        newPasswordValue: '',
        repeatedPasswordValue: '',
      },
    },
  },
  actions: {
    walletSettings: {
      updateSigningPassword: { trigger: async () => action('updateSigningPassword')() },
    },
    dialogs: {
      updateDataForActiveDialog: { trigger: action('updateDataForActiveDialog') },
      closeActiveDialog: { trigger: action('closeActiveDialog') },
    },
  },
};

export const EditPassword = () => wrapSettings(
  mockSettingsProps,
  (() => {
    const errorCases = {
      None: undefined,
      WrongPassword: new IncorrectWalletPasswordError(),
    };
    const errorValue = select(
      'errorCases',
      errorCases,
      errorCases.None,
    );
    const passwordCases = {
      Untouched: 0,
      TooShort: 1,
      MisMatch: 2,
      Correct: 3,
      All: 4,
    };
    const passwordValue = select(
      'passwordCases',
      passwordCases,
      passwordCases.Untouched,
    );
    const getCurrentPassword = () => {
      return passwordValue === passwordCases.All ? 'asdfasdfasdf' : '';
    };
    const getNewPassword = () => {
      if (passwordValue === passwordCases.All) return 'asdfasdfasdf';
      if (passwordValue === passwordCases.Correct) return 'asdfasdfasdf';
      if (passwordValue === passwordCases.MisMatch) return 'asdfasdfasdf';
      if (passwordValue === passwordCases.TooShort) return 'a';
      return '';
    };
    const getRepeatPassword = () => {
      if (passwordValue === passwordCases.All) return 'asdfasdfasdf';
      if (passwordValue === passwordCases.Correct) return 'asdfasdfasdf';
      if (passwordValue === passwordCases.MisMatch) return 'zxcvzxcvzxcv';
      return '';
    };

    const defaultProps = defaultChangeWalletPasswordDialogContainerProps;
    return (
      <WalletSettingsPage
        generated={{
          ...defaultSettingsPageProps,
          stores: {
            ...defaultSettingsPageProps.stores,
            uiDialogs: {
              ...defaultSettingsPageProps.stores.uiDialogs,
              isOpen: (clazz) => clazz === ChangeWalletPasswordDialogContainer,
            },
          },
          ChangeWalletPasswordDialogContainerProps: {
            generated: {
              ...defaultProps,
              stores: {
                ...defaultProps.stores,
                walletSettings: {
                  ...defaultProps.stores.walletSettings,
                  changeSigningKeyRequest: {
                    ...defaultProps.stores.walletSettings.changeSigningKeyRequest,
                    isExecuting: boolean('changeSigningKeyRequest isExecuting'),
                    error: errorValue === errorCases.None ? undefined : errorValue,
                  },
                },
                uiDialogs: {
                  ...defaultProps.stores.uiDialogs,
                  dataForActiveDialog: {
                    ...defaultProps.stores.uiDialogs.dataForActiveDialog,
                    currentPasswordValue: getCurrentPassword(),
                    newPasswordValue: getNewPassword(),
                    repeatedPasswordValue: getRepeatPassword(),
                  },
                },
              },
            },
          },
        }}
      />
    );
  })()
);

export const RemoveWallet = () => wrapSettings(
  mockSettingsProps,
  (() => {
    const defaultProps = defaultChangeWalletPasswordDialogContainerProps;
    return (
      <WalletSettingsPage
        generated={{
          ...defaultSettingsPageProps,
          stores: {
            ...defaultSettingsPageProps.stores,
            uiDialogs: {
              ...defaultSettingsPageProps.stores.uiDialogs,
              isOpen: (clazz) => clazz === RemoveWalletDialog,
            },
            walletSettings: {
              ...defaultSettingsPageProps.stores.walletSettings,
              removeWalletRequest: {
                ...defaultSettingsPageProps.stores.walletSettings.removeWalletRequest,
                isExecuting: boolean('isExecuting', false),
              },
            },
          },
          ChangeWalletPasswordDialogContainerProps: {
            generated: {
              ...defaultProps,
            },
          },
        }}
      />
    );
  })()
);
