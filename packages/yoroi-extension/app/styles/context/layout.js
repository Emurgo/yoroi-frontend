// @flow
import type { Node } from 'react';
import React from 'react';

export type Layouts = 'CLASSIC' | 'REVAMP';
// <TODO:PENDING_REMOVAL> disabling legacy UI
export type LayoutComponentMap = {|
  [key: Layouts]: Node,
|};

export type InjectedLayoutProps = {|
  +renderLayoutComponent: (layoutMap: LayoutComponentMap) => Node,
|};

const LayoutContext = React.createContext();

const LayoutProvider = (props: Object): Node => {
  return (
    <LayoutContext.Provider
      value={{
        // <TODO:PENDING_REMOVAL> disabling legacy UI
        renderLayoutComponent: (layoutMap: LayoutComponentMap = {}) => {
          return layoutMap.REVAMP;
        },
      }}
      {...props}
    />
  );
};

function useLayout(): Object {
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
