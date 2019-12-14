// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import styles from './LoadingSpinner.scss';

type Props = {|
  small?: true,
|};

export default class LoadingSpinner extends Component<Props> {
  static defaultProps = {
    small: undefined,
  };

  root: ?HTMLElement;

  render() {
    const componentClasses = classnames([
      styles.component,
      this.props.small
        ? styles.smallSize
        : styles.standardSize,
    ]);
    return <div className={componentClasses} ref={(div) => { this.root = div; }} />;
  }
}
