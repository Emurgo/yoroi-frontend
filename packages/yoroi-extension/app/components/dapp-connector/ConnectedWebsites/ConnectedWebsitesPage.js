// @flow
import type { ComponentType, Node } from 'react';
import { Component } from 'react';
import type { WhitelistEntry } from '../../../../chrome/extension/connector/types';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { defineMessages, intlShape } from 'react-intl';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import type { TokenLookupKey } from '../../../api/common/lib/MultiToken';
import { observer } from 'mobx-react';
import { ReactComponent as NoDappsFoundImg } from '../../../assets/images/dapp-connector/no-dapps-connected.inline.svg';
import { ReactComponent as NoDappsConnected } from '../../../assets/images/revamp/no-dapps-connected.inline.svg';
import { connectorMessages } from '../../../i18n/global-messages';
import { withLayout } from '../../../styles/context/layout';
import styles from './ConnectedWebsitesPage.scss';
import WalletRow from './WalletRow';
import WalletRowRevamp from './WalletRowRevamp';
import { Box, Typography } from '@mui/material';
import type { WalletState } from '../../../../chrome/extension/background/types';

type Props = {|
  +whitelistEntries: ?Array<WhitelistEntry>,
  +activeSites: Array<string>,
  +wallets: ?Array<WalletState>,
  +onRemoveWallet: ({| url: ?string, protocol: ?string |}) => void,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +shouldHideBalance: boolean,
|};

type InjectedProps = {| isRevampLayout: boolean |};

type AllProps = {| ...Props, ...InjectedProps |};

const messages = defineMessages({
  connectedWallets: {
    id: 'connector.connect.connectedWallets',
    defaultMessage: '!!!Connected Wallets',
  },
  noWebsitesConnected: {
    id: 'connector.connect.noWebsitesConnected',
    defaultMessage: "!!!You don't have any websites connected yet",
  },
  connectedDapps: {
    id: 'connector.connected-dapps.title',
    defaultMessage: '!!!Connected DApps ({dappsCount})',
  },
  walletsLabel: {
    id: 'connector.connected-dapps.walletsLabel',
    defaultMessage: '!!!Wallets',
  },
  dappsLabel: {
    id: 'connector.connected-dapps.dappsLabel',
    defaultMessage: '!!!Dapps',
  },
  cardanoLabel: {
    id: 'connector.connected-dapps.cardanoLabel',
    defaultMessage: '!!!Cardano, ADA',
  },
});

@observer
class ConnectedWebsitesPage extends Component<AllProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  renderRevamp(): Node {
    const { intl } = this.context;
    const genNoResult = () => (
      <Box width="100%" height="100%" display="flex" alignItems="center" justifyContent="center">
        <Box mt="-24px" display="flex" flexDirection="column" alignItems="center" gap="16px">
          <NoDappsConnected />
          <Box textAlign="center">
            <Typography component="div" variant="h5" fontWeight={500} mb="8px">
              {intl.formatMessage(messages.noWebsitesConnected)}
            </Typography>
            <Typography component="div" variant="body1" color="grayscale.600">
              {intl.formatMessage(connectorMessages.messageReadOnly)}
            </Typography>
          </Box>
        </Box>
      </Box>
    );

    const { whitelistEntries, wallets } = this.props;
    if (
      whitelistEntries == null ||
      whitelistEntries.length === 0 ||
      wallets == null ||
      wallets.length === 0
    ) {
      return genNoResult();
    }

    const cardanoNodes = whitelistEntries
      .map(({ url, protocol, publicDeriverId, image }, entryIndex) => {
        const wallet = wallets.find(
          cacheEntry => cacheEntry.publicDeriverId === publicDeriverId
        );

        if (wallet == null) return null;

        return [
          <WalletRowRevamp
            key={url}
            url={url}
            protocol={protocol}
            websiteIcon={image}
            onRemoveWallet={this.props.onRemoveWallet}
            balance={wallet.balance}
            plate={wallet.plate}
            shouldHideBalance={this.props.shouldHideBalance}
            getTokenInfo={this.props.getTokenInfo}
            walletName={wallet.name}
            id={'walletRow_' + entryIndex}
          />,
        ];
      })
      .reduce((acc, node) => {
        if (node != null) acc.push(node);
        return acc;
      }, []);

    if (cardanoNodes.length === 0) return genNoResult();

    return (
      <Box>
        <Box mb="15px">
          <Typography component="div" fontWeight={500} variant="h5">
            {intl.formatMessage(messages.connectedDapps, { dappsCount: cardanoNodes.length })}
          </Typography>
        </Box>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            gap: '24px',
            py: '12px',
            alignItems: 'center',
            borderBottom: '1px solid',
            borderBottomColor: 'grayscale.200',
            color: 'grayscale.600',
          }}
        >
          <Box width="100%">
            <Typography component="div" variant="body2">{intl.formatMessage(messages.walletsLabel)}</Typography>
          </Box>
          <Box width="100%">
            <Typography component="div" variant="body2">{intl.formatMessage(messages.dappsLabel)}</Typography>
          </Box>
        </Box>
        <Box mt="16px">{cardanoNodes}</Box>
      </Box>
    );
  }

  render(): Node {
    const { isRevampLayout } = this.props;

    if (isRevampLayout) return this.renderRevamp();

    const { intl } = this.context;
    const genNoResult = () => (
      <div className={styles.component}>
        <div className={styles.noDappsFound}>
          <NoDappsFoundImg />
          <h3>{intl.formatMessage(messages.noWebsitesConnected)} </h3>
          <div>{intl.formatMessage(connectorMessages.messageReadOnly)}</div>
        </div>
      </div>
    );

    const { whitelistEntries, wallets } = this.props;
    if (
      whitelistEntries == null ||
      whitelistEntries.length === 0 ||
      wallets == null ||
      wallets.length === 0
    ) {
      return genNoResult();
    }

    const cardanoNodes = whitelistEntries
      .map(({ url, protocol, publicDeriverId, image }) => {
        const wallet = wallets.find(
          cacheEntry => cacheEntry.publicDeriverId === publicDeriverId
        );
        if (wallet == null) {
          return null;
        }

        return (
          <WalletRow
            key={url}
            url={url}
            protocol={protocol}
            websiteIcon={image}
            isActiveSite={this.props.activeSites.includes(url)}
            onRemoveWallet={this.props.onRemoveWallet}
            balance={wallet.balance}
            plate={wallet.plate}
            shouldHideBalance={this.props.shouldHideBalance}
            getTokenInfo={this.props.getTokenInfo}
            walletName={wallet.name}
            walletType={wallet.type}
          />
        );
      })
      .filter(x => x != null);

    return (
      <div className={styles.component}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div>{intl.formatMessage(messages.walletsLabel)}</div>
            <div>{intl.formatMessage(messages.dappsLabel)}</div>
          </div>
          <div>
            {cardanoNodes.length > 0 && (
              <div className={styles.chain}>
                <h1>{intl.formatMessage(messages.cardanoLabel)}</h1>
                {cardanoNodes}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default (withLayout(ConnectedWebsitesPage): ComponentType<Props>);
