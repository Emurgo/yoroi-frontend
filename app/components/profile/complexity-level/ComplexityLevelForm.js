// @flow
import React, { Component } from 'react';
import { intlShape, defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from './ComplexityLevelForm.scss';
import classnames  from 'classnames';
import BeginnerLevel from '../../../assets/images/complexity-level/beginner-level.inline.svg';
import AdvancedLevel from '../../../assets/images/complexity-level/advanced-level.inline.svg';
import LocalizableError from '../../../i18n/LocalizableError';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { ComplexityLevels } from '../../../types/complexityLevelType';
import type { ComplexityLevelType } from '../../../types/complexityLevelType';

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
  labelSelectedLevel: {
    id: 'profile.complexityLevel.selected.label',
    defaultMessage: '!!!Your currently level of Complexity is'
  },
  labelChoose: {
    id: 'global.label.choose',
    defaultMessage: '!!!Choose'
  },
});
type Props = {|
  +complexityLevel: ?ComplexityLevelType,
  +onSubmit: ComplexityLevelType => PossiblyAsync<void>,
  +isSubmitting: boolean,
  +error?: ?LocalizableError
|}

class ComplexityLevel extends Component<Props> {
  static defaultProps: {|error: void|} = {
    error: undefined
  };

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const { complexityLevel, isSubmitting } = this.props;

    const levels = [
      {
        key: ComplexityLevels.Simple,
        name: intl.formatMessage(messages.titleSimpleLevel),
        image: <BeginnerLevel />,
        description: intl.formatMessage(messages.descriptionSimpleLevel),
      },
      {
        key: ComplexityLevels.Advanced,
        name: intl.formatMessage(messages.titleAdvancedLevel),
        image: <AdvancedLevel />,
        description: intl.formatMessage(messages.descriptionAdvancedLevel),
      }
    ];

    const buttonClasses = classnames([
      'secondary',
      isSubmitting ?
        styles.submitButtonSpinning :
        styles.submitButton
    ]);

    return (
      <>
        <div className={styles.component}>
          <div className={styles.description}>
            {intl.formatMessage(messages.subtitle)}
          </div>
          <div className={styles.selected}>
            {
              complexityLevel &&
                <>
                  {intl.formatMessage(messages.labelSelectedLevel)} : <span className="currentLevel">{complexityLevel}</span>
                </>
            }
          </div>
          <div className={styles.cardsWrapper}>
            {
            levels.map(level => (
              <div className={styles.card} key={level.key}>
                <div className={classnames([styles.cardImage, styles[level.key]])}>
                  {level.image}
                </div>
                <div className={styles.cardContent}>
                  <div>
                    <h3>{level.name}</h3>
                    <p>{level.description}</p>
                  </div>
                  <Button
                    label={intl.formatMessage(messages.labelChoose)}
                    className={buttonClasses}
                    disabled={isSubmitting || (complexityLevel === level.key)}
                    onClick={() => this.props.onSubmit(level.key)}
                    skin={ButtonSkin}
                  />
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
