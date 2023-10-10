// @flow
import type { Node, ComponentType } from 'react';
import type { WhitelistEntry } from '../../../../chrome/extension/connector/types';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import type { TokenLookupKey, MultiToken } from '../../../api/common/lib/MultiToken';
import type { ConceptualWalletSettingsCache } from '../../../stores/toplevel/WalletSettingsStore';
import type { WalletChecksum } from '@emurgo/cip4-js';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { ReactComponent as NoDappsFoundImg } from '../../../assets/images/dapp-connector/no-dapps-connected.inline.svg';
import { ReactComponent as NoDappsConnected } from '../../../assets/images/revamp/no-dapps-connected.inline.svg';
import { defineMessages, intlShape } from 'react-intl';
import { connectorMessages } from '../../../i18n/global-messages';
import { isErgo } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver';
import { withLayout } from '../../../styles/context/layout';
import styles from './ConnectedWebsitesPage.scss';
import WalletRow from './WalletRow';
import WalletRowRevamp from './WalletRowRevamp';
import { Box, Typography } from '@mui/material';

type WalletInfo = {| balance: null | MultiToken, plate: WalletChecksum |};
type Props = {|
  +whitelistEntries: ?Array<WhitelistEntry>,
  +activeSites: Array<string>,
  +wallets: ?Array<PublicDeriver<>>,
  +onRemoveWallet: ({| url: ?string, protocol: ?string |}) => void,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +shouldHideBalance: boolean,
  +getConceptualWallet: (PublicDeriver<>) => ConceptualWalletSettingsCache,
  +getWalletInfo: (PublicDeriver<>) => WalletInfo,
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
  ergoLabel: {
    id: 'connector.connected-dapps.ergoLabel',
    defaultMessage: '!!!Ergo, ERG',
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
            <Typography variant="h5" fontWeight={500} mb="8px">
              {intl.formatMessage(messages.noWebsitesConnected)}
            </Typography>
            <Typography variant="body1" color="grayscale.600">
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
      .map(({ url, protocol, publicDeriverId, image }) => {
        const wallet = wallets.find(
          cacheEntry => cacheEntry.getPublicDeriverId() === publicDeriverId
        );

        if (wallet == null) return null;

        const isErgoWallet = isErgo(wallet.getParent().getNetworkInfo());
        if (isErgoWallet) return null;

        const { balance, plate } = this.props.getWalletInfo(wallet);

        return [
          <WalletRowRevamp
            key={url}
            url={url}
            protocol={protocol}
            websiteIcon={image}
            onRemoveWallet={this.props.onRemoveWallet}
            balance={balance}
            plate={plate}
            shouldHideBalance={this.props.shouldHideBalance}
            getTokenInfo={this.props.getTokenInfo}
            settingsCache={this.props.getConceptualWallet(wallet)}
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
          <Typography fontWeight={500} variant="h5">
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
            <Typography variant="body2">{intl.formatMessage(messages.walletsLabel)}</Typography>
          </Box>
          <Box width="100%">
            <Typography variant="body2">{intl.formatMessage(messages.dappsLabel)}</Typography>
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
          <p>{intl.formatMessage(connectorMessages.messageReadOnly)}</p>
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

    const { ergoNodes, cardanoNodes } = whitelistEntries
      .map(({ url, protocol, publicDeriverId, image }) => {
        const wallet = wallets.find(
          cacheEntry => cacheEntry.getPublicDeriverId() === publicDeriverId
        );
        if (wallet == null) {
          return [null, null];
        }
        const { balance, plate } = this.props.getWalletInfo(wallet);
        return [
          isErgo(wallet.getParent().getNetworkInfo()),
          <WalletRow
            key={url}
            url={url}
            protocol={protocol}
            websiteIcon={image}
            isActiveSite={this.props.activeSites.includes(url)}
            onRemoveWallet={this.props.onRemoveWallet}
            balance={balance}
            plate={plate}
            shouldHideBalance={this.props.shouldHideBalance}
            getTokenInfo={this.props.getTokenInfo}
            settingsCache={this.props.getConceptualWallet(wallet)}
          />,
        ];
      })
      .reduce(
        (acc, [isWalletErgo, node]) => {
          if (node != null) {
            acc[isWalletErgo === true ? 'ergoNodes' : 'cardanoNodes'].push(node);
          }
          return acc;
        },
        { ergoNodes: [], cardanoNodes: [] }
      );

    return (
      <div className={styles.component}>
        <div className={styles.container}>
          <div className={styles.header}>
            <p>{intl.formatMessage(messages.walletsLabel)}</p>
            <p>{intl.formatMessage(messages.dappsLabel)}</p>
          </div>
          <div>
            {cardanoNodes.length > 0 && (
              <div className={styles.chain}>
                <h1>{intl.formatMessage(messages.cardanoLabel)}</h1>
                {cardanoNodes}
              </div>
            )}

            {cardanoNodes.length > 0 && ergoNodes.length > 0 && <div className={styles.line} />}

            {ergoNodes.length > 0 && (
              <div className={styles.chain}>
                <h1>{intl.formatMessage(messages.ergoLabel)}</h1>
                {ergoNodes}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default (withLayout(ConnectedWebsitesPage): ComponentType<Props>);
