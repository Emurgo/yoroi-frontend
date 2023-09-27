// @flow
import React from 'react';
import type { Node } from 'react';
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

const LayoutProvider = (props: Object): Node => {
  const { layout } = props;
  const localLayout: Layouts = layout === THEMES.YOROI_REVAMP ? 'REVAMP' : 'CLASSIC';

  return (
    <LayoutContext.Provider
      value={{
        selectedLayout: localLayout,
        currentTheme: layout,
        isRevampLayout: localLayout === 'REVAMP',
        renderLayoutComponent: (layoutMap: LayoutComponentMap = {}) => {
          const selectedComponent = layoutMap[localLayout];
          return selectedComponent;
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
