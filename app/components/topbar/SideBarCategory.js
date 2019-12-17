// @flow
import React, { Component } from 'react';
import { intlShape } from 'react-intl';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './SideBarCategory.scss';

type Props = {|
  +icon: string,
  +active: boolean,
  +onClick: Function,
  +className: string,
  +showLabel?: boolean,
  +label?: string,
|};

@observer
export default class SideBarCategory extends Component<Props> {
  static defaultProps = {
    showLabel: false,
    label: '',
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {

    const {
      icon,
      active,
      onClick,
      className,
      label,
      showLabel
    } = this.props;

    const componentStyles = classNames([
      styles.component,
      active ? styles.active : null,
      className
    ]);

    const SvgElem = icon;

    return (
      <button type="button" className={componentStyles} onClick={onClick}>
        <span className={styles.icon}><SvgElem /></span>
        {label && showLabel && (
          <span className={styles.label}>{label}</span>
        )}
      </button>
    );
  }

}
