// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import ProgressSteps from '../../widgets/ProgressSteps';
import globalMessages from '../../../i18n/global-messages';
import { ProgressInfo } from '../../../stores/ada/VotingStore';

type Props = {|
  +progressInfo: ProgressInfo,
  +classicTheme: boolean
|};

@observer
export default class ProgressStepBlock extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  render(): Node {
    const { intl } = this.context;
    const { progressInfo, classicTheme } = this.props;

    return (
      <ProgressSteps
        stepsList={[
          intl.formatMessage(globalMessages.stepPin),
          intl.formatMessage(globalMessages.stepConfirm),
          intl.formatMessage(globalMessages.registerLabel),
          intl.formatMessage(globalMessages.transactionLabel),
          intl.formatMessage(globalMessages.stepQrCode)
        ]}
        currentStep={progressInfo.currentStep}
        stepState={progressInfo.stepState}
        classicTheme={classicTheme}
      />);
  }
}
