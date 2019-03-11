// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import ProgressSteps from '../../../widgets/ProgressSteps';
import { ProgressInfo } from '../../../../types/HWConnectStoreTypes';

const messages = defineMessages({
  stepAboutLabel: {
    id: 'wallet.connect.hw.dialog.step.about.label',
    defaultMessage: '!!!ABOUT',
    description: 'Progress Step Label "About" on the Connect to any Hardware Wallet dialog.'
  },
  stepConnectLabel: {
    id: 'wallet.connect.hw.dialog.step.connect.label',
    defaultMessage: '!!!CONNECT',
    description: 'Progress Step Label "Connect" on the Connect to any Hardware Wallet dialog.'
  },
  stepSaveLabel: {
    id: 'wallet.connect.hw.dialog.step.save.label',
    defaultMessage: '!!!SAVE',
    description: 'Progress Step Label "Save" on the Connect to any Hardware Wallet dialog.'
  },
});

type Props = {
  progressInfo: ProgressInfo,
};

@observer
export default class ProgressStepBlock extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const { progressInfo } = this.props;

    return (
      <ProgressSteps
        stepsList={[
          intl.formatMessage(messages.stepAboutLabel),
          intl.formatMessage(messages.stepConnectLabel),
          intl.formatMessage(messages.stepSaveLabel)
        ]}
        progressInfo={progressInfo}
      />);
  }
}
