// @flow
import { Component } from 'react';
import type { Node } from 'react';
import YoroiLogo from '../../assets/images/yoroi_logo.inline.svg';
import styles from './Layout.scss';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import TestnetWarningBanner from '../../../components/topbar/banners/TestnetWarningBanner';
import DappConnectorIcon from '../../../assets/images/dapp-connector/dapp-connector.inline.svg';
import environment from '../../../environment';

type Props = {|
  children: Node,
|};

const messages = defineMessages({
  yoroiDappConnector: {
    id: 'global.connector.yoroiDappConnector',
    defaultMessage: '!!!Yoroi DApp Connector',
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
        <TestnetWarningBanner isTestnet={environment.isTest()} />
        <div className={styles.header}>
          <div className={styles.menu}>
            <YoroiLogo />
            <div className={styles.logo}>
              <h3>{intl.formatMessage(messages.yoroiDappConnector)}</h3>
            </div>
            <DappConnectorIcon style={{ marginLeft: 10 }} />
          </div>
        </div>
        <div className={styles.content}>{this.props.children}</div>
      </div>
    );
  }
}
