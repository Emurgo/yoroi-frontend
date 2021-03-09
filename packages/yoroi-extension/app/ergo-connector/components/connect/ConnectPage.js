/* eslint-disable no-nested-ternary */
// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { intlShape, defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from './ConnectPage.scss';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { Checkbox } from 'react-polymorph/lib/components/Checkbox';
import { CheckboxSkin } from 'react-polymorph/lib/skins/simple/CheckboxSkin';
import WalletCard from './WalletCard';
import globalMessages, { connectorMessages } from '../../../i18n/global-messages';
import { observer } from 'mobx-react';
import LoadingSpinner from '../../../components/widgets/LoadingSpinner';
import type {
  AccountInfo,
  ConnectingMessage,
} from '../../../../chrome/extension/ergo-connector/types';
import { LoadingWalletStates } from '../../types';
import PlaceholderIcon from '../../assets/images/placeholder_icon.inline.svg';
import ProgressBar from '../ProgressBar';

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
    defaultMessage: '!!!No wallets found',
  },
});

type Props = {|
  accounts: Array<AccountInfo>,
  loading: $Values<typeof LoadingWalletStates>,
  error: string,
  message: ?ConnectingMessage,
  onToggleCheckbox: number => void,
  onCancel: () => void,
  onConnect: number => Promise<void>,
  handleSubmit: () => void,
  selected: number,
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
      accounts,
      message,
      onCancel,
      onToggleCheckbox,
      handleSubmit,
      selected,
    } = this.props;

    const isLoading = (
      loading === LoadingWalletStates.IDLE || loading === LoadingWalletStates.PENDING
    );
    const isSuccess = loading === LoadingWalletStates.SUCCESS;
    const isError = loading === LoadingWalletStates.REJECTED;

    const isCheckedWallet = isSuccess ? Boolean(selected < 0) : [];

    const url = message?.url ?? '';

    return (
      <>
        <ProgressBar step={1} />
        <div className={styles.connectWrapper}>
          {url ? (
            <div className={styles.image}>
              <img src={`https://icons.duckduckgo.com/ip3/${url}.ico`} alt={`${url} favicon`} />
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
          ) : isSuccess ? (
            accounts.length > 0 &&
            accounts.map((item, idx) => (
              <li key={item.name} className={styles.listItem}>
                <Checkbox
                  skin={CheckboxSkin}
                  label={<WalletCard accountInfo={item} />}
                  onChange={() => onToggleCheckbox(idx)}
                  checked={selected === idx}
                  className={styles.checkbox}
                />
              </li>
            ))
          ) : isSuccess && !accounts.length ? (
            <div>{intl.formatMessage(messages.noWalletsFound)}</div>
          ) : null}
        </ul>
        <div className={styles.bottom}>
          <div className={styles.infoText}>
            <p>{intl.formatMessage(messages.connectInfo)}</p>
            <p>{intl.formatMessage(connectorMessages.messageReadOnly)}</p>
          </div>
          <div className={styles.wrapperBtn}>
            <Button
              className="secondary"
              label={intl.formatMessage(globalMessages.cancel)}
              skin={ButtonSkin}
              onClick={onCancel}
            />
            <Button
              label={intl.formatMessage(globalMessages.connectLabel)}
              skin={ButtonSkin}
              disabled={isCheckedWallet}
              onClick={handleSubmit}
            />
          </div>
        </div>
      </>
    );
  }
}

export default ConnectPage;
