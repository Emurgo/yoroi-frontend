import React from 'react';
import PubSub from 'pubsub-js';

type ModalState = {
  isOpen: boolean;
  title: string;
  content: React.ReactNode;
  height: string;
  width: string;
  isLoading: boolean;
  modalId?: string;
  handleBack?: () => void | null;
};

type ModalActions = {
  openModal: any;
  closeModal: () => void;
  startLoading: () => void;
  stopLoading: () => void;
};

type ModalContextType = ModalActions & ModalState;

const defaultActions: ModalActions = {
  openModal: () => {},
  closeModal: () => {},
  startLoading: () => {},
  stopLoading: () => {},
};

const defaultState: ModalState = Object.freeze({
  isOpen: false,
  title: '',
  content: null,
  height: '0px',
  width: '0px',
  isLoading: false,
});

const ModalContext = React.createContext<ModalContextType>({
  ...defaultState,
  ...defaultActions,
});

export const useModal = (): ModalContextType => {
  const value = React.useContext<ModalContextType>(ModalContext);
  if (!value) {
    throw new Error('useModal must be used within a ModalProvider');
  }

  const handleCloseModal = () => {
    PubSub.publish('MODAL_CLOSED', value.modalId);
    value.closeModal();
  };

  return { ...value, closeModal: handleCloseModal };
};

export const ModalProvider = ({ children, initialState }: { children: React.ReactNode; initialState?: ModalState }) => {
  const [state, dispatch] = React.useReducer(modalReducer, { ...defaultState, ...initialState });
  const actions = React.useRef<ModalActions>({
    closeModal: () => {
      dispatch({ type: 'close' });
    },
    openModal: (payload: any) => {
      dispatch({
        type: 'open',
        title: payload.title,
        content: payload.content,
        height: payload.height,
        width: payload.width,
        modalId: payload.modalId,
        handleBack: payload.handleBack,
      });
    },
    startLoading: () => dispatch({ type: 'startLoading' }),
    stopLoading: () => dispatch({ type: 'stopLoading' }),
  }).current;

  const context: ModalContextType = React.useMemo(() => ({ ...state, ...actions }), [state, actions]);

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
        modalId: action.modalId,
        handleBack: action.handleBack ?? null,
        isOpen: true,
        isLoading: false,
      };
    case 'close':
      return { ...defaultState };

    case 'stopLoading':
      return { ...state, isLoading: false };

    case 'startLoading':
      return { ...state, isLoading: true };

    default:
      throw new Error(`modalReducer invalid action`);
  }
};
