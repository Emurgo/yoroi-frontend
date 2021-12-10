/* eslint-disable no-nested-ternary */
// @flow
// eslint-disable-next-line no-unused-vars
import React, { Component } from 'react';
import type { Node } from 'react';
import { intlShape, defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from './SignTxPage.scss';
import { Button } from '@mui/material';
import TextField from '../../../components/common/TextField';
import globalMessages from '../../../i18n/global-messages';
import { observer } from 'mobx-react';
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
import type { ISignRequest } from '../../../api/common/lib/transactions/ISignRequest';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import { calculateAndFormatValue } from '../../../utils/unit-of-account';
import { mintedTokenInfo } from '../../../../chrome/extension/ergo-connector/utils';
import type { Tx } from '../../../../chrome/extension/ergo-connector/types';
import { Logger } from '../../../utils/logging';
import UtxoDetails from './UtxoDetails';
import ArrowRight from '../../../assets/images/arrow-right.inline.svg';

type Props = {|
  +tx: Tx,
  +txData: ISignRequest<any>,
  +onCopyAddressTooltip: (string, string) => void,
  +onCancel: () => void,
  +onConfirm: string => void,
  +notification: ?Notification,
  +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow> | null,
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

type State = {|
  showUtxoDetails: boolean,
  currentWindowHeight: number,
|}

@observer
class SignTxPage extends Component<Props, State> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    showUtxoDetails: false,
    currentWindowHeight: window.innerHeight
  }

  componentDidMount() {
    window.onresize = this.updateWindowHieght
  }

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
    const mintedTokens = mintedTokenInfo(tx, Logger.info);
    const mintedToken = mintedTokens.find(t => tokenEntry.identifier === t.Identifier);
    if (mintedToken != null) {
      return mintedToken;
    }

    return this.props.getTokenInfo(tokenEntry);
  }

  displayUnAvailableToken: TokenEntry => Node = (tokenEntry) => {
    return (
      <>
        <span className={styles.amountRegular}>{'+'}{tokenEntry.amount.toString()}</span>
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
            <div className={styles.amountRegular}>
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
      ? beforeDecimalRewards.slice(1)
      : '+' + beforeDecimalRewards;

    return (
      <>
        <span className={styles.amountRegular}>
          {adjustedBefore}{afterDecimalRewards}
        </span> {this.getTicker(tokenInfo)}
      </>
    );
  }

  renderAddresses(): Node {
    const addresses = this.props.txData.outputs().map(({ address }) =>  address )
    return (
      <div className={styles.toAddresses}>
        <p className={styles.address}>{addresses[0]}</p>
        <button className={styles.more} type='button' onClick={() => this.toggleUtxoDetails(true)}>
          {addresses.length - 1} <span>{this.context.intl.formatMessage(messages.more)}</span>
        </button>
      </div>
    )
  }

  toggleUtxoDetails: boolean => void = (newState) => {
    this.setState({ showUtxoDetails: newState })
  }

  updateWindowHieght: void => void = () => {
    this.setState({ currentWindowHeight: window.innerHeight })
  }

  render(): Node {
    const { form } = this;
    const walletPasswordField = form.$('walletPassword');

    const { intl } = this.context;
    const { txData, onCancel, } = this.props;
    const { showUtxoDetails, currentWindowHeight } = this.state
    const totalInput = txData.totalInput();
    const fee = txData.fee()
    const amount = totalInput.joinSubtractCopy(fee)
    return (
      <>
        <ProgressBar step={2} />
        <div
          style={{
            height: currentWindowHeight + 'px',
          }}
        >
          {
         !showUtxoDetails ? (
           <div
             className={styles.component}
           >
             <div>
               <h1 className={styles.title}>{intl.formatMessage(messages.title)}</h1>
             </div>
             <div className={styles.transactionWrapper}>
               <p className={styles.transactionId}>
                 {intl.formatMessage(messages.receiver)}
               </p>
               <p className={styles.hash}>{this.renderAddresses()}</p>
               <button onClick={() => this.toggleUtxoDetails(true)} type='button' className={styles.utxo}>
                 <p>{intl.formatMessage(messages.txDetails)}</p>
                 <ArrowRight />
               </button>
             </div>
             <div className={styles.info}>
               <div className={styles.infoRaw}>
                 <p className={styles.label}>{intl.formatMessage(globalMessages.amount)}</p>
                 <p className={styles.labelValue}>
                   {this.renderAmountDisplay({
                        entry: {
                          ...amount.getDefaultEntry(),
                          amount: amount.getDefaultEntry().amount.abs().negated(),
                        },
                      }
                    )}
                 </p>
               </div>
               <div className={styles.infoRaw}>
                 <p className={styles.label}>{intl.formatMessage(globalMessages.feeLabel)}</p>
                 <p className={styles.labelValue}>
                   {this.renderAmountDisplay({
                        entry: {
                          ...txData.fee().getDefaultEntry(),
                          amount: txData.fee().getDefaultEntry().amount.abs().negated(),
                        },
                      })}
                 </p>
               </div>
               <div className={styles.totalAmoundCard}>
                 <p className={styles.totalAmoundLable}>
                   {intl.formatMessage(globalMessages.walletSendConfirmationTotalLabel)}
                 </p>
                 <p className={styles.totalAmound}>
                   {this.renderAmountDisplay({
                        entry: {
                          ...totalInput.getDefaultEntry(),
                          amount: totalInput.getDefaultEntry().amount.abs().negated(),
                        },
                      }
                     )}
                 </p>
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
               <Button fullWidth variant="secondary" onClick={onCancel}>
                 {intl.formatMessage(globalMessages.cancel)}
               </Button>
               <Button
                 variant="primary"
                 fullWidth
                 disabled={!walletPasswordField.isValid}
                 onClick={this.submit.bind(this)}
               >
                 {intl.formatMessage(globalMessages.confirm)}
               </Button>
             </div>
           </div>
         ): <UtxoDetails
           txData={txData}
           onCopyAddressTooltip={this.props.onCopyAddressTooltip}
           addressToDisplayString={this.props.addressToDisplayString}
           getCurrentPrice={this.props.getCurrentPrice}
           getTokenInfo={this.props.getTokenInfo}
           notification={this.props.notification}
           selectedExplorer={this.props.selectedExplorer}
           tx={this.props.tx}
           unitOfAccountSetting={this.props.unitOfAccountSetting}
           toggleUtxoDetails={this.toggleUtxoDetails}
         />
        }
        </div>
      </>
    );
  }
}

export default SignTxPage;
