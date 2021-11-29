/* eslint-disable no-nested-ternary */
// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { intlShape, defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from './SignTxPage.scss';
import { Button } from '@mui/material';
import TextField from '../../../components/common/TextField';
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
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import {
  MultiToken,
} from '../../../api/common/lib/MultiToken';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import { calculateAndFormatValue } from '../../../utils/unit-of-account';
import classnames from 'classnames';
import type {
  Tx,
  CardanoTx,
} from '../../../../chrome/extension/ergo-connector/types';
import type { CardanoConnectorSignRequest } from '../../types';
import ArrowRight from '../../../assets/images/arrow-right.inline.svg';
import CardanoUtxoDetails from './CardanoUtxoDetails';
import type CardanoTxRequest from '../../../api/ada';

type Props = {|
  +tx: Tx | CardanoTx | CardanoTxRequest,
  +txData: CardanoConnectorSignRequest,
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

const messages = defineMessages({
  title: {
    id: 'connector.signin.title',
    defaultMessage: '!!!Sign transaction',
  },
  txDetails: {
    id: 'connector.signin.txDetails',
    defaultMessage: '!!!Transaction Details',
  },
  receiver: {
    id: 'connector.signin.receiver',
    defaultMessage: '!!!Receiver',
  },
  more: {
    id: 'connector.signin.more',
    defaultMessage: '!!!more'
  }
});

@observer
class SignTxPage extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm(
    {
      fields: {
        showUtxoDetails: {
          type: 'boolean',
          value: false,
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

  toggleUtxoDetails: boolean => void = (newState) => {
    this.form.$('showUtxoDetails').set(newState);
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

  _resolveTokenInfo: TokenEntry => $ReadOnly<TokenRow> = tokenEntry => {
    return this.props.getTokenInfo(tokenEntry);
  }

  renderBundle: {|
    amount: MultiToken,
    render: TokenEntry => Node,
  |} => Node = (request) => {
    return (
      <>
        {request.render(request.amount.getDefaultEntry())}
        {request.amount.nonDefaultEntries().map(entry => (
          <React.Fragment key={entry.identifier}>
            {request.render(entry)}
          </React.Fragment>
        ))}
      </>
    );
  }

  renderAmountDisplay: {|
    entry: TokenEntry,
  |} => Node = (request) => {
    const tokenInfo = this._resolveTokenInfo(request.entry);
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

  renderAddresses(): Node {
    const addresses = this.props.txData.outputs.map(({ address }) =>  address);
    return (
      <div className={styles.toAddresses}>
        {addresses.map((address, idx) => {
          if (idx >= 1) {
            return (
              <button
                className={styles.more}
                type="button"
                onClick={() => this.toggleUtxoDetails(true)}
                key={idx}
              >
                {addresses.length - 1}
                <span>{this.context.intl.formatMessage(messages.more)}</span>
              </button>
            );
          }
          return (<p key={idx}>{address}</p>);
        })}
      </div>
    )
  }


  render(): Node {
    const { form } = this;
    const walletPasswordField = form.$('walletPassword');

    const { intl } = this.context;
    const { txData, onCancel, } = this.props;
    const { showUtxoDetails } = form.values();
    return (
      <>
        <ProgressBar step={2} />
        <div className={styles.component}>
          {
            !showUtxoDetails ?(
              <div>
                <div>
                  <h1 className={styles.title}>{intl.formatMessage(messages.title)}</h1>
                </div>
                <div className={styles.transactionWrapper}>
                  <p className={styles.transactionId}>
                    {intl.formatMessage(messages.receiver)}
                  </p>
                  <div className={styles.hash}>{this.renderAddresses()}</div>
                  <button
                    onClick={() => this.toggleUtxoDetails(true)}
                    type='button'
                    className={styles.utxo}
                  >
                    <p>{intl.formatMessage(messages.txDetails)}</p>
                    <ArrowRight />
                  </button>
                </div>
                <div className={styles.info}>
                  <div className={styles.infoRaw}>
                    <p className={styles.label}>
                      {intl.formatMessage(globalMessages.amount)}
                    </p>
                    <div className={styles.labelValue}>
                      {this.renderAmountDisplay({
                        entry: {
                          identifier: txData.amount.defaults.defaultIdentifier,
                          networkId: txData.amount.defaults.defaultNetworkId,
                          amount: txData.amount.get(
                            txData.amount.defaults.defaultIdentifier
                          ) ?? (new BigNumber('0'))
                        },
                      })}
                    </div>
                  </div>
                  <div className={styles.infoRaw}>
                    <p className={styles.label}>
                      {intl.formatMessage(globalMessages.feeLabel)}
                    </p>
                    <div className={styles.labelValue}>
                      {this.renderAmountDisplay({
                        entry: {
                          identifier: txData.fee.tokenId,
                          networkId: txData.fee.networkId,
                          amount: (new BigNumber(txData.fee.amount)).negated(),
                        },
                      })}
                    </div>
                  </div>
                  <div className={styles.totalAmoundCard}>
                    <p className={styles.totalAmoundLable}>
                      {intl.formatMessage(globalMessages.walletSendConfirmationTotalLabel)}
                    </p>
                    <div className={styles.totalAmound}>
                      {this.renderAmountDisplay({
                        entry: {
                          identifier: txData.total.defaults.defaultIdentifier,
                          networkId: txData.total.defaults.defaultNetworkId,
                          amount: txData.total.get(
                            txData.amount.defaults.defaultIdentifier
                          ) ?? (new BigNumber('0')),
                        },
                      })}
                    </div>
                  </div>
                </div>
                <div className={styles.passwordInput}>
                  <TextField
                    type="password"
                    className={styles.walletPassword}
                    {...walletPasswordField.bind()}
                    error={walletPasswordField.error}
                  />
                </div>
                <div className={styles.wrapperBtn}>
                <Button
                  variant="secondary"
                  className="secondary"
                  onClick={onCancel}
                 >
                    {intl.formatMessage(globalMessages.cancel)}
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!walletPasswordField.isValid}
                    onClick={this.submit.bind(this)}
                  >
                    {intl.formatMessage(globalMessages.confirm)}
                  </Button>
                </div>
              </div>
            ) : (
              <CardanoUtxoDetails
                txData={txData}
                onCopyAddressTooltip={this.props.onCopyAddressTooltip}
                addressToDisplayString={this.props.addressToDisplayString}
                getCurrentPrice={this.props.getCurrentPrice}
                getTokenInfo={this.props.getTokenInfo}
                notification={this.props.notification}
                selectedExplorer={this.props.selectedExplorer}
                unitOfAccountSetting={this.props.unitOfAccountSetting}
                toggleUtxoDetails={this.toggleUtxoDetails}
              />
            )
          }
        </div>
      </>
    );
  }
}

export default SignTxPage;
