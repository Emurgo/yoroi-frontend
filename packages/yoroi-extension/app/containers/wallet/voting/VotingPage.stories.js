// @flow

import type { Node } from 'react';
import React from 'react';

import { select, boolean } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withScreenshot } from 'storycap';
import {
  genShelleyCIP1852SigningWalletWithCache,
  genVotingShelleyTx,
} from '../../../../stories/helpers/cardano/ShelleyCip1852Mocks';
import { THEMES } from '../../../themes';
import { mockWalletProps } from '../Wallet.mock';
import {
  globalKnobs,
  mockLedgerMeta,
} from '../../../../stories/helpers/StoryWrapper';
import { InvalidWitnessError } from '../../../api/common/errors';
import {
  walletLookup,
} from '../../../../stories/helpers/WalletCache';
import { wrapWallet } from '../../../Routes';
import { ROUTES } from '../../../routes-config';
import { buildRoute } from '../../../utils/routing';
import { StepState } from '../../../components/widgets/ProgressSteps';
import { ProgressStep } from '../../../stores/ada/VotingStore';
import VotingPage from './VotingPage';
import VotingRegistrationDialogContainer from '../dialogs/voting/VotingRegistrationDialogContainer';
import { mockFromDefaults } from '../../../stores/toplevel/TokenInfoStore';
import { defaultAssets, } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import BigNumber from 'bignumber.js';
import type { ShelleyCip1852CacheValue } from '../../../../stories/helpers/cardano/ShelleyCip1852Mocks';
import { CATALYST_MIN_AMOUNT } from '../../../config/numbersConfig';
import globalMessages from '../../../i18n/global-messages';

export default {
  title: `${__filename.split('.')[0]}`,
  component: VotingPage,
  decorators: [withScreenshot],
};

const getRoute = (id) => buildRoute(
  ROUTES.WALLETS.CATALYST_VOTING,
  { id, }
);

const defaultProps: ({|
  wallet: *,
  openDialog?: Object,
  VotingRegistrationDialogProps?: *,
  balance: ?MultiToken,
  hasAnyPending: boolean,
|}) => * = request => ({
  balance: request.balance,
  hasAnyPending: request.hasAnyPending,
  stores: {
    uiDialogs: {
      isOpen: clazz => clazz === request.openDialog,
    },
    wallets: {
      selected: request.wallet.publicDeriver,
    },
    tokenInfoStore: {
      tokenInfo: mockFromDefaults(defaultAssets),
    },
    delegation: {
      getDelegationRequests: walletLookup([request.wallet]).getDelegation,
    },
  },
  actions: {
    dialogs: {
      closeActiveDialog: {
        trigger: action('closeActiveDialog'),
      },
      open: {
        trigger: action('open'),
      },
    },
  },
  VotingRegistrationDialogProps: request.VotingRegistrationDialogProps || (null: any),
});

const genVotingRegistrationDialogProps: ({|
  progressInfo: *,
  TransactionDialogProps?: *,
  RegisterDialogProps?: *,
|}) => * = request => ({
  stores: {
    profile: {
      isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
    },
    substores: {
      ada: {
        votingStore: {
          progressInfo: request.progressInfo,
          pin: [1, 2, 3, 4],
          encryptedKey: 'some-encrypted-data',
        },
      },
    },
  },
  actions: {
    ada: {
      votingActions: {
        submitGenerate: {
          trigger: action('submitGenerate'),
        },
        goBackToGenerate: {
          trigger: action('submitGenerate'),
        },
        submitConfirm: {
          trigger: action('submitGenerate'),
        },
        submitConfirmError: {
          trigger: action('submitConfirmError'),
        },
        submitRegister: {
          trigger: action('submitRegister'),
        },
        submitRegisterError: {
          trigger: action('submitRegisterError'),
        },
        goBackToRegister: {
          trigger: action('goBackToRegister'),
        },
        submitTransaction: {
          trigger: action('submitTransaction'),
        },
        submitTransactionError: {
          trigger: action('submitTransactionError'),
        },
        finishQRCode: {
          trigger: action('finishQRCode'),
        },
        cancel: {
          trigger: action('cancel'),
        },
      },
    },
    generateCatalystKey: {
      trigger: async (req) => action('generateCatalystKey')(req),
    },
  },
  TransactionDialogProps: request.TransactionDialogProps || (null: any),
  RegisterDialogProps: request.RegisterDialogProps || (null: any),
  stepsList: [
    globalMessages.stepPin,
    globalMessages.stepConfirm,
    globalMessages.registerLabel,
    globalMessages.transactionLabel,
    globalMessages.stepQrCode,
  ],
})

