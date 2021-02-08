// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import YoroiLogo from '../../assets/images/yoroi_logo.inline.svg';
import MenuIcon from '../../assets/images/menu_icon.inline.svg';
import styles from './Layout.scss';
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes-config';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {|
  children: Node,
|};


const messages = defineMessages({
  yoroiDappConnector: {
    id: 'global.connector.yoroiDappConnector',
    defaultMessage: '!!!Yoroi Dapp Connector',
  },
  poweredBy: {
    id: 'global.connector.poweredBy',
    defaultMessage: '!!!Powered by Cardano',
  },
});
@observer
export default class Layout extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <div className={styles.layout}>
        <div className={styles.header}>
          <Link to={ROUTES.SETTINGS} className={styles.menuIcon}>
            <MenuIcon />
          </Link>
          <div className={styles.menu}>
            <YoroiLogo />
            <div className={styles.logo}>
              <h3>{intl.formatMessage(messages.yoroiDappConnector)}</h3>
              <p className={styles.poweredBy}>{intl.formatMessage(messages.poweredBy)}</p>
            </div>
          </div>
        </div>
        {this.props.children}
      </div>
    );
  }
}
