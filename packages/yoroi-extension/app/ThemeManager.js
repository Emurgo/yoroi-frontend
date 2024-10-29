// @flow
import type { Node } from 'react';
import React from 'react';
import { writeCssVar } from './styles/utils';

type Props = {|
  +cssVariables?: { [key: string]: string, ... },
  +children?: Node,
|};

/** Allow to swap the CSS used at runtime to allow user-defined themes */
function ThemeManager({ cssVariables, children }: Props): Node {
  React.useEffect(() => {
    const hasCSSVars = Object.keys(cssVariables || {}).length;
    if (hasCSSVars) {
      Object.entries(cssVariables || {}).forEach(([varName, cssValue]) => {
        writeCssVar(varName, cssValue);
      });
    }
  }, [cssVariables]);

  return <div>{children}</div>;
}

export default ThemeManager;

ThemeManager.defaultProps = {
  children: null,
};
