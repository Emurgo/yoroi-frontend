/* eslint-disable no-nested-ternary */
// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { intlShape, defineMessages, FormattedHTMLMessage } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import classNames from 'classnames';
import styles from './ConnectPage.scss';
import { styled, Typography } from '@mui/material';
import WalletCard from './WalletCard';
import { connectorMessages } from '../../../i18n/global-messages';
import { observer } from 'mobx-react';
import LoadingSpinner from '../../../components/widgets/LoadingSpinner';
import type {
  PublicDeriverCache,
  ConnectingMessage,
} from '../../../../chrome/extension/ergo-connector/types';
import { LoadingWalletStates } from '../../types';
import ProgressBar from '../ProgressBar';
import type { TokenLookupKey } from '../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import { environment } from '../../../environment';
import type { WalletChecksum } from '@emurgo/cip4-js';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver';
import { Box } from '@mui/system';
import NoItemsFoundImg from '../../assets/images/no-websites-connected.inline.svg';

const messages = defineMessages({
  subtitle: {
    id: 'ergo-connector.label.connect',
    defaultMessage: '!!!Connect to',
  },
  connectWallet: {
    id: 'ergo-connector.label.connectWallet',
    defaultMessage: '!!!Connect Wallet',
  },
  yourWallets: {
    id: 'ergo-connector.label.yourWallets',
    defaultMessage: '!!!Your Wallets',
  },
  selectAllWallets: {
    id: 'ergo-connector.label.selectAllWallets',
    defaultMessage: '!!!Select all wallets',
  },
  connectInfo: {
    id: 'ergo-connector.connect.info',
    defaultMessage: '!!!Your connection preferences will be saved to your Yoroi dApp list.',
  },
  noWalletsFound: {
    id: 'ergo-connector.connect.noWalletsFound',
    defaultMessage: '!!!Ooops, no {network} wallets found',
  },
});

type Props = {|
  +publicDerivers: Array<PublicDeriverCache>,
  +loading: $Values<typeof LoadingWalletStates>,
  +error: string,
  +message: ?ConnectingMessage,
  +onSelectWallet: (PublicDeriver<>, ?WalletChecksum) => void,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +network: string,
  +shouldHideBalance: boolean,
|};

@observer
class ConnectPage extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const {
      loading,
      error,
      publicDerivers,
      message,
      onSelectWallet,
      network,
      shouldHideBalance,
    } = this.props;

    const isNightly = environment.isNightly();
    const componentClasses = classNames([styles.component, isNightly && styles.isNightly]);

    const isLoading =
      loading === LoadingWalletStates.IDLE || loading === LoadingWalletStates.PENDING;
    const isSuccess = loading === LoadingWalletStates.SUCCESS;
    const isError = loading === LoadingWalletStates.REJECTED;

    const url = message?.url ?? '';
    const faviconUrl = message?.imgBase64Url;

    return (
      <div className={componentClasses}>
        {isSuccess && publicDerivers.length ? (
          <>
            <ProgressBar step={1} />
            <Typography
              variant="h3"
              color="var(--yoroi-palette-gray-900)"
              marginTop="20px"
              paddingLeft="32px"
              fontWeight="400"
            >
              {intl.formatMessage(messages.connectWallet)}
            </Typography>
            <div className={styles.connectWrapper}>
              {faviconUrl != null && faviconUrl !== '' ? (
                <div className={styles.image}>
                  <img src={faviconUrl} alt={`${url} favicon`} />
                </div>
              ) : null}
              <Box marginTop="16px">
                <Typography variant="h5" fontWeight="300" color="var(--yoroi-palette-gray-900)">
                  {intl.formatMessage(messages.subtitle)}{' '}
                  <Typography as="span" variant="h5" fontWeight="500">
                    {url}
                  </Typography>
                </Typography>
              </Box>
            </div>
          </>
        ) : null}

        <ul className={styles.list}>
          {isError ? <div className={styles.errorMessage}>{error}</div> : null}
          {isLoading ? (
            <div className={styles.loading}>
              <LoadingSpinner />
            </div>
          ) : isSuccess && publicDerivers.length ? (
            <Box>
              <Typography
                variant="h5"
                fontWeight="300"
                color="var(--yoroi-palette-gray-600)"
                mb="14px"
              >
                {intl.formatMessage(messages.yourWallets)}
              </Typography>
              {publicDerivers.map(item => (
                <li key={item.name} className={styles.listItem}>
                  <WalletButton onClick={() => onSelectWallet(item.publicDeriver, item.checksum)}>
                    <WalletCard
                      shouldHideBalance={shouldHideBalance}
                      publicDeriver={item}
                      getTokenInfo={this.props.getTokenInfo}
                    />
                  </WalletButton>
                </li>
              ))}
            </Box>
          ) : isSuccess && !publicDerivers.length ? (
            <Box display="flex" flexDirection="column" alignItems="center" pt={4}>
              <NoItemsFoundImg style={{ width: 170 }} />
              <Typography variant="h3" fontWeight="400" color="var(--yoroi-palette-gray-900)">
                <FormattedHTMLMessage {...messages.noWalletsFound} values={{ network }} />
              </Typography>
            </Box>
          ) : null}
        </ul>

        {isSuccess && publicDerivers.length ? (
          <div className={styles.bottom}>
            <div className={styles.infoText}>
              <p>{intl.formatMessage(messages.connectInfo)}</p>
              <p>{intl.formatMessage(connectorMessages.messageReadOnly)}</p>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

export default ConnectPage;

const WalletButton = styled('button')({
  cursor: 'pointer',
  width: '100%',
  fontSize: '1rem',
  paddingTop: 5,
  paddingBottom: 5,
});
