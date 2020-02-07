// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { map } from 'lodash';

type Props = {|
  +variables: { [key: string]: string, ... },
  +children?: Node,
|};

/** Allow to swap the CSS used at runtime to allow user-defined themes */
export default class ThemeManager extends Component<Props> {
  static defaultProps = {
    children: undefined
  };

  componentDidMount() {
    this.updateCSSVariables(this.props.variables);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.variables !== prevProps.variables) {
      this.updateCSSVariables(this.props.variables);
    }
  }

  updateCSSVariables(variables: { [key: string]: string, ... }) {
    map(variables, (value, prop) => {
      if (document.documentElement) {
        document.documentElement.style.setProperty(prop, value);
      }
    });
  }
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}
