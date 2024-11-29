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
  color?: number,
  id?: string,
|};

@observer
export default class LoadingSpinner extends Component<Props> {
  static defaultProps: {|light: boolean, large: boolean, small: boolean, color: number, id: string|} = {
    small: false,
    large: false,
    light: false,
    color: 0,
    id: 'somewhere',
  };

  root: ?HTMLElement;

  render(): Node {
    const colorIsUsed = this.props.color != null && this.props.color >= 1 && this.props.color <= 3;
    let colorStyles;
    switch (this.props.color) {
      case 1:
        colorStyles = styles.blue;
        break;
      case 2:
        colorStyles = styles.gray;
        break;
      case 3:
        colorStyles = styles.white;
        break;
      default:
        colorStyles = styles.light;
        break;
    }

    const sizeIndex = 1
      - (this.props.small ? 1 : 0)
      + (this.props.large ? 1 : 0);
    const sizeClass =
      ([styles.smallSize, styles.standardSize, styles.largeSize])
        [sizeIndex];
    const kindClass = colorIsUsed ? colorStyles : this.props.light === true
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
