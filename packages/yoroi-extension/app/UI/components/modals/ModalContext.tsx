import React from 'react';

type ModalState = {
  isOpen: boolean;
  title: string;
  content: React.ReactNode;
  height: string;
  width: string;
  isLoading: boolean;
};
type ModalActions = {
  openModal: any;
  closeModal: () => void;
  startLoading: () => void;
  stopLoading: () => void;
};

const ModalContext = React.createContext(undefined);

export const useModal = (): any => {
  const value = React.useContext(ModalContext);
  if (!value) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return value;
};

export const ModalProvider = ({ children, initialState }: { children: React.ReactNode; initialState?: ModalState }) => {
  const [state, dispatch] = React.useReducer(modalReducer, { ...defaultState, ...initialState });
  const actions = React.useRef<ModalActions>({
    closeModal: () => {
      dispatch({ type: 'close', title: '', content: null, height: '0px', width: '0px', modalId: '' });
    },
    openModal: (payload: any) => {
      dispatch({
        type: 'open',
        title: payload.title,
        content: payload.content,
        height: payload.height,
        width: payload.width,
        modalId: payload.modalId,
      });
    },
    startLoading: () => dispatch({ type: 'startLoading' }),
    stopLoading: () => dispatch({ type: 'stopLoading' }),
  }).current;

  const context: any = React.useMemo(() => ({ ...state, ...actions }), [state, actions]);

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

const defaultState: ModalState = Object.freeze({
  isOpen: false,
  title: '',
  content: null,
  height: '0px',
  width: '0px',
  isLoading: false,
});
