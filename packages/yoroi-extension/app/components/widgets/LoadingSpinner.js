// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import styles from './LoadingSpinner.scss';

type Props = {|
  small?: true,
  light?: boolean,
|};

@observer
export default class LoadingSpinner extends Component<Props> {
  static defaultProps: {|light: boolean, small: void|} = {
    small: undefined,
    light: false,
  };

  // <TODO:CHECK_LINT>
  // eslint-disable-next-line react/no-unused-class-component-methods
  root: ?HTMLElement;

  render(): Node {
    const componentClasses = classnames([
      styles.component,
      this.props.light === true
        ? styles.light
        : styles.dark,
      this.props.small
        ? styles.smallSize
        : styles.standardSize,
    ]);
    return <div
      className={componentClasses}
      ref={
        (div) => {
          // <TODO:CHECK_LINT>
          // eslint-disable-next-line react/no-unused-class-component-methods
          this.root = div;
        }
      }
    />;
  }
}
