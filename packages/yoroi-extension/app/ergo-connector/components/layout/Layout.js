// @flow
import { Component } from 'react';
import type { Node } from 'react';
import YoroiLogo from '../../assets/images/yoroi_logo.inline.svg';
import MenuIcon from '../../assets/images/menu_icon.inline.svg';
import styles from './Layout.scss';
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes-config';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import TestnetWarningBanner from '../../../components/topbar/banners/TestnetWarningBanner';

type Props = {|
  children: Node,
|};

const messages = defineMessages({
  yoroiDappConnector: {
    id: 'global.connector.yoroiDappConnector',
    defaultMessage: '!!!Yoroi Dapp Connector',
  },
  poweredBy: {
    id: 'global.connector.poweredByErgo',
    defaultMessage: '!!!Powered by Ergo',
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
        <TestnetWarningBanner isTestnet={false} />
        <div className={styles.header}>
          <Link to={ROUTES.SETTINGS.GENERAL} className={styles.menuIcon}>
            <MenuIcon />
          </Link>
          <div className={styles.menu}>
            <YoroiLogo />
            <div className={styles.logo}>
              <h3>{intl.formatMessage(messages.yoroiDappConnector)}</h3>
            </div>
          </div>
        </div>
        <div className={styles.content}>{this.props.children}</div>
      </div>
    );
  }
}
