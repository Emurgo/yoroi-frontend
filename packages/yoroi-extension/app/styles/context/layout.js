// @flow
import type { Node } from 'react';
import React from 'react';
import { THEMES } from '../utils';

export type Layouts = 'CLASSIC' | 'REVAMP';
export type LayoutComponentMap = {|
  [key: Layouts]: Node,
|};

export type InjectedLayoutProps = {|
  +selectedLayout: Layouts,
  +isRevampLayout: boolean,
  +renderLayoutComponent: (layoutMap: LayoutComponentMap) => Node,
|};

const LayoutContext = React.createContext();

function LayoutProvider(props: Object): Node {
  const { layout } = props;
  const localLayout: Layouts = layout === THEMES.YOROI_REVAMP ? 'REVAMP' : 'CLASSIC';
  // <TODO:CHECK_LINT>
  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const value = {
    selectedLayout: localLayout,
    isRevampLayout: localLayout === 'REVAMP',
    renderLayoutComponent: (layoutMap: LayoutComponentMap = {}) => layoutMap[localLayout],
  };
  return (
    <LayoutContext.Provider
      value={value}
      {...props}
    />
  );
}

function useLayout(): Object {
  const context = React.useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}

const withLayout: (Function => Function) = WrappedComponent => {
  return function (props) {
    const layoutProps = useLayout();
    return <WrappedComponent {...props} {...layoutProps} />;
  };
};

export { LayoutProvider, useLayout, withLayout };