const genRegisterDialogProps: ({|
  progressInfo: *,
  error: *,
  shelleyTrx: *,
|}) => * = request => ({
  actions: {
    ada: {
      votingTransaction: {
        createTransaction: {
          trigger: async (req) => action('createTransaction')(req),
        },
      },
    },
  },
  stores: {
    substores: {
      ada: {
        votingStore: {
          isActionProcessing: boolean('isActionProcessing', false),
          progressInfo: request.progressInfo,
          error: request.error,
        },
        votingRegTransaction: {
          createVotingRegTx: {
            result: request.shelleyTrx,
            error: request.error,
            isExecuting: boolean('isExecuting', false),
          },
        },
      },
    },
  },
})

const genTransactionDialogProps: ({|
  progressInfo: *,
  error: *,
  shelleyTrx: *,
  wallet: *,
|}) => * = request => ({
  actions: {
    ada: {
      votingTransaction: {
        signTransaction: {
          trigger: async (req) => action('signTransaction')(req),
        },
      },
    },
  },
  stores: {
    tokenInfoStore: {
      tokenInfo: mockFromDefaults(defaultAssets),
    },
    wallets: {
      selected: request.wallet.publicDeriver,
      sendMoneyRequest: {
        error: request.error,
        isExecuting: boolean('isExecuting', false),
      },
    },
    substores: {
      ada: {
        votingStore: {
          progressInfo: request.progressInfo,
          error: request.error,
        },
        votingRegTransactionStore: {
          isStale: boolean('isStale', false),
          createVotingRegTx: {
            result: request.shelleyTrx,
            error: request.error,
            isExecuting: boolean('isExecuting', false),
          },
        },
      },
    },
  },
})

const wrappedComponent = (component: Node): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  const lookup = walletLookup([wallet]);

  return wrapWallet(
    mockWalletProps({
      location: getRoute(wallet.publicDeriver.getPublicDeriverId()),
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    (component)
  );
};

const getInsufficientFunds = (wallet: ShelleyCip1852CacheValue): MultiToken => {
  return new MultiToken(
    [{
      identifier: wallet.publicDeriver.getParent().getDefaultToken().defaultIdentifier,
      networkId: wallet.publicDeriver.getParent().getDefaultToken().defaultNetworkId,
      amount: new BigNumber(5 * 1_000_000),
    }],
    wallet.publicDeriver.getParent().getDefaultToken()
  );
}
const getSufficientFunds = (wallet: ShelleyCip1852CacheValue): MultiToken => {
  return new MultiToken(
    [{
      identifier: wallet.publicDeriver.getParent().getDefaultToken().defaultIdentifier,
      networkId: wallet.publicDeriver.getParent().getDefaultToken().defaultNetworkId,
      amount: CATALYST_MIN_AMOUNT,
    }],
    wallet.publicDeriver.getParent().getDefaultToken()
  );
}

export const Loading = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  return wrappedComponent(
    <VotingPage
      generated={
        defaultProps(Object.freeze({
          wallet,
          balance: getSufficientFunds(wallet),
          hasAnyPending: false,
        }))
      }
    />)
};

export const InsufficientFunds = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  return wrappedComponent(
    <VotingPage
      generated={
        defaultProps(Object.freeze({
          wallet,
          balance: getInsufficientFunds(wallet),
          hasAnyPending: false,
        }))
      }
    />)
};

export const UnsupportedWallet = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache(ConceptualWalletId => ({
    ConceptualWalletId,
    ...mockLedgerMeta
  }));
  return wrappedComponent(
    <VotingPage
      generated={
        defaultProps(Object.freeze({
          wallet,
          balance: getSufficientFunds(wallet),
          hasAnyPending: false,
        }))
      }
    />)
};

export const PendingTransaction = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  return wrappedComponent(
    <VotingPage
      generated={
        defaultProps(Object.freeze({
          wallet,
          balance: getSufficientFunds(wallet),
          hasAnyPending: true,
        }))
      }
    />)
};

