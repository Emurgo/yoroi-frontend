// @flow

import type { Node } from 'react';
import React from 'react';
import { select, boolean, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import WalletSettingsPage from './WalletSettingsPage';
import { withScreenshot } from 'storycap';
import { THEMES } from '../../../themes';
import {
  globalKnobs, genDummyWithCache, genSigningWalletWithCache,
  walletLookup,
} from '../../../../stories/helpers/StoryWrapper';
import { IncorrectWalletPasswordError } from '../../../api/common';
import ChangeWalletPasswordDialogContainer from '../../wallet/dialogs/ChangeWalletPasswordDialogContainer';
import RemoveWalletDialogContainer from './RemoveWalletDialogContainer';
import ResyncWalletDialogContainer from './ResyncWalletDialogContainer';
import { wrapSettings } from '../../../Routes';
import { mockSettingsProps } from '../Settings.mock';
import { ROUTES } from '../../../routes-config';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver';
import WalletSettingsStore from '../../../stores/base/WalletSettingsStore';
import WalletStore from '../../../stores/toplevel/WalletStore';

export default {
  title: `${__filename.split('.')[0]}`,
  component: WalletSettingsPage,
  decorators: [withScreenshot],
};

/* ===== Notable variations ===== */

const defaultSettingsPageProps: {|
  selected: null | PublicDeriver<>,
  getConceptualWalletSettingsCache:
    typeof WalletSettingsStore.prototype.getConceptualWalletSettingsCache,
  getSigningKeyCache:
    typeof WalletStore.prototype.getSigningKeyCache,
|} => * = (request) => ({
  stores: {
    profile: {
      isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
    },
    walletSettings: {
      getConceptualWalletSettingsCache: request.getConceptualWalletSettingsCache,
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
      getSigningKeyCache: request.getSigningKeyCache,
      selected: request.selected,
    },
  },
  actions: {
    walletSettings: {
      startEditingWalletField: { trigger: action('startEditingWalletField') },
      stopEditingWalletField: { trigger: action('stopEditingWalletField') },
      cancelEditingWalletField: { trigger: action('cancelEditingWalletField') },
      renameConceptualWallet: { trigger: async (req) => action('renameConceptualWallet')(req) },
    },
    dialogs: {
      open: { trigger: action('open') },
    },
  },
});

export const NoWallet = (): Node => {
  const wallet = null;
  const lookup = walletLookup([]);
  return wrapSettings(
    mockSettingsProps({
      location: ROUTES.SETTINGS.WALLET,
      selected: wallet,
      ...lookup,
    }),
    (() => {
      const settingPageProps = defaultSettingsPageProps({
        selected: wallet,
        getConceptualWalletSettingsCache: lookup.getConceptualWalletSettingsCache,
        getSigningKeyCache: lookup.getSigningKeyCache,
      });
      return (
        <WalletSettingsPage
          generated={{
            ...settingPageProps,
            // dialog is close so no need to give props
            ChangeWalletPasswordDialogContainerProps: (null: any),
            RemoveWalletDialogContainerProps: (null: any),
            ResyncWalletDialogContainerProps: (null: any),
          }}
        />
      );
    })()
  );
};

export const EditName = (): Node => {
  const wallet = genDummyWithCache();
  const lookup = walletLookup([wallet]);
  return wrapSettings(
    mockSettingsProps({
      location: ROUTES.SETTINGS.WALLET,
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    (() => {
      const settingPageProps = defaultSettingsPageProps({
        selected: wallet.publicDeriver,
        getConceptualWalletSettingsCache: lookup.getConceptualWalletSettingsCache,
        getSigningKeyCache: lookup.getSigningKeyCache,
      });
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
      return (
        <WalletSettingsPage
          generated={{
            ...settingPageProps,
            stores: {
              ...settingPageProps.stores,
              walletSettings: {
                ...settingPageProps.stores.walletSettings,
                lastUpdatedWalletField: nameValue() === nameCases.Done ? 'name' : null,
                walletFieldBeingEdited: nameValue() === nameCases.Editing ? 'name' : null,
              },
            },
            // dialog is close so no need to give props
            ChangeWalletPasswordDialogContainerProps: (null: any),
            RemoveWalletDialogContainerProps: (null: any),
            ResyncWalletDialogContainerProps: (null: any),
          }}
        />
      );
    })()
  );
};

export const PasswordUpdateTime = (): Node => {
  return (() => {
    const lastUpdateCases = {
      Never: 0,
      Previously: 1,
    };
    const lastUpdateValue = () => select(
      'lastUpdateCases',
      lastUpdateCases,
      lastUpdateCases.Never,
    );
    const wallet = genSigningWalletWithCache();
    wallet.getSigningKeyCache = (publicDeriver) => ({
      publicDeriver,
      signingKeyUpdateDate: lastUpdateValue() === lastUpdateCases.Never
        ? null
        : new Date(0),
    });
    const lookup = walletLookup([wallet]);
    return wrapSettings(
      mockSettingsProps({
        location: ROUTES.SETTINGS.WALLET,
        selected: wallet.publicDeriver,
        ...lookup,
      }),
      (() => {
        const settingPageProps = defaultSettingsPageProps({
          selected: wallet.publicDeriver,
          getConceptualWalletSettingsCache: lookup.getConceptualWalletSettingsCache,
          getSigningKeyCache: lookup.getSigningKeyCache,
        });
        return (
          <WalletSettingsPage
            generated={{
              ...settingPageProps,
              stores: {
                ...settingPageProps.stores,
                wallets: {
                  ...settingPageProps.stores.wallets,
                  getSigningKeyCache: lookup.getSigningKeyCache,
                },
              },
              // dialog is close so no need to give props
              ChangeWalletPasswordDialogContainerProps: (null: any),
              RemoveWalletDialogContainerProps: (null: any),
              ResyncWalletDialogContainerProps: (null: any),
            }}
          />
        );
      })()
    );
  })();
};

export const ResyncWallet = (): Node => {
  const wallet = genDummyWithCache();
  const lookup = walletLookup([wallet]);
  return wrapSettings(
    mockSettingsProps({
      location: ROUTES.SETTINGS.WALLET,
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    (() => {
      const settingPageProps = defaultSettingsPageProps({
        selected: wallet.publicDeriver,
        getConceptualWalletSettingsCache: lookup.getConceptualWalletSettingsCache,
        getSigningKeyCache: lookup.getSigningKeyCache,
      });
      return (
        <WalletSettingsPage
          generated={{
            ...settingPageProps,
            stores: {
              ...settingPageProps.stores,
              uiDialogs: {
                ...settingPageProps.stores.uiDialogs,
                isOpen: (clazz) => clazz === ResyncWalletDialogContainer,
              },
            },
            // dialog is close so no need to give props
            ChangeWalletPasswordDialogContainerProps: (null: any),
            RemoveWalletDialogContainerProps: (null: any),
            ResyncWalletDialogContainerProps: {
              generated: {
                stores: {
                  walletSettings: {
                    clearHistory: {
                      reset: action('clearHistory reset'),
                      isExecuting: boolean('isExecuting', false),
                      error: undefined,
                    },
                  }
                },
                actions: {
                  walletSettings: {
                    resyncHistory: { trigger: async (req) => action('resyncHistory')(req) },
                  },
                  dialogs: {
                    closeActiveDialog: { trigger: action('closeActiveDialog') },
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

const defaultChangeWalletPasswordDialogContainerProps: void => * = (_request) => ({
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
      updateSigningPassword: { trigger: async (req) => action('updateSigningPassword')(req) },
    },
    dialogs: {
      updateDataForActiveDialog: { trigger: action('updateDataForActiveDialog') },
      closeActiveDialog: { trigger: action('closeActiveDialog') },
    },
  },
});

export const EditPassword = (): Node => {
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);
  return wrapSettings(
    mockSettingsProps({
      location: ROUTES.SETTINGS.WALLET,
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    (() => {
      const settingPageProps = defaultSettingsPageProps({
        selected: wallet.publicDeriver,
        getConceptualWalletSettingsCache: lookup.getConceptualWalletSettingsCache,
        getSigningKeyCache: lookup.getSigningKeyCache,
      });
      const defaultProps = defaultChangeWalletPasswordDialogContainerProps();
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

      return (
        <WalletSettingsPage
          generated={{
            ...settingPageProps,
            stores: {
              ...settingPageProps.stores,
              uiDialogs: {
                ...settingPageProps.stores.uiDialogs,
                isOpen: (clazz) => clazz === ChangeWalletPasswordDialogContainer,
              },
              wallets: {
                ...settingPageProps.stores.wallets,
                getSigningKeyCache: lookup.getSigningKeyCache,
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
                      isExecuting: boolean('changeSigningKeyRequest isExecuting', false),
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
            RemoveWalletDialogContainerProps: (null: any),
            ResyncWalletDialogContainerProps: (null: any),
          }}
        />
      );
    })()
  );
};

export const RemoveWallet = (): Node => {
  const wallet = genDummyWithCache();
  const lookup = walletLookup([wallet]);
  return wrapSettings(
    mockSettingsProps({
      location: ROUTES.SETTINGS.WALLET,
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    (() => {
      const settingPageProps = defaultSettingsPageProps({
        selected: wallet.publicDeriver,
        getConceptualWalletSettingsCache: lookup.getConceptualWalletSettingsCache,
        getSigningKeyCache: lookup.getSigningKeyCache,
      });
      return (
        <WalletSettingsPage
          generated={{
            ...settingPageProps,
            stores: {
              ...settingPageProps.stores,
              uiDialogs: {
                ...settingPageProps.stores.uiDialogs,
                isOpen: (clazz) => clazz === RemoveWalletDialogContainer,
              },
            },
            ChangeWalletPasswordDialogContainerProps: (null: any),
            RemoveWalletDialogContainerProps: {
              generated: {
                stores: {
                  walletSettings: {
                    removeWalletRequest: {
                      reset: action('removeWalletRequest reset'),
                      error: undefined,
                      isExecuting: boolean('isExecuting', false),
                    },
                  },
                },
                actions: {
                  walletSettings: {
                    removeWallet: { trigger: async (req) => action('removeWallet')(req) },
                  },
                  dialogs: {
                    closeActiveDialog: { trigger: action('closeActiveDialog') },
                  },
                },
              },
            },
            ResyncWalletDialogContainerProps: (null: any),
          }}
        />
      );
    })()
  );
};
