// @flow
import { Component } from 'react';
import type { Element, Node } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';

import { ReactComponent as IconTickGreenSVG }  from '../../assets/images/widget/tick-green.inline.svg';
import { ReactComponent as IconCrossGreenSVG }  from '../../assets/images/widget/cross-green.inline.svg';
import styles from './ProgressSteps.scss';

// TODO: move to type folder?
export const StepState = Object.freeze({
  LOAD: 0,
  PROCESS: 1,
  ERROR: 9,
});
export type StepStateEnum = $Values<typeof StepState>;

type Props = {|
  +stepsList: Array<string>,
  +currentStep : number, // example, 0 = pointing to stepsList[0]
  +stepState: StepStateEnum,
|};
@observer
export default class ProgressSteps extends Component<Props> {

  createSteps: ((
    stepsList: Array<string>,
    currentStep: number,
    stepState: StepStateEnum
  ) => Array<Element<any>>) = (
    stepsList,
    currentStep,
    stepState,
  ) => {
    const steps = [];

    for (let idx = 0; idx < stepsList.length; idx++) {
      const stepText = stepsList[idx];

      let stepTopBarStyle = styles.stepTopBar;
      let stepTextStyle = styles.stepText;
      let displayIcon = 'none';

      if (idx < currentStep) {
        // step already done
        displayIcon = 'done';
        stepTopBarStyle = classNames([
          styles.stepTopBar,
          styles.stepTopBarDone
        ]);
        stepTextStyle = classNames([
          styles.stepText,
          styles.stepTextDone
        ]);
      } else if (idx === currentStep) {
        displayIcon = (stepState === StepState.ERROR) ? 'error' : 'none';
        stepTopBarStyle = classNames([
          styles.stepTopBar,
          styles.stepTopBarActive
        ]);
        stepTextStyle = classNames([
          styles.stepText,
          styles.stepTextActive
        ]);
      }

      const DoneIcon = IconTickGreenSVG;
      const ErrorIcon = IconCrossGreenSVG;
      steps.push(
        <div key={idx} className={styles.stepBlock}>
          <div className={stepTopBarStyle} />
          <div className={styles.stepBottomBlock}>
            <div className={styles.stepStateIconContainer}>
              {(displayIcon === 'done') && <DoneIcon />}
              {(displayIcon === 'error') && <ErrorIcon />}
            </div>
            <div className={styles.stepTextContainer}>
              <span className={stepTextStyle}>{stepText}</span>
            </div>
          </div>
        </div>
      );
    }

    return steps;
  }

  render(): Node {
    const { stepsList, currentStep, stepState } = this.props;

    return (
      <div className={styles.component}>
        {this.createSteps(
          stepsList,
          currentStep < 0 ? 0 : currentStep,
          stepState
        )}
      </div>
    );
  }

}
