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
      label,
      showLabel
    } = this.props;

    const componentStyles = classNames([
      styles.component,
      active ? styles.active : null,
    ]);

    const SvgElem = icon;

    return (
      <button type="button" className={componentStyles} onClick={onClick}>
        <span className={styles.icon}><SvgElem /></span>
        {label != null && showLabel === true && (
          <span className={styles.label}>{label}</span>
        )}
      </button>
    );
  }

}
