// @flow //
import React from 'react';
import type { Node } from 'react';
import { map } from 'lodash';

type Props = {|variables: { [key: string]: string }|};

/** Allow to swap the CSS used at runtime to allow user-defined themes */
export default class StyleVariableLoader extends React.Component<Props> {

  componentDidMount() {
    this.updateCSSVariables(this.props.variables);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.variables !== prevProps.variables) {
      console.debug('[YLC] StyleVariableLoader::componentDidUpdate called...');
      this.updateCSSVariables(this.props.variables);
    }
  }

  updateCSSVariables(variables: { [key: string]: string }) {
    map(variables, (value, prop) => {
      if (document.documentElement) {
        document.documentElement.style.setProperty(prop, value);
      }
    });
  }

  render(): Node { return (null); }
}
