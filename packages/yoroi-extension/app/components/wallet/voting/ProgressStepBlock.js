// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import ProgressSteps from '../../widgets/ProgressSteps';
import { ProgressInfo } from '../../../stores/ada/VotingStore';
import type { StepsList } from './types';

type Props = {|
  +stepsList: StepsList,
  +progressInfo: ProgressInfo,
|};

@observer
export default class ProgressStepBlock extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  render(): Node {
    const { intl } = this.context;
    const { stepsList, progressInfo } = this.props;

    const currentStep = stepsList.findIndex(({ step }) => step === progressInfo.currentStep);

    return (
      <ProgressSteps
        stepsList={stepsList.map(({ message }) => intl.formatMessage(message))}
        currentStep={currentStep}
        stepState={progressInfo.stepState}
      />);
  }
}
