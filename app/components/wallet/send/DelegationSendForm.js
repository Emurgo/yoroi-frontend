// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { Input } from 'react-polymorph/lib/components/Input';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import BorderedBox from '../../widgets/BorderedBox';
import styles from './DelegationSendForm.scss';
import globalMessages from '../../../i18n/global-messages';
import config from '../../../config';
import { InputOwnSkin } from '../../../themes/skins/InputOwnSkin';
import WarningBox from '../../widgets/WarningBox';
import type { $npm$ReactIntl$IntlFormat, } from 'react-intl';
import isHexadecimal from 'validator/lib/isHexadecimal';

const messages = defineMessages({
  invalidPoolId: {
    id: 'wallet.delegate.form.invalidPoolId',
    defaultMessage: '!!!Invalid pool id',
  },
});

type Props = {|
  +hasAnyPending: boolean,
  +updatePool: (void | string) => Promise<void>,
  +onNext: void => Promise<void>,
|};

function isValidPool(poolId: string): boolean {
  if (poolId.length !== 56) {
    return false;
  }
  return isHexadecimal(poolId);
}

@observer
export default class DelegationSendForm extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  // FORM VALIDATION
  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      poolId: {
        label: this.context.intl.formatMessage(globalMessages.stakePoolHash),
        placeholder: '',
        value: '',
        validators: [({ field }) => {
          const poolIdValue = field.value;
          if (poolIdValue === '') {
            this.props.updatePool(undefined);
            return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
          }
          const isValid = isValidPool(poolIdValue);
          if (isValid) {
            this.props.updatePool(poolIdValue);
          } else {
            this.props.updatePool(undefined);
          }
          return [isValid, this.context.intl.formatMessage(messages.invalidPoolId)];
        }],
      },
    },
  }, {
    options: {
      showErrorsOnInit: false, // TODO: support URI
      validateOnBlur: false,
      validateOnChange: true,
      validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
    },
    plugins: {
      vjf: vjf()
    },
  });

  render(): Node {
    const { form } = this;
    const { intl } = this.context;

    const poolIdField = form.$('poolId');

    const pendingTxWarningComponent = (
      <div className={styles.warningBox}>
        <WarningBox>
          {intl.formatMessage(globalMessages.pendingTxWarning)}
        </WarningBox>
      </div>
    );

    return (
      <div className={styles.component}>

        {this.props.hasAnyPending && pendingTxWarningComponent}

        <BorderedBox>

          <div className={styles.poolInput}>
            <Input
              className="poolId"
              {...poolIdField.bind()}
              error={poolIdField.error}
              skin={InputOwnSkin}
              done={poolIdField.isValid}
            />
          </div>
          {this._makeInvokeConfirmationButton()}

        </BorderedBox>

      </div>
    );
  }

  _makeInvokeConfirmationButton(): Node {
    const { intl } = this.context;

    const buttonClasses = classnames([
      'primary',
      styles.nextButton,
    ]);

    return (
      <Button
        className={buttonClasses}
        label={intl.formatMessage(globalMessages.nextButtonLabel)}
        onMouseUp={this.props.onNext}
        disabled={this.props.hasAnyPending}
        skin={ButtonSkin}
      />);
  }
}
