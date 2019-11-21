// @flow
import React, { Component } from 'react';
import type { MessageDescriptor } from 'react-intl';
import { intlShape } from 'react-intl';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './TopBarCategory.scss';

type Props = {|
  +icon: string,
  +inlineTextMD: ?MessageDescriptor,
  +active: boolean,
  +onClick: Function,
  +className: string,
  +iconStyle?: string
|};

@observer
export default class TopBarCategory extends Component<Props> {
  static defaultProps = {
    iconStyle: '',
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const { icon, iconStyle, active, onClick, className, inlineTextMD } = this.props;
    const componentStyles = classNames([
      styles.component,
      active ? styles.active : null,
      className
    ]);
    const iconStyles = classNames([
      iconStyle != null ? iconStyle : null,
      styles.icon
    ]);
    const SvgElem = icon;
    return (
      <button type="button" className={componentStyles} onClick={onClick}>
        <span className={iconStyles}><SvgElem /></span>
        {inlineTextMD
          && <span className={styles.iconInlineText}>{intl.formatMessage(inlineTextMD)}</span>}
      </button>
    );
  }

}
