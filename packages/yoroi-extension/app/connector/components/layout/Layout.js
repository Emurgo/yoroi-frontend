// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { withRouter, type Location } from 'react-router-dom';
import { ReactComponent as YoroiLogo } from '../../assets/images/yoroi-logo.inline.svg';
import styles from './Layout.scss';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import TestnetWarningBanner from '../../../components/topbar/banners/TestnetWarningBanner';
import { ReactComponent as DappConnectorIcon } from '../../../assets/images/dapp-connector/dapp-connector.inline.svg';
import environment from '../../../environment';
import { NETWORK_BADGES } from '../../../containers/NavBarContainerRevamp';
import { ROUTES } from '../../routes-config';

type Props = {|
  children: Node,
  networkId: number,
|};
type LocationProp = {|
  location: Location,
|};

export const messages: Object = defineMessages({
  yoroiDappConnector: {
    id: 'global.connector.yoroiDappConnector',
    defaultMessage: '!!!Yoroi Dapp Connector',
  },
  yoroiConnector: {
    id: 'global.connector.yoroiConnector',
    defaultMessage: '!!!Yoroi Connector',
  },
});

@observer
class Layout extends Component<Props & LocationProp> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const title = intl.formatMessage(
      this.props.location.pathname === ROUTES.SELECT_CASHBACK_WALLET ?
        messages.yoroiConnector : messages.yoroiDappConnector
    );

    let testnetBadge = null;
    const badge = NETWORK_BADGES[this.props.networkId];
    if (badge) {
      testnetBadge = (
        <div className={styles.badge} style={{ backgroundColor: badge.color }}>{badge.text}</div>
      );
    }

    return (
      <div className={styles.layout}>
        <TestnetWarningBanner isTestnet={environment.isTest()} />
        <div className={styles.header}>
          <div className={styles.menu}>
            <YoroiLogo />
            <div className={styles.logo}>
              <h3>{title}</h3>
            </div>
            <div className={styles.connectorLogoContainer}>
              <DappConnectorIcon className={styles.connectorLogo} />
            </div>
            {testnetBadge}
          </div>
        </div>
        <div className={styles.content}>{this.props.children}</div>
      </div>
    );
  }
}

export default (withRouter(Layout): ComponentType<Props>);
