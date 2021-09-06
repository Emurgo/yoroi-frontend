/* eslint-disable no-nested-ternary */
// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from './SignTxPage.scss';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { Input } from 'react-polymorph/lib/components/Input';
import { InputOwnSkin } from '../../../themes/skins/InputOwnSkin';
import globalMessages from '../../../i18n/global-messages';
import { observer } from 'mobx-react';
import CopyableAddress from '../../../components/widgets/CopyableAddress';
import config from '../../../config';
import vjf from 'mobx-react-form/lib/validators/VJF';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import type { Notification } from '../../../types/notificationType';
import { splitAmount, truncateAddressShort, truncateToken } from '../../../utils/formatters';
import ProgressBar from '../ProgressBar';
import type {
  DefaultTokenEntry,
  TokenLookupKey,
  TokenEntry,
} from '../../../api/common/lib/MultiToken';
import type { NetworkRow, TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import { getTokenName, getTokenIdentifierIfExists } from '../../../stores/stateless/tokenHelpers';
import BigNumber from 'bignumber.js';
import type { ISignRequest } from '../../../api/common/lib/transactions/ISignRequest';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import {
  MultiToken,
} from '../../../api/common/lib/MultiToken';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import { calculateAndFormatValue } from '../../../utils/unit-of-account';
import classnames from 'classnames';
import { mintedTokenInfo } from '../../../../chrome/extension/ergo-connector/utils';
import type { Tx } from '../../../../chrome/extension/ergo-connector/types';

type Props = {|
  +tx: Tx,
  +txData: ISignRequest<any>,
  +onCopyAddressTooltip: (string, string) => void,
  +onCancel: () => void,
  +onConfirm: string => void,
  +notification: ?Notification,
  +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
  +defaultToken: DefaultTokenEntry,
  +network: $ReadOnly<NetworkRow>,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +addressToDisplayString: string => string,
  +selectedExplorer: SelectedExplorer,
  +getCurrentPrice: (from: string, to: string) => ?number,
|};

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

  getTicker: $ReadOnly<TokenRow> => Node = tokenInfo => {
    const fingerprint = this.getFingerprint(tokenInfo);
    return fingerprint !== undefined
      ? (
        <ExplorableHashContainer
          selectedExplorer={this.props.selectedExplorer}
          hash={fingerprint}
          light
          linkType="token"
        >
          <span className={styles.rowData}>{truncateToken(getTokenName(tokenInfo))}</span>
        </ExplorableHashContainer>
      )
      : truncateToken(getTokenName(tokenInfo))
  };

  getFingerprint: $ReadOnly<TokenRow> => string | void = tokenInfo => {
    if (tokenInfo.Metadata.type === 'Cardano') {
      return getTokenIdentifierIfExists(tokenInfo);
    }
    return undefined;
  }

  // Tokens can be minted inside the transaction so we have to look it up there first
  _resolveTokenInfo: TokenEntry => $ReadOnly<TokenRow> | null  = tokenEntry => {
    const { tx } = this.props;
    const mintedTokens = mintedTokenInfo(tx);
    const mintedToken = mintedTokens.find(t => tokenEntry.identifier === t.Identifier);
    if (mintedToken != null) {
      return mintedToken;
    }

    try {
      return this.props.getTokenInfo(tokenEntry);
    } catch (error) {
      return null
    }
  }

  displayUnAvailableToken: TokenEntry => Node = (tokenEntry) => {
    return (
      <>
        <span className={styles.amountRegular}>{"+"}{tokenEntry.amount.toString()}</span>
        {' '}
        <span>   
          {truncateAddressShort(
           tokenEntry.identifier
          )}
        </span>
      </>
    )
  }

  renderAmountDisplay: {|
    entry: TokenEntry,
  |} => Node = (request) => {
    const tokenInfo = this._resolveTokenInfo(request.entry);
    
    if (tokenInfo == null) return this.displayUnAvailableToken(request.entry)
    const shiftedAmount = request.entry.amount
      .shiftedBy(-tokenInfo.Metadata.numberOfDecimals);

    if (this.props.unitOfAccountSetting.enabled === true) {
      const { currency } = this.props.unitOfAccountSetting;
      const price = this.props.getCurrentPrice(
        request.entry.identifier,
        currency
      );
      if (price != null) {
        return (
          <>
            <span className={styles.amountRegular}>
              {calculateAndFormatValue(shiftedAmount, price)}
            </span>
            {' '}{currency}
            <div className={styles.amountSmall}>
              {shiftedAmount.toString()} {this.getTicker(tokenInfo)}
            </div>
          </>
        );
      }
    }
    const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(
      shiftedAmount,
      tokenInfo.Metadata.numberOfDecimals
    );

    // we may need to explicitly add + for positive values
    const adjustedBefore = beforeDecimalRewards.startsWith('-')
      ? beforeDecimalRewards
      : '+' + beforeDecimalRewards;

    return (
      <>
        <span className={styles.amountRegular}>{adjustedBefore}</span>
        <span className={styles.afterDecimal}>{afterDecimalRewards}</span>
        {' '}{this.getTicker(tokenInfo)}
      </>
    );
  }

  renderRow: {|
    kind: string,
    address: {| address: string, value: MultiToken |},
    addressIndex: number,
    transform?: BigNumber => BigNumber,
  |} => Node = (request) => {
    const notificationElementId = `${request.kind}-address-${request.addressIndex}-copyNotification`;
    const divKey = (identifier) => `${request.kind}-${request.address.address}-${request.addressIndex}-${identifier}`;
    const renderAmount = (entry) => {
      return (
        <div className={styles.amount}>
          {this.renderAmountDisplay({
            entry: {
              ...entry,
              amount: request.transform
                ? request.transform(entry.amount)
                : entry.amount,
            },
          })}
        </div>
      );
    };

    return (
      // eslint-disable-next-line react/no-array-index-key
      <div
        key={divKey(request.address.value.getDefaultEntry().identifier)}
        className={styles.addressItem}
      >
        <CopyableAddress
          hash={this.props.addressToDisplayString(request.address.address)}
          elementId={notificationElementId}
          onCopyAddress={
            () => this.props.onCopyAddressTooltip(request.address.address, notificationElementId)
          }
          notification={this.props.notification}
        >
          <ExplorableHashContainer
            selectedExplorer={this.props.selectedExplorer}
            hash={this.props.addressToDisplayString(request.address.address)}
            light
            linkType="address"
          >
            <span className={classnames([styles.rowData, styles.hash])}>
              {truncateAddressShort(
                this.props.addressToDisplayString(request.address.address)
              )}
            </span>
          </ExplorableHashContainer>
        </CopyableAddress>
        {renderAmount(request.address.value.getDefaultEntry())}
        {request.address.value.nonDefaultEntries().map(entry => (
          <React.Fragment key={divKey(entry.identifier)}>
            <div />
            <div />
            {renderAmount(entry)}
          </React.Fragment>
        ))}
      </div>
    );
  }

  render(): Node {
    const { form } = this;
    const walletPasswordField = form.$('walletPassword');

    const { intl } = this.context;
    const { txData, onCancel, } = this.props;
    return (
      <>
        <ProgressBar step={2} />
        <div className={styles.component}>
          <div>
            <div className={styles.addressHeader}>
              <div className={styles.addressFrom}>
                <p className={styles.label}>
                  {intl.formatMessage(globalMessages.fromAddresses)}:{' '}
                  <span>{txData.inputs().length}</span>
                </p>
              </div>
              <div className={styles.addressFrom}>
                <p className={styles.label}>
                  {intl.formatMessage(globalMessages.amount)}
                </p>
              </div>
            </div>
            <div className={styles.addressFromList}>
              {txData.inputs().map((address, addressIndex) => {
                return this.renderRow({
                  kind: 'in',
                  address,
                  addressIndex,
                  transform: amount => amount.abs().negated(),
                });
              })}
            </div>
            <div className={styles.addressHeader}>
              <div className={styles.addressTo}>
                <p className={styles.label}>
                  {intl.formatMessage(globalMessages.toAddresses)}:{' '}
                  <span>{txData.outputs().length}</span>
                </p>
              </div>
              <div className={styles.addressTo}>
                <p className={styles.label}>
                  {intl.formatMessage(globalMessages.amount)}
                </p>
              </div>
            </div>
            <div className={styles.addressToList}>
              {txData.outputs().map((address, addressIndex) => {
                return this.renderRow({
                  kind: 'in',
                  address,
                  addressIndex,
                  transform: amount => amount.abs(),
                });
              })}
            </div>
            <div className={styles.addressHeader}>
              <div className={styles.addressTo}>
                <p className={styles.label}>
                  {intl.formatMessage(globalMessages.feeLabel)}
                </p>
              </div>
            </div>
            <div className={styles.addressToList}>
              <div className={styles.amount}>
                {this.renderAmountDisplay({
                  entry: {
                    ...txData.fee().getDefaultEntry(),
                    amount: txData.fee().getDefaultEntry().amount.abs().negated(),
                  },
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
      </>
    );
  }
}

export default SignTxPage;
