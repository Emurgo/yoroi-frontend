// @flow
import React, { Component } from 'react';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import classes from './ComplexityLevelForm.scss';
import classnames  from 'classnames';
import BeginnerLevel from '../../../assets/images/complexity-level/beginner-level.inline.svg';
import AdvancedLevel from '../../../assets/images/complexity-level/advanced-level.inline.svg';

type Props = {|

|}
type State = {|

|}

const levels = [
  {
    name: 'simple',
    image: <BeginnerLevel />,
    description: 'Simplest experience possible. No previous knowledge in Blockchain required. Highly friendly to on-board beginners, and for users that prefer simplicity',
  },
  {
    name: 'advanced',
    image: <AdvancedLevel />,
    description: 'I have a some understanding of blockchain and how cryptography is used to power both the blockchain itself and wallet software. I am okay with seeing options and functionality that critically depend on my understanding of these concepts.',
  }
];

class ComplexityLevel extends Component<Props, State> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render() {
    return (
      <>
        <div className={classes.component}>
          <div className={classes.header}>
            <h1>Level of Interface Complexity</h1>
          </div>
          <div className={classes.description}>
            Understanding blockchain can be difficult, which is why 
            we will try and keep the interface as simple as possible for you
          </div>
          <div className={classes.cardsWrapper}>
            {
            levels.map(level => (
              <div className={classes.card} key={level.name}>
                <div className={classnames([classes.cardImage, classes[level.name]])}>
                  {level.image}
                </div>
                <div className={classes.cardContent}>
                  <div>
                    <h3>{level.name}</h3>
                    <p>{level.description}</p>
                  </div>
                  <button type="button" className={classes.cardButton}>
                    CHOOSE
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
