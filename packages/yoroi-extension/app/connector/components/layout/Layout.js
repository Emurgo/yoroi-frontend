// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { ReactComponent as YoroiLogo } from '../../assets/images/yoroi-logo.inline.svg';
import styles from './Layout.scss';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import TestnetWarningBanner from '../../../components/topbar/banners/TestnetWarningBanner';
import { ReactComponent as DappConnectorIcon } from '../../../assets/images/dapp-connector/dapp-connector.inline.svg';
import environment from '../../../environment';
import { NETWORK_BADGES } from '../../../containers/NavBarContainerRevamp';

type Props = {|
  children: Node,
  networkId: number,
|};

const messages = defineMessages({
  yoroiDappConnector: {
    id: 'global.connector.yoroiDappConnector',
    defaultMessage: '!!!Yoroi Dapp Connector',
  },
});
@observer
export default class Layout extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

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
              <h3>{intl.formatMessage(messages.yoroiDappConnector)}</h3>
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
