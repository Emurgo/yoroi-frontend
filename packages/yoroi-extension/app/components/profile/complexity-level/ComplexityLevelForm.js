// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { intlShape, defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from './ComplexityLevelForm.scss';
import classnames from 'classnames';
import { ReactComponent as BeginnerLevel } from '../../../assets/images/complexity-level/beginner-level.inline.svg';
import { ReactComponent as AdvancedLevel } from '../../../assets/images/complexity-level/advanced-level.inline.svg';
import LocalizableError from '../../../i18n/LocalizableError';
import { LoadingButton } from '@mui/lab';
import { ComplexityLevels } from '../../../types/complexityLevelType';
import type { ComplexityLevelType } from '../../../types/complexityLevelType';
import { withLayout } from '../../../styles/context/layout';
import { Box } from '@mui/material';

const messages = defineMessages({
  subtitle: {
    id: 'profile.complexityLevel.subtitle',
    defaultMessage:
      '!!!We understand blockchain can be difficult, which is why we try and keep the interface as simple as possible for you',
  },
  titleSimpleLevel: {
    id: 'profile.complexityLevel.simple',
    defaultMessage: '!!!Simple',
  },
  titleAdvancedLevel: {
    id: 'profile.complexityLevel.advanced',
    defaultMessage: '!!!Advanced',
  },
  descriptionSimpleLevel: {
    id: 'profile.complexityLevel.simple.description',
    defaultMessage:
      '!!!Simplest experience possible. No previous knowledge of blockchain required. Highly friendly to on-board beginners, and for users who prefer simplicity.',
  },
  descriptionAdvancedLevel: {
    id: 'profile.complexityLevel.advanced.description',
    defaultMessage:
      '!!!I have some understanding of blockchain and how cryptography is used to power both the blockchain itself and the wallet software. I am okay with seeing options and functionality that critically depend on my understanding of these concepts.',
  },
  labelSelectedLevel: {
    id: 'profile.complexityLevel.selected.label',
    defaultMessage: '!!!Your current level of Complexity is',
  },
  labelChoose: {
    id: 'global.label.choose',
    defaultMessage: '!!!Choose',
  },
});
type Props = {|
  +complexityLevel: ?ComplexityLevelType,
  +onSubmit: ComplexityLevelType => PossiblyAsync<void>,
  +isSubmitting: boolean,
  +error?: ?LocalizableError,
|};

type InjectedProps = {| +isRevampLayout: boolean |};

class ComplexityLevel extends Component<Props & InjectedProps> {
  static defaultProps: {| error: void |} = {
    error: undefined,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { complexityLevel, isSubmitting, isRevampLayout } = this.props;

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
      },
    ];

    return (
      <div className={styles.component}>
        <div className={styles.description}>{intl.formatMessage(messages.subtitle)}</div>
        <div className={styles.selected}>
          {complexityLevel && (
          <>
            {intl.formatMessage(messages.labelSelectedLevel)} :{' '}
            <Box component="span" className="currentLevel">
              {complexityLevel}
            </Box>
          </>
            )}
        </div>
        <div className={styles.cardsWrapper}>
          {levels.map(level => (
            <div className={styles.card} key={level.key}>
              <div className={classnames([styles.cardImage, styles[level.key]])}>
                {level.image}
              </div>
              <div className={styles.cardContent}>
                <div>
                  <h3>{level.name}</h3>
                  <p>{level.description}</p>
                </div>
                <LoadingButton
                    variant={isRevampLayout ? 'contained' : 'primary'}
                    loading={isSubmitting}
                    disabled={complexityLevel === level.key}
                    onClick={() => this.props.onSubmit(level.key)}
                >
                  {intl.formatMessage(messages.labelChoose)}
                </LoadingButton>
              </div>
            </div>
            ))}
        </div>
      </div>
    );
  }
}

export default (withLayout(ComplexityLevel): ComponentType<Props>);
