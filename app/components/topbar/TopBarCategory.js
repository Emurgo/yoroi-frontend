// @flow
import React, { Component } from 'react';
import SvgInline from 'react-svg-inline';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './TopBarCategory.scss';

type Props = {
  icon: string,
  active: boolean,
  onClick: Function,
  className: string,
  classicTheme: boolean
};

@observer
export default class TopBarCategory extends Component<Props> {
  render() {
    const { icon, active, onClick, className, classicTheme } = this.props;
    const activeClasses = classicTheme ? styles.activeClassic : styles.active;
    const componentStyles = classNames([
      classicTheme ? styles.componentClassic : styles.component,
      active ? activeClasses : null,
      className
    ]);

    const iconStyles = classNames([
      className === 'wallets' ? styles.walletsIcon : null,
      className === 'with-trezor-t' ? styles.withTrezorTIcon : null,
      classicTheme ? styles.iconClassic : styles.icon
    ]);

    return (
      <button type="button" className={componentStyles} onClick={onClick}>
        <SvgInline svg={icon} className={iconStyles} />
      </button>
    );
  }

}
