/* eslint-disable no-nested-ternary */
// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { intlShape, defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from './SignTxPage.scss';
import classNames from 'classnames';

import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { Input } from 'react-polymorph/lib/components/Input';
import { InputOwnSkin } from '../../../themes/skins/InputOwnSkin';

// import { Checkbox } from 'react-polymorph/lib/components/Checkbox';
// import { CheckboxSkin } from 'react-polymorph/lib/skins/simple/CheckboxSkin';
import globalMessages from '../../../i18n/global-messages';
import { observer } from 'mobx-react';
import { Select } from 'react-polymorph/lib/components/Select';
import { SelectSkin } from 'react-polymorph/lib/skins/simple/SelectSkin';
import WalletCard from '../connect/WalletCard';
import CopyableAddress from '../../../components/widgets/CopyableAddress';
import RawHash from '../../../components/widgets/hashWrappers/RawHash';
import config from '../../../config';
import vjf from 'mobx-react-form/lib/validators/VJF';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import { handleExternalLinkClick } from '../../../utils/routing';
import ExplorableHash from '../../../components/widgets/hashWrappers/ExplorableHash';
import type { Notification } from '../../../types/notificationType';

const messages = defineMessages({
  fromAddresses: {
    id: 'ergo-connector.signtx.fromAdrdesses',
    defaultMessage: '!!!From addresses',
  },
  toAddresses: {
    id: 'ergo-connector.signtx.toAdrdesses',
    defaultMessage: '!!!To addresses',
  },
});

type Props = {|
  accounts: Array<Object>,
  loading: 'idle' | 'pending' | 'success' | 'rejected',
  error: string,
  txData: any,
  onCopyAddressTooltip: (string, string) => void,
  onCancel: () => void,
  onConfirm: string => void,
  +notification: ?Notification,
|};

