// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import styles from './LoadingSpinner.scss';

type Props = {|
  small?: true,
  light?: boolean,
|};

export default class LoadingSpinner extends Component<Props> {
  static defaultProps = {
    small: undefined,
    light: false,
  };

  root: ?HTMLElement;

  render() {
    const componentClasses = classnames([
      styles.component,
      this.props.light === true
        ? styles.light
        : styles.dark,
      this.props.small
        ? styles.smallSize
        : styles.standardSize,
    ]);
    return <div className={componentClasses} ref={(div) => { this.root = div; }} />;
  }
}
