// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat, MessageDescriptor } from 'react-intl';

import ProgressSteps from '../../widgets/ProgressSteps';
import { ProgressInfo } from '../../../stores/ada/VotingStore';

type Props = {|
  +stepsList: Array<MessageDescriptor>,
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
    const { stepsList, progressInfo, classicTheme } = this.props;

    return (
      <ProgressSteps
        stepsList={stepsList.map(intl.formatMessage)}
        currentStep={progressInfo.currentStep}
        stepState={progressInfo.stepState}
        classicTheme={classicTheme}
      />);
  }
}
