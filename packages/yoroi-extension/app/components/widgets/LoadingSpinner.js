// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import styles from './LoadingSpinner.scss';

type Props = {|
  small?: boolean,
  large?: boolean,
  light?: boolean,
  id?: string,
|};

@observer
export default class LoadingSpinner extends Component<Props> {
  static defaultProps: {|light: boolean, large: boolean, small: boolean, id: string|} = {
    small: false,
    large: false,
    light: false,
    id: 'somewhere',
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
    return <div className={componentClasses} id={this.props.id && this.props.id + '-loadingSpinner-component'} ref={(div) => { this.root = div; }} />;
  }
}
