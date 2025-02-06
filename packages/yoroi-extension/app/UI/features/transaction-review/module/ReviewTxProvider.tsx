import React from 'react';
import { getPrivateStakingKey } from '../../../../api/thunk';
import { IntlProvider } from '../../../context/IntlProvider';
import { YoroiUnsignedTx } from '../../../types/yoroi';
import { createCurrrentWalletInfo } from '../../../utils/createCurrentWalletInfo';

type ModalState = {
  isOpen: boolean;
  title: string;
  content: React.ReactNode;
  height: string;
  width: string;
  isLoading: boolean;
  modalView: 'transactionReview' | 'walletInfo';
  unsignedTx: YoroiUnsignedTx;
};
type ModalActions = {
  openTxReviewModal: any;
  changeModalView: any;
  changePasswordInputValue: any;
  setInputError: any;
  closeTxReviewModal: () => void;
  startLoadingTxReview: () => void;
  stopLoadingTxReview: () => void;
};

const ModalContext = React.createContext(undefined);

export const useTxReviewModal = (): any => {
  const value = React.useContext(ModalContext);
  if (!value) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return value;
};

export const ReviewTxProvider = ({
  children,
  initialState,
  stores,
  intl,
}: {
  children: React.ReactNode;
  initialState?: ModalState;
}) => {
  const [state, dispatch] = React.useReducer(modalReducer, { ...defaultState, ...initialState });
  const currentWalletInfo = createCurrrentWalletInfo(stores);

  const checkUserPassword = async (password: string): Promise<any> => {
    try {
      await getPrivateStakingKey({ publicDeriverId: currentWalletInfo?.walletId, password });
    } catch (error) {
      return error;
    }
  };

  const actions = React.useRef<ModalActions>({
    closeTxReviewModal: () => {
      dispatch({ type: 'close' });
    },
    openTxReviewModal: (payload: any) => {
      dispatch({
        type: 'open',
        title: payload.title,
        content: payload.content,
        height: payload.height,
        width: payload.width,
        unsignedTx: payload.unsignedTx,
        receiverCustomTitle: payload.receiverCustomTitle,
        inputState: payload.inputState,
        submitTx: payload.submitTx,
      });
    },
    changeModalView: (payload: any) => {
      dispatch({
        type: 'changeModalView',
        modalView: payload.modalView,
      });
    },
    changePasswordInputValue: (payload: any) => {
      dispatch({
        type: 'changeInputValue',
        passswordInput: payload.passswordInput,
      });
    },
    setInputError: (payload: any) => {
      dispatch({
        type: 'setInputError',
        inputError: payload.inputError,
      });
    },
    startLoadingTxReview: () => dispatch({ type: 'startLoading' }),
    stopLoadingTxReview: () => dispatch({ type: 'stopLoading' }),
  }).current;
  const context: any = React.useMemo(
    () => ({
      ...state,
      ftAssetsList: currentWalletInfo?.ftAssetList,
      nftAssetList: currentWalletInfo?.nftAssetList,
      currentWalletDetails: stores.wallets,
      walletUtxos: currentWalletInfo?.selectedWallet.utxos,
      networkId: currentWalletInfo?.networkId,
      primaryTokenInfo: currentWalletInfo?.primaryTokenInfo,
      walletAddresses: currentWalletInfo?.walletAddresses,
      stakingAddress: currentWalletInfo?.stakingAddress,
      checkUserPassword,
      ...actions,
    }),
    [state, actions]
  );

  return (
    <ModalContext.Provider value={context}>
      <IntlProvider intl={intl}>{children}</IntlProvider>
    </ModalContext.Provider>
  );
};

type ModalAction = any;

const modalReducer = (state: ModalState, action: ModalAction) => {
  switch (action.type) {
    case 'open':
      return {
        ...state,
        content: action.content,
        height: action.height ?? defaultState.height,
        width: action.width ?? defaultState.width,
        title: action.title,
        isOpen: true,
        isLoading: false,
        modalView: action.modalView ?? defaultState.modalView,
        unsignedTx: action.unsignedTx ?? defaultState.unsignedTx,
        receiverCustomTitle: action.receiverCustomTitle,
        inputState: action.inputState,
        submitTx: action.submitTx,
      };

    case 'changeModalView':
      return { ...state, modalView: action.modalView, title: action.title };

    case 'changeInputValue':
      return { ...state, passswordInput: action.passswordInput };

    case 'setInputError':
      return { ...state, inputError: action.inputError };

    case 'close':
      return { ...defaultState, isOpen: false };

    case 'stopLoading':
      return { ...state, isLoading: false };

    case 'startLoading':
      return { ...state, isLoading: true };

    default:
      throw new Error(`modalReducer invalid action`);
  }
};

const defaultState: ModalState = Object.freeze({
  isOpen: false,
  title: '',
  content: null,
  height: '648px',
  width: '648px',
  isLoading: false,
  modalView: 'transactionReview',
  unsignedTx: '',
  passwordInputValue: '',
  inputError: null,
});
