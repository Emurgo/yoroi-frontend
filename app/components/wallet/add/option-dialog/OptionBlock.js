// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import classnames from 'classnames';
import styles from './OptionBlock.scss';
import SvgInline from 'react-svg-inline';
import arrowDownSVG from '../../../../assets/images/expand-arrow-grey.inline.svg';

const messages = defineMessages({
  more: {
    id: 'settings.general.learn.more',
    defaultMessage: '!!!Learn more',
  },
});

type Props = {
  type: string,
  title: string,
  onSubmit: Function,
  learnMoreText?: string, // If learnMoreText is not provided, learn more block will disabled
};

type State = {
  showLearnMore: boolean,
};

@observer
export default class OptionBlock extends Component<Props, State> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  static defaultProps = {
    learnMoreText: undefined
  }

  state = {
    showLearnMore: false,
  };

  toggleLearnMore() {
    this.setState(prevState => ({ showLearnMore: !prevState.showLearnMore }));
  }

  render() {
    const { intl } = this.context;
    const { onSubmit, type, title, learnMoreText } = this.props;

    const learnMoreTextBlockClasses = classnames([
      styles.learnMoreTextBlock,
      this.state.showLearnMore && styles.showlearnMore,
    ]);

    const learnMoreButtonClasses = classnames([
      styles.learnMoreButton,
      this.state.showLearnMore && styles.arrowUp,
    ]);

    return (
      <li className={styles.optionBlockListItem}>
        <div className={styles.optionBlockWrapper}>
          {/* Submit button block */}
          <button onClick={onSubmit} type="button" className={styles.optionSubmitButton}>
            <div className={`${styles.optionImage} ${styles[type]}`} />
            <div className={styles.optionTitle}>
              {title}
            </div>
          </button>
          {/* Learn more block */}
          {learnMoreText &&
            <div>
              <div className={learnMoreTextBlockClasses}>
                <div className={styles.leramMoreTextWrapper}>
                  <p className={styles.learnMoreText}>{learnMoreText}</p>
                </div>
              </div>
              <button
                className={learnMoreButtonClasses}
                type="button"
                onClick={this.toggleLearnMore.bind(this)}
              >
                {intl.formatMessage(messages.more)}
                <SvgInline
                  svg={arrowDownSVG}
                  width="20px"
                  height="20px"
                  className={styles.learnMoreButtonIcon}
                />
              </button>
            </div>
          }
        </div>
      </li>
    );
  }
}
