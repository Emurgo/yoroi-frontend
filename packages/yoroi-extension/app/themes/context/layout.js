// @flow
import React from 'react';
import type { Node } from 'react';

type Layouts = 'CLASSIC' | 'REVAMP';
export type LayoutComponentMap = {|
  [key: Layouts]: Node,
|};
type LayoutInitialState = {|
  selected: Layouts,
|};

const initialState: LayoutInitialState = {
  selected: 'CLASSIC',
};

const LayoutContext = React.createContext();

function layoutReducer(state, action) {
  switch (action.type) {
    case 'CHANGE_LAYOUT': {
      return { ...state, selected: state.selected === 'CLASSIC' ? 'REVAMP' : 'CLASSIC' };
    }
    default:
      return state;
  }
}

const LayoutProvider = (props: Object): Node => {
  const [state, dispatch] = React.useReducer(layoutReducer, initialState);

  return (
    <LayoutContext.Provider
      value={{
        selectedLayout: state.selected,
        isRevampLayout: state.selected === 'REVAMP',
        changeLayout: () => dispatch({ type: 'CHANGE_LAYOUT' }),
        renderLayoutComponent: (layoutMap: LayoutComponentMap = {}) => {
          const selectedComponent = layoutMap[state.selected];
          return selectedComponent;
        },
      }}
      {...props}
    />
  );
};

function useLayout(): LayoutInitialState {
  const context = React.useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}

const withLayout = (WrappedComponent: Function): Function => props => {
  const layoutProps = useLayout();
  return <WrappedComponent {...props} {...layoutProps} />;
};

export { LayoutProvider, useLayout, withLayout };
