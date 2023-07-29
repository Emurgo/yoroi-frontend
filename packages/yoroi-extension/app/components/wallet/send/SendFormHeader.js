// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import Stepper from '../../common/stepper/Stepper';
import { Box } from '@mui/material';

type Props = {|
  step: number,
  onUpdateStep: number => void,
|};

const messages = defineMessages({
  receiver: {
    id: 'wallet.send.form.receiver.label',
    defaultMessage: '!!!Receiver',
  },
  preview: {
    id: 'wallet.send.form.preview.label',
    defaultMessage: '!!!Preview',
  },
});

const TABS = [
  { message: messages.receiver, stepId: '1' },
  { message: globalMessages.amount, stepId: '2' },
  { message: messages.preview, stepId: '3' },
];

@observer
export default class SendFormHeader extends Component<Props> {
  render(): Node {
    const { step: currentStep, onUpdateStep } = this.props;

    return (
      <Box>
        <Stepper
          currentStep={String(currentStep)}
          steps={TABS}
          setCurrentStep={id => onUpdateStep(Number(id))}
          sx={{ mt: '0 !important' }}
        />
      </Box>
    );
  }
}
