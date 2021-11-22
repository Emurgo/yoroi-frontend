// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import type { WhitelistEntry, PublicDeriverCache } from '../../../../chrome/extension/ergo-connector/types'
import styles from './ConnectedWebsitesPage.scss'
import NoItemsFoundImg from '../../../assets/images/dapp-connector/no-websites-connected.inline.svg'
import { intlShape, defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { connectorMessages } from '../../../i18n/global-messages';

type Props = {|
    +whitelistEntries: ?Array<WhitelistEntry>,
    +activeSites: Array<string>,
    +wallets: ?Array<PublicDeriverCache>,
    +onRemoveWallet: ?string => void,
    +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
    +shouldHideBalance: boolean,
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
export default class ConnectedWebsitesPage extends Component<Props> {
    static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
        intl: intlShape.isRequired,
    };

    render(): Node {
        const { intl } = this.context;
        const genNoResult = () => (
          <div className={styles.noItems}>
            <NoItemsFoundImg />
            <h3>{intl.formatMessage(messages.noWebsitesConnected)} </h3>
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
          <div>
            <div className={styles.walletList}>
              {whitelistEntries.map(({ url, publicDeriverId }) => {
                const wallet = wallets.find(
                cacheEntry => cacheEntry.publicDeriver.getPublicDeriverId() === publicDeriverId
                );
                // note: store should make sure that deleted wallets got removed from the whitelist
                // but this is just a precaution
                if (wallet == null) return null;
                return (
                  <h1>{url}.{publicDeriverId}</h1>
                );
              })}
            </div>
          </div>
        )
    }
}