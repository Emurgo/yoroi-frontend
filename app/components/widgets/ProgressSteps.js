import React, { Component } from 'react';
import styles from './ProgressSteps.scss';
import classNames from 'classnames';
import SvgInline from 'react-svg-inline';
import SVGDoneShape from '../../assets/images/widget/done-shape.inline.svg';

type Props = {
  stepsList: Array<string>,
  progressIndex: number
};

export default class ProgressSteps extends Component<Props> {

  createSetps = () => {
    const { stepsList, progressIndex } = this.props;
    // progressIndex can't be less than 0
    const actProgressIndex = progressIndex < 0 ? 0 : progressIndex;

    const stepBoxStyle = classNames([styles.stepBox]);
    
    const steps = [];
    for (let idx = 0; idx < stepsList.length; idx++) {
      const stepText = stepsList[idx];
      let stepTopBarStyle = classNames([styles.stepTopBar]);
      let stepDoneShapeStyle = classNames([styles.stepDoneShape]);
      let stepTextStyle = classNames([styles.stepText]);

      if(idx < actProgressIndex) {
        // step done
        stepTopBarStyle = classNames([
          styles.stepTopBar,
          styles.stepTopBarDone
        ]);
        stepDoneShapeStyle = classNames([
          styles.stepDoneShape,
          styles.stepDoneShapeDone
        ]);
        stepTextStyle = classNames([
          styles.stepText,
          styles.stepTextDone
        ]);
      } else if (idx === actProgressIndex) {
        // step current
        stepTopBarStyle = classNames([
          styles.stepTopBar,
          styles.stepTopBarActive
        ]);
        stepDoneShapeStyle = classNames([
          styles.stepDoneShape,
          styles.stepDoneShapeActive
        ]);        
        stepTextStyle = classNames([
          styles.stepText,
          styles.stepTextActive
        ]);
      }

      steps.push(
      <div key={idx} className={stepBoxStyle}>
        <div className={stepTopBarStyle}></div>
        <div className={styles.stepBottomBlock}>
          <SvgInline svg={SVGDoneShape} className={stepDoneShapeStyle} cleanup={['title']} />
          <span className={stepTextStyle}>{stepText}</span>
        </div>
      </div>);      
    }

    return steps;
  }


  render() {

    const outerStyle = classNames([styles.outer]);
    const comp = (<div className={outerStyle}>
      {this.createSetps()}
    </div>);

    return comp;
  }

}
