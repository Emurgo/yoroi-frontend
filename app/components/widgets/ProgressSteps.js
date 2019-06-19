import React, { Component, Element } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import SvgInline from 'react-svg-inline';

import iconTickSVG from '../../assets/images/widget/tick.inline.svg';
import iconTickGreenSVG from '../../assets/images/widget/tick-green.inline.svg';
import iconCrossSVG from '../../assets/images/widget/cross.inline.svg';
import iconCrossGreenSVG from '../../assets/images/widget/cross-green.inline.svg';
import styles from './ProgressSteps.scss';

type Props = {|
  stepsList: Array<string>,
  progressInfo: {
    currentStep : number, // example, 0 = pointing to stepsList[0]
    stepState: number, // has three states, 0 = LOAD | 1 = PROCESS | 9 = ERROR
  },
  classicTheme: boolean
|};
@observer
export default class ProgressSteps extends Component<Props> {

  createSetps = (stepsList, progressInfo): Array<Element> => {
    const { classicTheme } = this.props;
    const steps = [];

    // currentStep should not be less than 0
    const currentStep = progressInfo.currentStep < 0 ? 0 : progressInfo.currentStep;

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
        // for current step, 0 = LOAD | 1 = PROCESS | 9 = ERROR
        // 0 = LOAD and 1 = PROCESS has same icon but for 9 = ERROR there is a error icon
        displayIcon = (progressInfo.stepState === 9) ? 'error' : 'none';
        stepTopBarStyle = classNames([
          styles.stepTopBar,
          styles.stepTopBarActive
        ]);
        stepTextStyle = classNames([
          styles.stepText,
          styles.stepTextActive
        ]);
      }

      steps.push(
        <div key={idx} className={styles.stepBlock}>
          <div className={stepTopBarStyle} />
          <div className={styles.stepBottomBlock}>
            <div className={styles.stepStateIconContainer}>
              {(displayIcon === 'done') && <SvgInline svg={classicTheme ? iconTickSVG : iconTickGreenSVG} />}
              {(displayIcon === 'error') && <SvgInline svg={classicTheme ? iconCrossSVG : iconCrossGreenSVG} />}
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

  render() {
    const { stepsList, progressInfo } = this.props;
    return (
      <div className={styles.component}>
        {this.createSetps(stepsList, progressInfo)}
      </div>
    );
  }

}
