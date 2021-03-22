/* eslint-disable no-nested-ternary */
// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import DropdownCard from './DropdownCard';
import styles from './ConnectWebsitesPage.scss';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { connectorMessages } from '../../../i18n/global-messages';
import NoItemsFoundImg from '../../assets/images/no-websites-connected.inline.svg';
import type {
  PublicDeriverCache,
  WhitelistEntry,
} from '../../../../chrome/extension/ergo-connector/types';
import type { TokenLookupKey } from '../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';

type Props = {|
  +accounts: ?Array<WhitelistEntry>,
  +activeSites: Array<string>,
  +wallets: ?Array<PublicDeriverCache>,
  +onRemoveWallet: ?string => void,
  +getTokenInfo: Inexact<TokenLookupKey> => $ReadOnly<TokenRow>,
  shouldHideBalance: boolean,
|};
const messages = defineMessages({
  connectedWallets: {
    id: 'connector.connect.connectedWallets',
    defaultMessage: '!!!Connected Wallets',
  },
  noWebsitesConnected: {
    id: 'connector.connect.noWebsitesConnected',
    defaultMessage: `!!!You don't have any websites connected yet`,
  },
});

@observer
export default class ConnectWebsitesPage extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  getContent: void => Node = () => {
    const { intl } = this.context;
    const genNoResult = () => (
      <div className={styles.noItems}>
        <NoItemsFoundImg />
        <h3>{intl.formatMessage(messages.noWebsitesConnected)} </h3>
        <p>{intl.formatMessage(connectorMessages.messageReadOnly)}</p>
      </div>
    );
    if (this.props.accounts == null || this.props.wallets == null) {
      return genNoResult();
    }
    const { accounts, wallets } = this.props;
    if (accounts.length === 0) {
      return genNoResult();
    }
    return (
      <>
        <h1 className={styles.title}>
          {intl.formatMessage(connectorMessages.connectedWebsites)}
        </h1>
        <div className={styles.walletList}>
          {accounts.map(({ url, walletIndex }) => (
            <DropdownCard
              label={intl.formatMessage(messages.connectedWallets)}
              infoText={intl.formatMessage(connectorMessages.messageReadOnly)}
              key={url}
              url={url}
              isActiveSite={this.props.activeSites.includes(url)}
              wallet={wallets[walletIndex]}
              onRemoveWallet={this.props.onRemoveWallet}
              getTokenInfo={this.props.getTokenInfo}
              shouldHideBalance={this.props.shouldHideBalance}
            />
          ))}
        </div>
      </>
    );
  };


  render(): Node {
    return (
      <div className={styles.component}>
        {this.getContent()}
      </div>
    );
  }
}
