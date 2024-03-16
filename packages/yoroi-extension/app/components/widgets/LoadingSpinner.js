// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import styles from './LoadingSpinner.scss';

type Props = {|
  small?: true,
  large?: true,
  light?: boolean,
|};

@observer
export default class LoadingSpinner extends Component<Props> {
  static defaultProps: {|light: boolean, large: boolean, small: void|} = {
    small: undefined,
    large: undefined,
    light: false,
  };

  root: ?HTMLElement;

  render(): Node {
    const sizeIndex = 1
      - (this.props.small ? 1 : 0)
      + (this.props.large ? 1 : 0);
    const sizeClass =
      ([styles.smallSize, styles.standardSize, styles.largeSize])
        [sizeIndex];
    const kindClass = this.props.light === true
      ? styles.light
      : styles.dark;
    const componentClasses = classnames([
      styles.component,
      kindClass,
      sizeClass,
    ]);
    return <div className={componentClasses} ref={(div) => { this.root = div; }} />;
  }
}
