/* eslint-disable no-nested-ternary */
// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { intlShape, defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import classNames from 'classnames';
import styles from './ConnectPage.scss';
import { Button } from '@mui/material';
import WalletCard from './WalletCard';
import globalMessages, { connectorMessages } from '../../../i18n/global-messages';
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
import CheckboxLabel from '../../../components/common/CheckboxLabel';
import type { WalletChecksum } from '@emurgo/cip4-js';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver';
import NoWalletImage from '../../assets/images/no-websites-connected.inline.svg'

const messages = defineMessages({
  subtitle: {
    id: 'ergo-connector.label.connect',
    defaultMessage: '!!!Connect to',
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
    defaultMessage: '!!!Ooops, no {network} wallets found.',
  },
  createWallet: {
    id: 'ergo-connector.connect.createWallet',
    defaultMessage: '!!!create wallet',
  },
});

type Props = {|
  +publicDerivers: Array<PublicDeriverCache>,
  +loading: $Values<typeof LoadingWalletStates>,
  +error: string,
  +message: ?ConnectingMessage,
  +onToggleCheckbox: (PublicDeriver<>, ?WalletChecksum) => void,
  +onCancel: () => void,
  +handleSubmit: () => void,
  +selected: number,
  +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
  +network: string,
  +shouldHideBalance: boolean,
|};

@observer
class ConnectPage extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  onCreateWallet: void => void = () => {
    window.chrome.tabs.create({
      url: `${window.location.origin}/main_window.html#/wallets/add`
    })

    this.props.onCancel()
  }

  render(): Node {
    const { intl } = this.context;
    const {
      loading,
      error,
      publicDerivers,
      message,
      onCancel,
      onToggleCheckbox,
      handleSubmit,
      selected,
      network,
      shouldHideBalance,
    } = this.props;

    const isNightly = environment.isNightly()
    const componentClasses = classNames([
      styles.component,
      isNightly && styles.isNightly
    ]);

    const isLoading = (
      loading === LoadingWalletStates.IDLE || loading === LoadingWalletStates.PENDING
    );
    const isSuccess = loading === LoadingWalletStates.SUCCESS;
    const isError = loading === LoadingWalletStates.REJECTED;

    const isCheckedWallet = isSuccess ? Boolean(selected < 0) : [];

    const url = message?.url ?? '';
    const faviconUrl = message?.imgBase64Url;

    if (isSuccess && !publicDerivers.length) {
      return (
        <div className={styles.noWallets}>
          <div className={styles.noWalletsImage}>
            <NoWalletImage />
          </div>
          <div>
            <p className={styles.noWalletsText}>
              {intl.formatMessage(messages.noWalletsFound, { network })}
            </p>
            <button className={styles.createWallet} onClick={this.onCreateWallet} type="button">
              {intl.formatMessage(messages.createWallet)}
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className={componentClasses}>
        <ProgressBar step={1} />
        <div className={styles.connectWrapper}>
          {faviconUrl != null && faviconUrl !== '' ? (
            <div className={styles.image}>
              <img src={faviconUrl} alt={`${url} favicon`} />
            </div>
          ) : null}
          <div className={styles.title}>
            <h2>{intl.formatMessage(messages.subtitle)}</h2>
            <p>{url}</p>
          </div>
        </div>
        <ul className={styles.list}>
          {isError ? <div className={styles.errorMessage}>{error}</div> : null}
          {isLoading ? (
            <div className={styles.loading}>
              <LoadingSpinner />
            </div>
          ) : isSuccess && publicDerivers.length ? (
            publicDerivers.map(item => (
              <li key={item.name} className={styles.listItem}>
                <CheckboxLabel
                  label={
                    <WalletCard
                      shouldHideBalance={shouldHideBalance}
                      publicDeriver={item}
                      getTokenInfo={this.props.getTokenInfo}
                    />
                  }
                  onChange={() => onToggleCheckbox(
                    item.publicDeriver,
                    item.checksum,
                  )}
                  checked={selected === item.publicDeriver.getPublicDeriverId()}
                />
              </li>
            ))
          ) : null}
        </ul>
        <div className={styles.bottom}>
          <div className={styles.infoText}>
            <p>{intl.formatMessage(messages.connectInfo)}</p>
            <p>{intl.formatMessage(connectorMessages.messageReadOnly)}</p>
          </div>
          <div className={styles.wrapperBtn}>
            <Button variant="secondary" onClick={onCancel} sx={{ minWidth: 'unset', flex: 1 }}>
              {intl.formatMessage(globalMessages.cancel)}
            </Button>
            <Button
              variant="primary"
              disabled={isCheckedWallet}
              onClick={handleSubmit}
              sx={{ minWidth: 'unset', flex: 1 }}
            >
              {intl.formatMessage(globalMessages.connectLabel)}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ConnectPage;