function truncateFormatter(addr: string, cutoff: number): string {
  const shortener = '...';

  if (addr.length + shortener.length <= cutoff) {
    return addr;
  }
  return (
    addr.substring(0, cutoff / 2) + '...' + addr.substring(addr.length - cutoff / 2, addr.length)
  );
}
@observer
class SignTxPage extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm(
    {
      fields: {
        walletId: {
          label: this.context.intl.formatMessage(globalMessages.languageSelectLabel),
          value: 0,
        },
        walletPassword: {
          type: 'password',
          label: this.context.intl.formatMessage(globalMessages.walletPasswordLabel),
          placeholder: this.context.intl.formatMessage(
            globalMessages.walletPasswordFieldPlaceholder
          ),
          value: '',
          validators: [
            ({ field }) => {
              if (field.value === '') {
                return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
              }
              return [true];
            },
          ],
        },
      },
    },
    {
      options: {
        validateOnChange: true,
        validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
      },
      plugins: {
        vjf: vjf(),
      },
    }
  );

  submit(): void {
    this.form.submit({
      onSuccess: form => {
        const { walletPassword } = form.values();
        this.props.onConfirm(walletPassword);
      },
      onError: () => {},
    });
  }

  render(): Node {
    const { loading, accounts } = this.props;
    const isSuccess = loading === 'success';

    const { form } = this;
    const walletIdField = form.$('walletId');
    const walletPasswordField = form.$('walletPassword');

    const languageSelectClassNames = classNames([
      styles.language,
      true ? styles.submitLanguageSpinner : null,
    ]);
    const walletOptions = accounts.map((account, idx) => ({
      name: account.name,
      balance: account.balance,
      value: idx,
    }));

    const { intl } = this.context;
    const { txData, onCopyAddressTooltip, onCancel, notification } = this.props;
    return (
      <div className={styles.component}>
        {isSuccess ? (
          <Select
            className={languageSelectClassNames}
            options={walletOptions}
            {...walletIdField.bind()}
            label="Select Wallet"
            // onChange={}
            skin={SelectSkin}
            optionRenderer={option => <WalletCard name={option.name} balance={option.balance} />}
          />
        ) : null}
        <div className={styles.row}>
          <p className={styles.label}>{intl.formatMessage(globalMessages.transactionId)}</p>
          <p className={styles.value}>{txData.id}</p>
        </div>
        <div className={styles.details}>
          <div>
            {/* TODO: */}
            <p className={styles.label}>{intl.formatMessage(globalMessages.amount)}</p>
            <p className={styles.amount}>456,45.000000 ADA</p>
            <p className={styles.stablecoins}>100 Chris stablecoins</p>
            <p className={styles.tokens}>2 Marta tokens</p>
          </div>
          <div className={styles.transactionFee}>
            <p className={styles.label}>{intl.formatMessage(globalMessages.feeLabel)}</p>
            <p className={styles.amount}>5.050088 ADA</p>
          </div>
        </div>
        <div className={styles.row}>
          <p className={styles.label}>
            {intl.formatMessage(globalMessages.walletSendConfirmationTotalLabel)}
          </p>
          <p className={styles.totalValue}>456,45.000000 ADA</p>
        </div>
        <div className={styles.address}>
          <div className={styles.addressFrom}>
            <p className={styles.label}>
              {intl.formatMessage(messages.fromAddresses)}: <span>{txData.inputs.length}</span>
            </p>
            <div className={styles.addressFromList}>
              {txData.inputs?.map((address, index) => {
                const notificationElementId = `address-${index}-copyNotification`;
                return (
                  <div className={styles.addressToItem}>
                    <CopyableAddress
                      hash={address.address}
                      elementId={notificationElementId}
                      onCopyAddress={() =>
                        onCopyAddressTooltip(address.boxId, notificationElementId)
                      }
                      notification={notification}
                    >
                      <ExplorableHash
                        light
                        websiteName="ErgoPlatform Blockchain Explorer"
                        url={'https://explorer.ergoplatform.com/en/addresses/' + address.boxId}
                        onExternalLinkClick={handleExternalLinkClick}
                      >
                        <RawHash light>
                          <span className={styles.addressHash}>
                            {truncateFormatter(address.boxId, 12)}
                          </span>
                        </RawHash>
                      </ExplorableHash>
                    </CopyableAddress>
                  </div>
                );
              })}
            </div>
          </div>
          <div className={styles.addressTo}>
            <p className={styles.label}>
              {intl.formatMessage(messages.toAddresses)}: <span>{txData.outputs.length}</span>
            </p>
            <div className={styles.addressToList}>
              {txData.outputs?.map((address, index) => {
                const notificationElementId = `address-output-${index}-copyNotification`;
                return (
                  <div className={styles.addressToItem}>
                    <CopyableAddress
                      hash={address.address}
                      elementId={notificationElementId}
                      onCopyAddress={() =>
                        onCopyAddressTooltip(address.boxId, notificationElementId)
                      }
                      notification={notification}
                    >
                      <ExplorableHash
                        light={false}
                        websiteName="ErgoPlatform Blockchain Explorer"
                        url={'https://explorer.ergoplatform.com/en/addresses/' + address.boxId}
                        onExternalLinkClick={handleExternalLinkClick}
                      >
                        <RawHash light={false}>
                          <span className={styles.addressHash}>
                            {truncateFormatter(address.boxId, 12)}
                          </span>
                        </RawHash>
                      </ExplorableHash>
                    </CopyableAddress>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className={styles.passwordInput}>
          <Input
            type="password"
            className={styles.walletPassword}
            {...walletPasswordField.bind()}
            error={walletPasswordField.error}
            skin={InputOwnSkin}
          />
        </div>
        <div className={styles.wrapperBtn}>
          <Button
            className="secondary"
            label={intl.formatMessage(globalMessages.cancel)}
            skin={ButtonSkin}
            onClick={onCancel}
          />
          <Button
            label={intl.formatMessage(globalMessages.confirm)}
            skin={ButtonSkin}
            disabled={!walletPasswordField.isValid}
            onClick={this.submit.bind(this)}
          />
        </div>
      </div>
    );
  }
}

export default SignTxPage;
