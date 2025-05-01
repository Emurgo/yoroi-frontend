import React, { useEffect } from 'react';
import { getPrivateStakingKey, getProtocolParameters } from '../../../../api/thunk';
import { useModal } from '../../../components/modals/ModalContext';
import { YoroiUnsignedTx } from '../../../types/yoroi';
import { addressHexToBech32 } from '../../../utils/common';
import { createCurrrentWalletInfo } from '../../../utils/createCurrentWalletInfo';
import { TxFail } from '../common/TransactionResult/TxFail';
import { TxSuccess } from '../common/TransactionResult/TxSuccess';
import { TransactionResult, TransactionResultType } from '../common/types';

type ModalState = {
  isOpen: boolean;
  title: string;
  content: React.ReactNode;
  height: string;
  width: string;
  isLoading: boolean;
  modalView: 'transactionReview' | 'walletInfo';
  unsignedTx: YoroiUnsignedTx | null;
  cborTx: YoroiUnsignedTx | null;
};
type ModalActions = {
  openTxReviewModal: any;
  changeModalView: any;
  changePasswordInputValue: any;
  setInputError: any;
  setUnsignedTx: any;
  setCborTx: any;
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
  stores: any;
}) => {
  const [state, dispatch] = React.useReducer(modalReducer, { ...defaultState, ...initialState });
  const [stakeKeyDeposit, setStakingKeyDeposit] = React.useState(0);
  const currentWalletInfo = createCurrrentWalletInfo(stores);
  const { openModal } = useModal();

  const checkUserPassword = async (password: string): Promise<any> => {
    try {
      await getPrivateStakingKey({ publicDeriverId: currentWalletInfo?.walletId, password });
    } catch (error) {
      return error;
    }
  };

  useEffect(() => {
    protocolParameters();
  }, [stakeKeyDeposit]);

  const handleTxResult = (result: TransactionResultType) => {
    dispatch({ type: 'stopLoading', isLoading: false });
    dispatch({ type: 'close' });
    openModal({
      title: 'Transaction results',
      height: '440px',
      width: '612px',
      content: result === TransactionResult.SUCCESS ? <TxSuccess /> : <TxFail />,
      modalId: result === TransactionResult.SUCCESS ? 'txSuccess' : 'txFail',
    });
  };

  const protocolParameters = async () => {
    const protocolParameters = await getProtocolParameters({ networkId: currentWalletInfo?.networkId });
    setStakingKeyDeposit(protocolParameters.keyDeposit);
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
        modalView: payload.modalView,
        unsignedTx: payload.unsignedTx,
        cborTx: payload.cborTx,
        receiverCustomTitle: payload.receiverCustomTitle,
        submitTx: payload.submitTx,
        createUnsignedTx: payload.createUnsignedTx,
        operations: payload.operations,
        extraOverviewDetails: payload.extraOverviewDetails,
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
    setUnsignedTx: (payload: any) => {
      dispatch({
        type: 'setUnsignedTx',
        unsignedTx: payload.unsignedTx,
      });
    },
    setCborTx: (payload: any) => {
      dispatch({
        type: 'setCborTx',
        cborTx: payload.cborTx,
      });
    },
    startLoadingTxReview: () => dispatch({ type: 'startLoading', isLoading: true }),
    stopLoadingTxReview: () => dispatch({ type: 'stopLoading', isLoading: false }),
  }).current;

  const context: any = React.useMemo(
    () => ({
      ...state,
      ftAssetsList: currentWalletInfo?.ftAssetList,
      nftAssetList: currentWalletInfo?.nftAssetList,
      allAssetList: currentWalletInfo?.allAssetList,
      currentWalletDetails: stores.wallets,
      walletUtxos: currentWalletInfo?.selectedWallet.utxos,
      networkId: currentWalletInfo?.networkId,
      primaryTokenInfo: currentWalletInfo?.primaryTokenInfo,
      walletAddresses: currentWalletInfo?.walletAddresses,
      stakingAddress: addressHexToBech32(currentWalletInfo?.stakingAddress || ''),
      primaryBalance: currentWalletInfo?.walletBalance.ada,
      checkUserPassword,
      walletType: currentWalletInfo?.walletType,
      isHardwareWallet: currentWalletInfo?.isHardwareWallet,
      selectedExplorer: currentWalletInfo?.selectedExplorer,
      isStakeRegistered: currentWalletInfo?.isStakeRegistered,
      stakeKeyDeposit,
      showTxResultModal: result => handleTxResult(result),
      ...actions,
    }),
    [state, actions, stakeKeyDeposit]
  );

  return (
    <ModalContext.Provider value={context}>
      {children}
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
        cborTx: action.cborTx ?? defaultState.cborTx,
        receiverCustomTitle: action.receiverCustomTitle,
        submitTx: action.submitTx,
        createUnsignedTx: action.createUnsignedTx,
        operations: action.operations,
        extraOverviewDetails: action.extraOverviewDetails,
      };

    case 'changeModalView':
      return { ...state, modalView: action.modalView, title: action.title };

    case 'changeInputValue':
      return { ...state, passswordInput: action.passswordInput };

    case 'setInputError':
      return { ...state, inputError: action.inputError };

    case 'setUnsignedTx':
      return { ...state, unsignedTx: action.unsignedTx };

    case 'setCborTx':
      return { ...state, cborTx: action.cborTx };

    case 'close':
      return { ...defaultState, isOpen: false, extraDetails: null, receiverCustomTitle: null, operations: null };

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
  unsignedTx: null,
  cborTx: null,
  passswordInput: '',
  inputError: null,
  extraDetails: null,
});
