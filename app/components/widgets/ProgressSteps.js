import React, { Component } from 'react';
import classNames from 'classnames';
import SvgInline from 'react-svg-inline';
import iconTickSVG from '../../assets/images/widget/tick.inline.svg';
import iconCrossSVG from '../../assets/images/widget/cross.inline.svg';
import styles from './ProgressSteps.scss';

type Props = {
  stepsList: Array<string>,
  progressInfo: {
    currentIndex : number,
    error?: boolean
  }
};

export default class ProgressSteps extends Component<Props> {

  createSetps = () => {
    const { stepsList, progressInfo } = this.props;
    // progressIndex can't be less than 0
    const currentProgressIndex = progressInfo.currentIndex < 0 ? 0 : progressInfo.currentIndex;

    const steps = [];
    for (let idx = 0; idx < stepsList.length; idx++) {
      const stepText = stepsList[idx];

      let stepTopBarStyle = classNames([styles.stepTopBar]);
      let stepTextStyle = classNames([styles.stepText]);
      let showIcon = 'none';

      if (idx < currentProgressIndex) {
        // step already done
        showIcon = 'done';
        stepTopBarStyle = classNames([
          styles.stepTopBar,
          styles.stepTopBarDone
        ]);
        stepTextStyle = classNames([
          styles.stepText,
          styles.stepTextDone
        ]);
      } else if (idx === currentProgressIndex) {
        // step current
        showIcon = progressInfo.error ? 'error' : 'none';
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
              {(showIcon === 'done') && <SvgInline svg={iconTickSVG} cleanup={['title']} />}
              {(showIcon === 'error') && <SvgInline svg={iconCrossSVG} cleanup={['title']} />}
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
    const outerStyle = classNames([styles.outer]);
    const comp = (
      <div className={outerStyle}>
        {this.createSetps()}
      </div>
    );

    return comp;
  }

}
