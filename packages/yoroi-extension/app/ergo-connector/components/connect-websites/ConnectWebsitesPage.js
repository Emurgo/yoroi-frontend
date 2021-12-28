/* eslint-disable no-nested-ternary */
// @flow
import { Component } from 'react';
import type { Node } from 'react';
import DropdownCard from './DropdownCard';
import styles from './ConnectWebsitesPage.scss';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
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
  +whitelistEntries: ?Array<WhitelistEntry>,
  +activeSites: Array<string>,
  +wallets: ?Array<PublicDeriverCache>,
  +onRemoveWallet: ?string => void,
  +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
  +shouldHideBalance: boolean,
|};

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
        <h3>{intl.formatMessage(connectorMessages.noWebsitesConnected)} </h3>
        <p>{intl.formatMessage(connectorMessages.messageReadOnly)}</p>
      </div>
    );
    if (this.props.whitelistEntries == null || this.props.wallets == null) {
      return genNoResult();
    }
    const { whitelistEntries, wallets } = this.props;
    if (whitelistEntries.length === 0) {
      return genNoResult();
    }
    return (
      <>
        <h1 className={styles.title}>
          {intl.formatMessage(connectorMessages.connectedWebsites)}
        </h1>
        <div className={styles.walletList}>
          {whitelistEntries.map(({ url, publicDeriverId }) => {
            const wallet = wallets.find(
              cacheEntry => cacheEntry.publicDeriver.getPublicDeriverId() === publicDeriverId
            );
            // note: store should make sure that deleted wallets got removed from the whitelist
            // but this is just a precaution
            if (wallet == null) return null;
            return (
              <DropdownCard
                label={intl.formatMessage(connectorMessages.connectedWallets)}
                infoText={intl.formatMessage(connectorMessages.messageReadOnly)}
                key={url}
                url={url}
                isActiveSite={this.props.activeSites.includes(url)}
                wallet={wallet}
                onRemoveWallet={this.props.onRemoveWallet}
                getTokenInfo={this.props.getTokenInfo}
                shouldHideBalance={this.props.shouldHideBalance}
              />
            );
          })}
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
