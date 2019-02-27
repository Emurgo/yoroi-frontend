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
};

@observer
export default class TopBarCategory extends Component<Props> {
  render() {
    const { icon, active, onClick, className } = this.props;
    const componentStyles = classNames([
      styles.component,
      active ? styles.active : null,
      className
    ]);

    const isWithHW = (className === 'with-trezor-t' || className === 'with-ledger-nano-s');
    const iconStyles = classNames([
      className === 'wallets' ? styles.walletsIcon : null,
      isWithHW ? styles.withHardwareWalletIcon : null,
      styles.icon
    ]);

    return (
      <button type="button" className={componentStyles} onClick={onClick}>
        <SvgInline svg={icon} className={iconStyles} cleanup={['title']} />
      </button>
    );
  }

}
