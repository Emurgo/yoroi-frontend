import React, { useEffect } from 'react';
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
}: {
  children: React.ReactNode;
  initialState?: ModalState;
}) => {
  const [state, dispatch] = React.useReducer(modalReducer, { ...defaultState, ...initialState });
  const currentWalletInfo = createCurrrentWalletInfo(stores);
  console.log('[currentWalletInfo]', currentWalletInfo?.selectedWallet);

  useEffect(() => {
    const { wallets } = stores;
    const { selected, selectedWalletName } = wallets;
    const { plate } = selected;
  }, []);

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
      });
    },
    changeModalView: (payload: any) => {
      dispatch({
        type: 'changeModalView',
        modalView: payload.modalView,
      });
    },
    startLoadingTxReview: () => dispatch({ type: 'startLoading' }),
    stopLoadingTxReview: () => dispatch({ type: 'stopLoading' }),
  }).current;
  console.log('currentWalletInfo?.selectedWallet', currentWalletInfo?.selectedWallet);
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
      ...actions,
    }),
    [state, actions]
  );

  return <ModalContext.Provider value={context}>{children}</ModalContext.Provider>;
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
      };

    case 'changeModalView':
      console.log('CHANGE MODAL VIEW REDUCER', action);

      return { ...state, modalView: action.modalView, title: action.title };

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
});
