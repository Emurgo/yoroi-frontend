// @flow
import React, { Component } from 'react';
import { uniq } from 'lodash';
import SvgInline from 'react-svg-inline';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './SidebarCategory.scss';

type Props = {
  icon: string,
  active: boolean,
  onClick: Function,
  className: string,
};

@observer
export default class SidebarCategory extends Component<Props> {
  render() {
    const { icon, active, onClick, className } = this.props;
    const componentStyles = classNames([
      styles.component,
      active ? styles.active : null,
      className === 'supportRequest' ? styles.supportRequest : className
    ]);

    const iconStyles = classNames(uniq([
      className === 'wallets' ? styles.walletsIcon : styles.icon,
      className === 'supportRequest' ? styles.supportRequestIcon : styles.icon
    ]));

    return (
      <button type="button" className={componentStyles} onClick={onClick}>
        <SvgInline svg={icon} className={iconStyles} cleanup={['title']} />
      </button>
    );
  }

}
