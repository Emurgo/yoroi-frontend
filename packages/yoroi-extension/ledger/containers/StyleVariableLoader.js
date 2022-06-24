// @flow //
import React from 'react';
import _ from 'lodash'; // is this really needed?

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
    _.map(variables, (value, prop) => {
      if (document.documentElement) {
        document.documentElement.style.setProperty(prop, value);
      }
    });
  }

  render() { return (null); }
}
