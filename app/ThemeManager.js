import React, { Component } from 'react';
import _ from 'lodash';

/** Allow to swap the CSS used at runtime to allow user-defined themes */
export default class ThemeManager extends Component {
  componentDidMount() {
    this.updateCSSVariables(this.props.variables);
    this.props.setMarkup();
  }

  componentDidUpdate(prevProps) {
    if (this.props.variables !== prevProps.variables) {
      this.updateCSSVariables(this.props.variables);
      this.props.setMarkup();
    }
  }

  updateCSSVariables(variables) {
    _.map(variables, (value, prop) => {
      document.documentElement.style.setProperty(prop, value);
    });
  }
  render() {
    return (
      <div>
        <input
          type="checkbox"
          onChange={(e) => {
            this.updateCSSVariables(this.props.variables);
            this.props.handleChange(e);
          }}
          checked={this.props.classic}
        />
        <span> - classic design </span>
        {this.props.children}
      </div>
    );
  }
}
