// @flow
import React, { useEffect } from 'react';
import type { Node } from 'react';
import { THEMES } from '../utils';
// import { ReactComponent as SupportIcon } from '../../assets/images/support.svg'

export type Layouts = 'CLASSIC' | 'REVAMP';
export type LayoutComponentMap = {|
  [key: Layouts]: Node,
|};

const loadScript = (src, id) => {
  const script = document.createElement('script')
  script.src = src
  // script.setAttribute('Content-Security-Policy', "script-src 'self'")
  console.log(script)

  if (id) {
    script.id = id
  }

  script.addEventListener('load', () => {
    console.log(`SCRIPT LOADED : ${script.src}`);
  })

  script.addEventListener('error', (e) => {
    console.log(`SCRIPT LOAD ERROR : ${e.message}`);
  })

  document.body.appendChild(script)
}

const LayoutContext = React.createContext();

const LayoutProvider = (props: Object): Node => {
  const { layout } = props;
  const localLayout: Layouts = layout === THEMES.YOROI_REVAMP ? 'REVAMP' : 'CLASSIC';


  useEffect(() => {
    loadScript('https://static.zdassets.com/ekr/snippet.js?key=68b95d72-6354-4343-8a64-427979a6f5d6', 'ze-snippet');

    const interval = setInterval(() => {
      if (typeof window.zE !== 'undefined') {
        window.zE.activate()
        clearInterval(interval)
      }
    }, 500)

    return () => {
      window.zE.hide()
    }
  }, [])

  return (
    <>
      {/* <SupportIcon /> */}
      <LayoutContext.Provider
        value={{
          selectedLayout: localLayout,
          isRevampLayout: localLayout === 'REVAMP',
          renderLayoutComponent: (layoutMap: LayoutComponentMap = {}) => {
            const selectedComponent = layoutMap[localLayout];
            return selectedComponent;
          },
        }}
        {...props}
      />
    </>
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
