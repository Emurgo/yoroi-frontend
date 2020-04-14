// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import ProgressSteps from '../../../widgets/ProgressSteps';
import { ProgressInfo } from '../../../../types/HWConnectStoreTypes';
import globalMessages from '../../../../i18n/global-messages';

const messages = defineMessages({
  stepSaveLabel: {
    id: 'wallet.connect.hw.dialog.step.save.label',
    defaultMessage: '!!!SAVE',
  },
});

type Props = {|
  +progressInfo: ProgressInfo,
  +classicTheme: boolean
|};

@observer
export default class ProgressStepBlock extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const { progressInfo, classicTheme } = this.props;

    return (
      <ProgressSteps
        stepsList={[
          intl.formatMessage(globalMessages.checkLabel),
          intl.formatMessage(globalMessages.hwConnectDialogConnectButtonLabel),
          intl.formatMessage(messages.stepSaveLabel)
        ]}
        currentStep={progressInfo.currentStep}
        stepState={progressInfo.stepState}
        classicTheme={classicTheme}
      />);
  }
}
