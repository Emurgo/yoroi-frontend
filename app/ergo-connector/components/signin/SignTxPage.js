/* eslint-disable no-nested-ternary */
// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { intlShape, defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from './SignTxPage.scss';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { Input } from 'react-polymorph/lib/components/Input';
import { InputOwnSkin } from '../../../themes/skins/InputOwnSkin';
import globalMessages from '../../../i18n/global-messages';
import { observer } from 'mobx-react';
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
  totalMount: ?number,
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

const URL_WEBSITE = 'https://explorer.ergoplatform.com/en/addresses/';

@observer
class SignTxPage extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm(
    {
      fields: {
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
    const { form } = this;
    const walletPasswordField = form.$('walletPassword');

    const { intl } = this.context;
    const { txData, onCopyAddressTooltip, onCancel, notification, totalMount } = this.props;

    return (
      <div className={styles.component}>
        <div className={styles.row}>
          <p className={styles.label}>{intl.formatMessage(globalMessages.transactionId)}</p>
          <p className={styles.value}>{txData.id}</p>
        </div>
        <div className={styles.details}>
          <div>
            <p className={styles.label}>{intl.formatMessage(globalMessages.amount)}</p>
            {txData.outputs.map(({ value, assets }) => {
              return (
                <div className={styles.amountRow}>
                  <p className={styles.amount}>{value} ERG</p>
                  {assets && assets.length ? (
                    assets.map(({ tokenId, amount }) => (
                      <p className={styles.stablecoins}>
                        {amount} {tokenId}
                      </p>
                    ))
                  ) : (
                    <p className={styles.tokens}>No tokens</p>
                  )}
                </div>
              );
            })}
          </div>
          <div className={styles.transactionFee}>
            {/* TODO: Fee value */}
            {/* <p className={styles.label}>{intl.formatMessage(globalMessages.feeLabel)}</p> */}
            {/* <p className={styles.amount}>5.050088 ERG</p> */}
          </div>
        </div>
        <div className={styles.row}>
          <p className={styles.label}>
            {intl.formatMessage(globalMessages.walletSendConfirmationTotalLabel)}
          </p>
          <p className={styles.totalValue}>{totalMount} ERG</p>
        </div>
        <div className={styles.address}>
          <div className={styles.addressFrom}>
            <p className={styles.label}>
              {intl.formatMessage(messages.fromAddresses)}: <span>{txData.inputs.length}</span>
            </p>
            <div className={styles.addressFromList}>
              {txData.inputs?.map((address, index) => {
                const notificationElementId = `ergo-input-${index}`;
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
                        url={URL_WEBSITE + address.boxId}
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
                        url={URL_WEBSITE + address.boxId}
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
