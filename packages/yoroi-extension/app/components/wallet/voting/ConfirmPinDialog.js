// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { observable, action } from 'mobx';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import globalMessages from '../../../i18n/global-messages';

import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import DialogBackButton from '../../widgets/DialogBackButton';
import ProgressStepBlock from './ProgressStepBlock';
import { ProgressInfo } from '../../../stores/ada/VotingStore';
import PinInput from '../../widgets/forms/PinInput';

import styles from './ConfirmPinDialog.scss';
import type { StepsList } from './types';

const messages = defineMessages({
  line1: {
    id: 'wallet.voting.dialog.step.confirm.line1',
    defaultMessage: '!!!Please enter the PIN as you will need it <strong>every time</strong> you want to access the Catalyst Voting app.',
  },
});

type Props = {|
  +stepsList: StepsList,
  +progressInfo: ProgressInfo,
  +goBack: void => void,
  +submit: void => PossiblyAsync<void>,
  +error: void => PossiblyAsync<void>,
  +cancel: void => void,
  +classicTheme: boolean,
  +pinValidation: string => boolean,
  +isProcessing: boolean,
|};

@observer
export default class ConfirmPinDialog extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };
  @observable pinForm: void | ReactToolboxMobxForm;

  @action
  setPinForm(form: ReactToolboxMobxForm) {
    this.pinForm = form;
  }

  render(): Node {
    const { intl } = this.context;
    const {
      stepsList,
      progressInfo,
      goBack,
      cancel,
      classicTheme,
      pinValidation,
      isProcessing,
    } = this.props;

    const dailogActions = [{
      label: intl.formatMessage(globalMessages.stepConfirm),
      primary: true,
      onClick: this._submitForm,
      isSubmitting: isProcessing,
      disabled: isProcessing,
    }];

    return (
      <Dialog
        className={classnames([styles.dialog])}
        title={intl.formatMessage(globalMessages.votingRegistrationTitle)}
        actions={dailogActions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        backButton={<DialogBackButton onBack={goBack} />}
        onClose={cancel}
      >
        <ProgressStepBlock
          stepsList={stepsList}
          progressInfo={progressInfo}
          classicTheme={classicTheme}
        />
        <div className={classnames([styles.lineText, styles.firstItem])}>
          <FormattedHTMLMessage {...messages.line1} />
        </div>
        <div className={classnames([styles.pinInputContainer])}>
          <PinInput
            setForm={form => this.setPinForm(form)}
            disabled={false}
            classicTheme={classicTheme}
            pinMatches={pinValidation}
            fieldName="pin"
            validCheck={_pin => true}
            placeholder={this.context.intl.formatMessage(globalMessages.confirmPin)}
            allowEmptyInput={false}
          />
        </div>
      </Dialog>);
  }

  _submitForm: void => Promise<void> = async () => {
    if (this.pinForm !== undefined) {
      this.pinForm.submit({
        onSuccess: async () => {
          await this.props.submit();
        },
        onError: async () => {
          await this.props.error();
        },
      });
    }
  };
}
