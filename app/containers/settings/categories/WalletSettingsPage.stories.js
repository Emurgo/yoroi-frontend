// @flow

import React from 'react';
import { select, boolean, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import WalletSettingsPage from './WalletSettingsPage';
import { withScreenshot } from 'storycap';
import { THEMES } from '../../../themes';
import {
  globalKnobs, getDummyWallet, getSigningWallet,
  registerLookup, walletLookup,
} from '../../../../stories/helpers/StoryWrapper';
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

const defaultSettingsPageProps = (cacheKey: symbol) => ({
  stores: {
    profile: {
      isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
    },
    walletSettings: {
      getConceptualWalletSettingsCache:
        walletLookup(cacheKey)().getConceptualWalletSettingsCache,
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
      getSigningKeyCache: (publicDeriver) => ({
        publicDeriver,
        signingKeyUpdateDate: null,
      }),
      selected: walletLookup(cacheKey)().selected,
      // TODO getSigningKeyCache
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
});

export const EditName = () => {
  const EditNameSymbol = Symbol('EditName');
  (() => {
    const dummyWallet = getDummyWallet();
    registerLookup(EditNameSymbol, [{
      publicDeriver: dummyWallet,
      conceptualWalletCache: {
        conceptualWallet: dummyWallet.getParent(),
        conceptualWalletName: 'Test wallet',
      },
    }]);
  })();
  return wrapSettings(
    mockSettingsProps(EditNameSymbol),
    (() => {
      const nameCases = {
        Untouched: 0,
        Editing: 1,
        Done: 2,
      };
      const nameValue = () => select(
        'nameCases',
        nameCases,
        nameCases.Untouched,
      );
      const settingPageProps = defaultSettingsPageProps(EditNameSymbol);
      return (
        <WalletSettingsPage
          generated={{
            ...defaultSettingsPageProps(EditNameSymbol),
            stores: {
              ...settingPageProps.stores,
              walletSettings: {
                ...settingPageProps.stores.walletSettings,
                lastUpdatedWalletField: nameValue() === nameCases.Done ? 'name' : null,
                walletFieldBeingEdited: nameValue() === nameCases.Editing ? 'name' : null,
              },
            },
            ChangeWalletPasswordDialogContainerProps: (null: any),
          }}
        />
      );
    })()
  );
};

export const PasswordUpdateTime = () => {
  const PasswordUpdateSymbol = Symbol('PasswordUpdateTime');
  (() => {
    const signingWallet = getSigningWallet();
    registerLookup(PasswordUpdateSymbol, [{
      publicDeriver: signingWallet,
      conceptualWalletCache: {
        conceptualWallet: signingWallet.getParent(),
        conceptualWalletName: 'Signing Wallet',
      },
    }]);
  })();
  return wrapSettings(
    mockSettingsProps(PasswordUpdateSymbol),
    (() => {
      const lastUpdateCases = {
        Never: 0,
        Previously: 1,
      };
      const lastUpdateValue = () => select(
        'lastUpdateCases',
        lastUpdateCases,
        lastUpdateCases.Never,
      );
      const settingPageProps = defaultSettingsPageProps(PasswordUpdateSymbol);
      return (
        <WalletSettingsPage
          generated={{
            ...defaultSettingsPageProps(PasswordUpdateSymbol),
            stores: {
              ...settingPageProps.stores,
              wallets: {
                ...settingPageProps.stores.wallets,
                getSigningKeyCache: (publicDeriver) => ({
                  publicDeriver,
                  signingKeyUpdateDate: lastUpdateValue() === lastUpdateCases.Never
                    ? null
                    : new Date(0),
                }),
              },
            },
            ChangeWalletPasswordDialogContainerProps: (null: any),
          }}
        />
      );
    })()
  );
};

export const ResyncWallet = () => {
  const ResyncWalletSymbol = Symbol('ResyncWallet');
  (() => {
    const dummyWallet = getDummyWallet();
    registerLookup(ResyncWalletSymbol, [{
      publicDeriver: dummyWallet,
      conceptualWalletCache: {
        conceptualWallet: dummyWallet.getParent(),
        conceptualWalletName: 'Test wallet',
      },
    }]);
  })();
  return wrapSettings(
    mockSettingsProps(ResyncWalletSymbol),
    (() => {
      const settingPageProps = defaultSettingsPageProps(ResyncWalletSymbol);
      return (
        <WalletSettingsPage
          generated={{
            ...defaultSettingsPageProps(ResyncWalletSymbol),
            stores: {
              ...settingPageProps.stores,
              walletSettings: {
                ...settingPageProps.stores.walletSettings,
                clearHistory: {
                  ...settingPageProps.stores.walletSettings.clearHistory,
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
};

const defaultChangeWalletPasswordDialogContainerProps = (cacheKey: symbol) => ({
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
      selected: walletLookup(cacheKey)().selected,
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
});

export const EditPassword = () => {
  const EditPasswordSymbol = Symbol('EditPassword');
  (() => {
    const signingWallet = getSigningWallet();
    registerLookup(EditPasswordSymbol, [{
      publicDeriver: signingWallet,
      conceptualWalletCache: {
        conceptualWallet: signingWallet.getParent(),
        conceptualWalletName: 'Signing Wallet',
      },
    }]);
  })();
  return wrapSettings(
    mockSettingsProps(EditPasswordSymbol),
    (() => {
      const errorCases = {
        None: undefined,
        WrongPassword: new IncorrectWalletPasswordError(),
      };
      const errorValue = () => select(
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
      const passwordValue = () => select(
        'passwordCases',
        passwordCases,
        passwordCases.Untouched,
      );
      const getCurrentPassword = () => {
        const val = passwordValue();
        return val === passwordCases.All ? 'asdfasdfasdf' : '';
      };
      const getNewPassword = () => {
        const val = passwordValue();
        if (val === passwordCases.All) return 'asdfasdfasdf';
        if (val === passwordCases.Correct) return 'asdfasdfasdf';
        if (val === passwordCases.MisMatch) return 'asdfasdfasdf';
        if (val === passwordCases.TooShort) return 'a';
        return '';
      };
      const getRepeatPassword = () => {
        const val = passwordValue();
        if (val === passwordCases.All) return 'asdfasdfasdf';
        if (val === passwordCases.Correct) return 'asdfasdfasdf';
        if (val === passwordCases.MisMatch) return 'zxcvzxcvzxcv';
        if (val === passwordCases.TooShort) return 'a';
        return '';
      };

      const defaultProps = defaultChangeWalletPasswordDialogContainerProps(EditPasswordSymbol);
      const settingPageProps = defaultSettingsPageProps(EditPasswordSymbol);
      return (
        <WalletSettingsPage
          generated={{
            ...defaultSettingsPageProps(EditPasswordSymbol),
            stores: {
              ...settingPageProps.stores,
              uiDialogs: {
                ...settingPageProps.stores.uiDialogs,
                isOpen: (clazz) => clazz === ChangeWalletPasswordDialogContainer,
              },
              wallets: {
                ...settingPageProps.stores.wallets,
                getSigningKeyCache: (publicDeriver) => ({
                  publicDeriver,
                  signingKeyUpdateDate: null,
                }),
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
                      error: errorValue() === errorCases.None ? undefined : errorValue(),
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
};

export const RemoveWallet = () => {
  const RemoveWalletSymbol = Symbol('RemoveWallet');
  (() => {
    const dummyWallet = getDummyWallet();
    registerLookup(RemoveWalletSymbol, [{
      publicDeriver: dummyWallet,
      conceptualWalletCache: {
        conceptualWallet: dummyWallet.getParent(),
        conceptualWalletName: 'Test wallet',
      },
    }]);
  })();
  return wrapSettings(
    mockSettingsProps(RemoveWalletSymbol),
    (() => {
      const defaultProps = defaultChangeWalletPasswordDialogContainerProps(RemoveWalletSymbol);
      const settingPageProps = defaultSettingsPageProps(RemoveWalletSymbol);
      return (
        <WalletSettingsPage
          generated={{
            ...defaultSettingsPageProps(RemoveWalletSymbol),
            stores: {
              ...settingPageProps.stores,
              uiDialogs: {
                ...settingPageProps.stores.uiDialogs,
                isOpen: (clazz) => clazz === RemoveWalletDialog,
              },
              walletSettings: {
                ...settingPageProps.stores.walletSettings,
                removeWalletRequest: {
                  ...settingPageProps.stores.walletSettings.removeWalletRequest,
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
};
