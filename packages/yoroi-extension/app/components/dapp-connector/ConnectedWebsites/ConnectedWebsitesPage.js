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
import { isErgo } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver';
import WalletRow from './WalletRow';

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

function walletExistInWebsitsList(
  whitelistEntries: Array<WhitelistEntry>,
  publicDeriverId: number) {
  for(const website of whitelistEntries) {
    if (website.publicDeriverId === publicDeriverId) return true
  }
  return false
}

function checkForNetworks(
  wallets: Array<PublicDeriverCache>,
  whitelistEntries: Array<WhitelistEntry>
  ) {
  /**
   * Form a list of cached wallets. will look if the list has ergo wallets or cardano wallts 
   * or both.
   */
  let isErgoExist = false
  let isCardanoExist = false

  for (const wallet of wallets) {
    if(!walletExistInWebsitsList(whitelistEntries, wallet.publicDeriver.getPublicDeriverId())) {
      continue
    }
    if (isErgo(wallet.publicDeriver.getParent().getNetworkInfo())) {
      isErgoExist = true
    } else {
      isCardanoExist = true
    }
    // if both networks exists in the set of wallet we don't need to continue searching
    if (isErgoExist && isCardanoExist ) return {
      isErgoExist,
      isCardanoExist
    }
  }

  return {
    isErgoExist,
    isCardanoExist
  }
}

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
        const { isCardanoExist, isErgoExist } = checkForNetworks(wallets, whitelistEntries)
        return (
          <div className={styles.component}>
            <div className={styles.container}>
              <div className={styles.header}>
                <p>Wallets</p>
                <p>Dapps</p>
              </div>
              <div>
                {isCardanoExist &&
                <div className={styles.chain}>
                  <h1>Cardano, ADA</h1>
                  {
                    whitelistEntries.map(({ url, publicDeriverId }) => {
                      const wallet = wallets.find( cacheEntry =>
                        cacheEntry.publicDeriver.getPublicDeriverId() === publicDeriverId
                      )
                      if (wallet == null) {
                        return null
                      }
                      if (!isErgo(wallet.publicDeriver.getParent().getNetworkInfo())) {
                        return (
                          <WalletRow
                            key={url}
                            url={url}
                            wallet={wallet}
                            isActiveSite={this.props.isActiveSite}
                            onRemoveWallet={this.props.onRemoveWallet}
                            shouldHideBalance={this.props.shouldHideBalance}
                            getTokenInfo={this.props.getTokenInfo}
                          />
                        )
                      }
                      return ''
                    })
                  }
                </div>
                }
                {isErgoExist &&
                <div className={styles.chain}>
                  <h1>Ergo, ERG</h1>
                  {
                    whitelistEntries.map(({ url, publicDeriverId }) => {
                      const wallet = wallets.find( cacheEntry =>
                        cacheEntry.publicDeriver.getPublicDeriverId() === publicDeriverId
                      )
                      if (wallet == null) {
                        return null
                      }
                      if (isErgo(wallet.publicDeriver.getParent().getNetworkInfo())) {
                        return (
                          <WalletRow
                            key={url}
                            url={url}
                            wallet={wallet}
                            isActiveSite={this.props.activeSites.includes(url)}
                            onRemoveWallet={this.props.onRemoveWallet}
                            shouldHideBalance={this.props.shouldHideBalance}
                            getTokenInfo={this.props.getTokenInfo}
                            // settingCach={
                            //   this.props.getConceptualWallet(wallet.publicDeriver.getParent())
                            // }
                          />
                        )
                      }
                      return ''
                    })
                  }
                </div>}
              </div>
            </div>
          </div>
        )
    }
}