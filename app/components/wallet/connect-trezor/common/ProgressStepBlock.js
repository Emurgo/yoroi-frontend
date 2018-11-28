// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import globalMessages from '../../../../i18n/global-messages';
import ProgressSteps from '../../../widgets/ProgressSteps';
import type { ProgressInfo } from '../../../../stores/ada/AdaConnetTrezorStore'

const messages = defineMessages({
  stepAboutLabel: {
    id: 'wallet.trezor.dialog.trezor.step.about.label',
    defaultMessage: '!!!ABOUT',
    description: 'Progress Step Label "About" on the Connect to Trezor Hardware Wallet dialog.'
  },
  stepConnectLabel: {
    id: 'wallet.trezor.dialog.trezor.step.connect.label',
    defaultMessage: '!!!CONNECT',
    description: 'Progress Step Label "Connect" on the Connect to Trezor Hardware Wallet dialog.'
  },
  stepSaveLabel: {
    id: 'wallet.trezor.dialog.trezor.step.save.label',
    defaultMessage: '!!!SAVE',
    description: 'Progress Step Label "Save" on the Connect to Trezor Hardware Wallet dialog.'
  },
});

messages.fieldIsRequired = globalMessages.fieldIsRequired;

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

    return (
      <ProgressSteps
        stepsList={[
          intl.formatMessage(messages.stepAboutLabel),
          intl.formatMessage(messages.stepConnectLabel),
          intl.formatMessage(messages.stepSaveLabel)
        ]}
        progressInfo={this.props.progressInfo}
      />);
  }
}