export const MainPage = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  return wrappedComponent(
    <VotingPage
      generated={
        defaultProps(Object.freeze({
          wallet,
          balance: getSufficientFunds(wallet),
          hasAnyPending: false,
        }))
      }
    />)
};

export const Pin = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  return wrappedComponent(
    <VotingPage
      generated={defaultProps(Object.freeze({
        openDialog: VotingRegistrationDialogContainer,
        wallet,
        balance: getSufficientFunds(wallet),
        hasAnyPending: false,
        VotingRegistrationDialogProps: {
          generated: genVotingRegistrationDialogProps({
            progressInfo: {
              currentStep: ProgressStep.GENERATE,
              stepState: StepState.LOAD,
            }
          })
        }
      }))}
    />
  )
}

export const ConfirmPin = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  return wrappedComponent(
    <VotingPage
      generated={defaultProps(Object.freeze({
        openDialog: VotingRegistrationDialogContainer,
        wallet,
        balance: getSufficientFunds(wallet),
        hasAnyPending: false,
        VotingRegistrationDialogProps: {
          generated: genVotingRegistrationDialogProps({
            progressInfo: {
              currentStep: ProgressStep.CONFIRM,
              stepState: StepState.LOAD,
            }
          })
        }
      }))}
    />
  )
}

export const Register = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  const tentativeTx = genVotingShelleyTx(wallet.publicDeriver);
  const errorCases = Object.freeze({
    None: undefined,
    InvalidWitness: new InvalidWitnessError(),
  });
  const getErrorValue = () => select(
    'errorCases',
    errorCases,
    errorCases.None
  );
  return wrappedComponent(
    <VotingPage
      generated={defaultProps(Object.freeze({
        openDialog: VotingRegistrationDialogContainer,
        wallet,
        balance: getSufficientFunds(wallet),
        hasAnyPending: false,
        VotingRegistrationDialogProps: {
          generated: genVotingRegistrationDialogProps({
            progressInfo: {
              currentStep: ProgressStep.REGISTER,
              stepState: StepState.LOAD,
            },

            RegisterDialogProps: {
              generated: genRegisterDialogProps({
                progressInfo: {
                  currentStep: ProgressStep.REGISTER,
                  stepState: StepState.LOAD,
                },
                error: getErrorValue(),
                shelleyTrx: tentativeTx,
              })
            }
          })
        }
      }))}
    />
  )
}


export const Transaction = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  const tentativeTx = genVotingShelleyTx(wallet.publicDeriver);
  const errorCases = Object.freeze({
    None: undefined,
    InvalidWitness: new InvalidWitnessError(),
  });
  const getErrorValue = () => select(
    'errorCases',
    errorCases,
    errorCases.None
  );
  return wrappedComponent(
    <VotingPage
      generated={defaultProps(Object.freeze({
        openDialog: VotingRegistrationDialogContainer,
        wallet,
        balance: getSufficientFunds(wallet),
        hasAnyPending: false,
        VotingRegistrationDialogProps: {
          generated: genVotingRegistrationDialogProps({
            progressInfo: {
              currentStep: ProgressStep.TRANSACTION,
              stepState: StepState.LOAD,
            },

            TransactionDialogProps: {
              generated: genTransactionDialogProps({
                progressInfo: {
                  currentStep: ProgressStep.TRANSACTION,
                  stepState: StepState.LOAD,
                },
                error: getErrorValue(),
                shelleyTrx: tentativeTx,
                wallet,
              })
            }
          })
        }
      }))}
    />
  )
}

export const QrCode = (): Node => {
  const wallet = genShelleyCIP1852SigningWalletWithCache();
  return wrappedComponent(
    <VotingPage
      generated={defaultProps(Object.freeze({
        openDialog: VotingRegistrationDialogContainer,
        wallet,
        balance: getSufficientFunds(wallet),
        hasAnyPending: false,
        VotingRegistrationDialogProps: {
          generated: genVotingRegistrationDialogProps({
            progressInfo: {
              currentStep: ProgressStep.QR_CODE,
              stepState: StepState.LOAD,
            }
          })
        }
      }))}
    />
  )
}
