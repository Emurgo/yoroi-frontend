// @flow
import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { StepsList } from './types';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import { defineMessages, intlShape } from 'react-intl';
import { ProgressInfo } from '../../../stores/ada/VotingStore';
import classnames from 'classnames';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import globalMessages from '../../../i18n/global-messages';
import Dialog from '../../widgets/Dialog/Dialog';
import DialogCloseButton from '../../widgets/Dialog/DialogCloseButton';
import SpendingPasswordInput from '../../widgets/forms/SpendingPasswordInput';
import ProgressStepBlock from './ProgressStepBlock';
import styles from './RegisterDialog.scss';
import { Typography } from '@mui/material';
import Stepper from '../../common/stepper/Stepper';

const messages = defineMessages({
  line1: {
    id: 'wallet.voting.dialog.step.register.line1',
    defaultMessage:
      '!!!Enter your password to be able to generate the required certificate for voting.',
  },
});

type Props = {|
  +stepsList: StepsList,
  +progressInfo: ProgressInfo,
  +submit: string => PossiblyAsync<void>,
  +cancel: void => void,
  +classicTheme: boolean,
  +isProcessing: boolean,
  +isRevamp: boolean,
|};

@observer
export default class RegisterDialog extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };
  @observable spendingPasswordForm: void | ReactToolboxMobxForm;

  @action
  setSpendingPasswordForm(form: ReactToolboxMobxForm) {
    this.spendingPasswordForm = form;
  }
  render(): Node {
    const { intl } = this.context;
    const { stepsList, progressInfo, cancel, classicTheme, isProcessing } = this.props;

    const dailogActions = [
      {
        label: intl.formatMessage(globalMessages.nextButtonLabel),
        primary: true,
        onClick: this._submitForm,
        isSubmitting: isProcessing,
        disabled: isProcessing,
      },
    ];

    return (
      <Dialog
        className={classnames([styles.dialog])}
        title={intl.formatMessage(globalMessages.votingRegistrationTitle)}
        actions={dailogActions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={cancel}
      >
        {this.props.isRevamp ? (
          <>
            <Stepper
              currentStep={String(progressInfo.currentStep)}
              steps={stepsList.map(step => ({ message: step.message, stepId: String(step.step) }))}
              setCurrentStep={() => {}}
            />
            <Typography component="div"
              textAlign="center"
              pt="24px"
              pb="40px"
              variant="body1"
              color="ds.gray_c900"
            >
              {intl.formatMessage(messages.line1)}
            </Typography>
          </>
        ) : (
          <>
            <ProgressStepBlock
              stepsList={stepsList}
              progressInfo={progressInfo}
              classicTheme={classicTheme}
            />
            <div className={classnames([styles.lineText, styles.firstItem])}>
              {intl.formatMessage(messages.line1)}
            </div>
          </>
        )}
        <div className={styles.spendingPassword}>
          <SpendingPasswordInput
            setForm={form => this.setSpendingPasswordForm(form)}
            classicTheme={this.props.classicTheme}
            isSubmitting={isProcessing}
          />
        </div>
      </Dialog>
    );
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
