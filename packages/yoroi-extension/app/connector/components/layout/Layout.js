// @flow
import { Component, useContext } from 'react';
import type { Node, ComponentType } from 'react';
import { ReactComponent as YoroiLogo } from '../../assets/images/yoroi-logo.inline.svg';
import styles from './Layout.scss';
import { observer } from 'mobx-react';
import { defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import TestnetWarningBanner from '../../../components/topbar/banners/TestnetWarningBanner';
import { ReactComponent as DappConnectorIcon } from '../../../assets/images/dapp-connector/dapp-connector.inline.svg';
import environment from '../../../environment';
import { NETWORK_BADGES } from '../../../containers/NavBarContainerRevamp';
import { ROUTES } from '../../routes-config';
import { useLocation } from 'react-router';

type Props = {|
  children: Node,
  networkId: number,
  intl: $npm$ReactIntl$IntlFormat,
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

function Layout(props: Props) {
  const location = useLocation();
  const title = props.intl.formatMessage(
    location.pathname === ROUTES.SELECT_CASHBACK_WALLET ?
      messages.yoroiConnector : messages.yoroiDappConnector
  );

  let testnetBadge = null;
  const badge = NETWORK_BADGES[props.networkId];
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
      <div className={styles.content}>{props.children}</div>
    </div>
  );
}

export default (observer(Layout): ComponentType<Props>);
