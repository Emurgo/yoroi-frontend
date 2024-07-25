// @flow
import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { StepsList } from './types';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import { ProgressInfo } from '../../../stores/ada/VotingStore';
import { Box, Typography } from '@mui/material';
import globalMessages from '../../../i18n/global-messages';
import Dialog from '../../widgets/Dialog';
import Stepper from '../../common/stepper/Stepper';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import DialogBackButton from '../../widgets/DialogBackButton';
import classnames from 'classnames';
import ProgressStepBlock from './ProgressStepBlock';
import styles from './GeneratePinDialog.scss';

const messages = defineMessages({
  line1: {
    id: 'wallet.voting.dialog.step.pin.line1',
    defaultMessage:
      '!!!Please write down this PIN as you will need it <strong>every time</strong> you want to access the Catalyst Voting app.',
  },
  actionButton: {
    id: 'wallet.voting.dialog.step.pin.actionButton',
    defaultMessage: '!!!Confirm that I wrote down the PIN',
  },
});

type Props = {|
  +stepsList: StepsList,
  +progressInfo: ProgressInfo,
  +next: void => void,
  +cancel: void => void,
  +onBack: void => void,
  +classicTheme: boolean,
  +pin: Array<number>,
  +isRevamp: boolean,
|};

@observer
export default class GeneratePinDialog extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { stepsList, progressInfo, next, cancel, classicTheme, pin, isRevamp } = this.props;

    const dialogActions = [
      {
        label: intl.formatMessage(messages.actionButton),
        primary: true,
        onClick: next,
      },
    ];

    const pinCards = (
      <div className={classnames([styles.pinContainer, styles.lastItem])}>
        {pin.map((value, index) => {
          // eslint-disable-next-line react/no-array-index-key
          return isRevamp ? (
            <Box
              key={index}
              sx={{
                width: '56px',
                height: '56px',
                border: '1px solid',
                borderColor: 'grayscale.400',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography component="div" variant="body1" color="grayscale.600">
                {value}
              </Typography>
            </Box>
          ) : (
            <div key={index} className={styles.pin}>
              <span>{value}</span>
            </div>
          );
        })}
      </div>
    );

    return (
      <Dialog
        className={classnames([styles.dialog])}
        title={intl.formatMessage(globalMessages.votingRegistrationTitle)}
        actions={dialogActions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        backButton={<DialogBackButton onBack={this.props.onBack} />}
        onClose={cancel}
      >
        {this.props.isRevamp ? (
          <>
            <Stepper
              currentStep={String(progressInfo.currentStep)}
              steps={stepsList.map(step => ({ message: step.message, stepId: String(step.step) }))}
              setCurrentStep={() => {}}
            />
            <Typography component="div" textAlign="center" pt="24px" pb="40px" variant="body1" color="ds.text_gray_normal">
              <FormattedHTMLMessage {...messages.line1} />
            </Typography>
          </>
        ) : (
          <>
            <ProgressStepBlock stepsList={stepsList} progressInfo={progressInfo} classicTheme={classicTheme} />

            <div className={classnames([styles.lineText, styles.firstItem, styles.importantText])}>
              <FormattedHTMLMessage {...messages.line1} />
            </div>
          </>
        )}
        {pinCards}
      </Dialog>
    );
  }
}
