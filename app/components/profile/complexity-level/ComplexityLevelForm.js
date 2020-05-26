// @flow
import React, { Component } from 'react';
import { intlShape, defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import classes from './ComplexityLevelForm.scss';
import classnames  from 'classnames';
import BeginnerLevel from '../../../assets/images/complexity-level/beginner-level.inline.svg';
import AdvancedLevel from '../../../assets/images/complexity-level/advanced-level.inline.svg';

const messages = defineMessages({
  subtitle: {
    id: 'profile.complexityLevel.subtitle',
    defaultMessage: '!!!Understanding blockchain can be difficult, which is why we will try and keep the interface as simple as possible for you'
  },
  titleSimpleLevel: {
    id: 'profile.complexityLevel.simple',
    defaultMessage: '!!!Simple'
  },
  titleAdvancedLevel: {
    id: 'profile.complexityLevel.advanced',
    defaultMessage: '!!!Advanced'
  },
  descriptionSimpleLevel: {
    id: 'profile.complexityLevel.simple.description',
    defaultMessage: '!!!Simplest experience possible. No previous knowledge in Blockchain required. Highly friendly to on-board beginners, and for users that prefer simplicity.'
  },
  descriptionAdvancedLevel: {
    id: 'profile.complexityLevel.advanced.description',
    defaultMessage: '!!!I have a some understanding of blockchain and how cryptography is used to power both the blockchain itself and wallet software. I am okay with seeing options and functionality that critically depend on my understanding of these concepts.'
  },
  labelChoose: {
    id: 'global.label.choose',
    defaultMessage: '!!!Choose'
  },
});
type Props = {|

|}
type State = {|

|}



class ComplexityLevel extends Component<Props, State> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const levels = [
      {
        key: 'simple',
        name: intl.formatMessage(messages.titleSimpleLevel),
        image: <BeginnerLevel />,
        description: intl.formatMessage(messages.descriptionSimpleLevel),
      },
      {
        key: 'advanced',
        name: intl.formatMessage(messages.titleAdvancedLevel),
        image: <AdvancedLevel />,
        description: intl.formatMessage(messages.descriptionAdvancedLevel),
      }
    ];

    return (
      <>
        <div className={classes.component}>
          <div className={classes.description}>
            {intl.formatMessage(messages.subtitle)}
          </div>
          <div className={classes.cardsWrapper}>
            {
            levels.map(level => (
              <div className={classes.card} key={level.key}>
                <div className={classnames([classes.cardImage, classes[level.key]])}>
                  {level.image}
                </div>
                <div className={classes.cardContent}>
                  <div>
                    <h3>{level.name}</h3>
                    <p>{level.description}</p>
                  </div>
                  <button type="button" className={classes.cardButton}>
                    {intl.formatMessage(messages.labelChoose)}
                  </button>
                </div>
              </div>
            ))
          }
          </div>
        </div>
      </>
    );
  }
}

export default ComplexityLevel;
