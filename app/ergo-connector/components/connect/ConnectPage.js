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
import globalMessages from '../../../i18n/global-messages';
import { observer } from 'mobx-react';

const messages = defineMessages({
  subtitle: {
    id: 'ergo-connector.label.connect',
    defaultMessage: '!!!Connect to',
  },
  selectAllWallets: {
    id: 'ergo-connector.label.selectAllWallets',
    defaultMessage: '!!!Select all wallets',
  },
  labelConnect: {
    id: 'global.labels.connect',
    defaultMessage: '!!!Connect',
  },
  connectInfo: {
    id: 'ergo-connector.connect.info',
    defaultMessage: '!!!Your connection preferences will be saved to your Yoroi dApp list',
  },
  noWalletsFound: {
    id: 'ergo-connector.connect.noWalletsFound',
    defaultMessage: '!!! Not found any wallet, Try again',
  },
});

type Props = {|
  accounts: Array<Object>,
  loading: 'idle' | 'pending' | 'success' | 'rejected',
  error: string,
  message?: {| tabId: number, url: string |},
  onToggleCheckbox: number => void,
  onCancel: () => void,
  onConnect: number => void,
  handleSubmit: () => void,
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
      // error,
      accounts,
      message,
      onCancel,
      onToggleCheckbox,
      handleSubmit,
    } = this.props;

    const isCheckedWallet = accounts
      ? Boolean(accounts.findIndex(item => item.checked === true))
      : [];
    const isLoading = loading === 'idle' || loading === 'pending';
    const isSuccess = loading === 'success';
    const isError = loading === 'rejected';

    return (
      <>
        <div className={styles.connectWrapper}>
          <div className={styles.image}>
            <img src="" alt="" />
          </div>
          <div className={styles.title}>
            <h2>{intl.formatMessage(messages.subtitle)}</h2>
            <p>{message?.url ?? ''}</p>
          </div>
        </div>
        <ul className={styles.list}>
          {isError ? (
            <div className={styles.errorMessage}>
              Oops ... something went wrong. please try again later
            </div>
          ) : null}
          {isLoading ? (
            <p>Loading ...</p>
          ) : isSuccess ? (
            accounts.length > 0 && (
              <>
                <li className={styles.listItem}>
                  {/* TODO: Check multiple wallets */}
                  <Checkbox
                    skin={CheckboxSkin}
                    label={intl.formatMessage(messages.selectAllWallets)}
                    disabled
                  />
                </li>
                {accounts.map((item, idx) => (
                  <li key={item.name} className={styles.listItem}>
                    <Checkbox
                      skin={CheckboxSkin}
                      label={<WalletCard name={item.name} balance={item.balance} />}
                      onChange={() => onToggleCheckbox(idx)}
                      checked={item.checked || false}
                    />
                  </li>
                ))}
              </>
            )
          ) : isSuccess && !accounts.length ? (
            <div>{intl.formatMessage(messages.noWalletsFound)}</div>
          ) : null}
        </ul>
        <div className={styles.bottom}>
          <p>{intl.formatMessage(messages.connectInfo)} </p>
          <div className={styles.wrapperBtn}>
            <Button
              className="secondary"
              label={intl.formatMessage(globalMessages.cancel)}
              skin={ButtonSkin}
              onClick={onCancel}
            />
            <Button
              label={intl.formatMessage(messages.labelConnect)}
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
