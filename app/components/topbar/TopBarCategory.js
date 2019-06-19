// @flow
import React, { Component } from 'react';
import type { MessageDescriptor } from 'react-intl';
import { intlShape } from 'react-intl';
import SvgInline from 'react-svg-inline';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './TopBarCategory.scss';

type Props = {|
  icon: string,
  inlineTextMD: ?MessageDescriptor,
  active: boolean,
  onClick: Function,
  className: string,
|};

@observer
export default class TopBarCategory extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const { icon, active, onClick, className, inlineTextMD } = this.props;
    const componentStyles = classNames([
      styles.component,
      active ? styles.active : null,
      className
    ]);

    const iconStyles = classNames([
      className === 'go-back' ? styles.goBackIcon : null,
      className === 'wallets' ? styles.walletsIcon : null,
      className === 'with-ledger-nano-s' ? styles.withLedgerNanoSIcon : null,
      className === 'with-trezor-t' ? styles.withTrezorTIcon : null,
      styles.icon
    ]);

    return (
      <button type="button" className={componentStyles} onClick={onClick}>
        <SvgInline svg={icon} className={iconStyles} />
        {inlineTextMD
          && <span className={styles.iconInlineText}>{intl.formatMessage(inlineTextMD)}</span>}
      </button>
    );
  }

}
