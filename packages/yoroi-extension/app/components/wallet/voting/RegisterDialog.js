// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat, MessageDescriptor } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import globalMessages from '../../../i18n/global-messages';
import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import SpendingPasswordInput from '../../widgets/forms/SpendingPasswordInput';
import ProgressStepBlock from './ProgressStepBlock';

import { ProgressInfo } from '../../../stores/ada/VotingStore';

import styles from './RegisterDialog.scss';

const messages = defineMessages({
  line1: {
    id: 'wallet.voting.dialog.step.register.line1',
    defaultMessage: '!!!Enter your spending password to be able to generate the required certificate for voting.',
  },
});

type Props = {|
  +stepsList: Array<MessageDescriptor>,
  +progressInfo: ProgressInfo,
  +submit: string => PossiblyAsync<void>,
  +cancel: void => void,
  +classicTheme: boolean,
  +isProcessing: boolean,
|};

@observer
export default class RegisterDialog extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };
  @observable spendingPasswordForm: void | ReactToolboxMobxForm;

  @action
  setSpendingPasswordForm(form: ReactToolboxMobxForm) {
    this.spendingPasswordForm = form;
  }
  render(): Node {
    const { intl } = this.context;
    const {
      stepsList,
      progressInfo,
      cancel,
      classicTheme,
      isProcessing,
    } = this.props;

    const dailogActions = [{
      label: intl.formatMessage(globalMessages.nextButtonLabel),
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
        onClose={cancel}
      >
        <ProgressStepBlock
          stepsList={stepsList}
          progressInfo={progressInfo}
          classicTheme={classicTheme}
        />
        <div className={classnames([styles.lineText, styles.firstItem])}>
          {intl.formatMessage(messages.line1)}
        </div>
        <div className={styles.spendingPassword}>
          <SpendingPasswordInput
            setForm={(form) => this.setSpendingPasswordForm(form)}
            classicTheme={this.props.classicTheme}
            isSubmitting={isProcessing}
          />
        </div>
      </Dialog>);
  }

  _submitForm: void => Promise<void> = async () => {
    if (this.spendingPasswordForm !== undefined) {
      this.spendingPasswordForm.submit({
        onSuccess: async form => {
          const { walletPassword } = form.values();
          await this.props.submit(walletPassword);
        },
        onError: () => {},
      });
    }
  };
}
