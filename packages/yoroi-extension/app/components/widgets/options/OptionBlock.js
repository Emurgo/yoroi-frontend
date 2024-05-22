// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import classnames from 'classnames';

import globalMessages from '../../../i18n/global-messages';
import { ReactComponent as ArrowDownSVG }  from '../../../assets/images/expand-arrow-grey.inline.svg';
import styles from './OptionBlock.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {|
  +parentName: string,
  +type: string,
  +title: string,
  +onSubmit: void => void,
  // If learnMoreText is not provided, learn more block will disabled
  +learnMoreText?: Node | string,
|};

type State = {|
  showLearnMore: boolean,
|};

@observer
export default class OptionBlock extends Component<Props, State> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  static defaultProps: {|learnMoreText: void|} = {
    learnMoreText: undefined
  }

  state: State = {
    showLearnMore: false,
  };

  toggleLearnMore() {
    this.setState(prevState => ({ showLearnMore: !prevState.showLearnMore }));
  }

  render(): Node {
    const { intl } = this.context;
    const { parentName, type, title, learnMoreText, onSubmit } = this.props;

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
          <button
            onClick={onSubmit}
            type="button"
            className={classnames([
              styles.optionSubmitButton,
              `${parentName}_${type}`
            ])}
          >
            <div className={`${styles.optionImage} ${styles[type]}`} />
            <div className={styles.optionTitle}>
              {title}
            </div>
          </button>
          {/* Learn more block */}
          {(learnMoreText != null && learnMoreText !== '')
            ? (
              <div>
                <div className={learnMoreTextBlockClasses}>
                  <div className={styles.learnMoreTextWrapper}>
                    <div className={styles.learnMoreText}>{learnMoreText}</div>
                  </div>
                </div>
                <button
                  className={learnMoreButtonClasses}
                  type="button"
                  onClick={this.toggleLearnMore.bind(this)}
                >
                  {intl.formatMessage(globalMessages.learnMore)}
                  <span className={styles.learnMoreButtonIcon}>
                    <ArrowDownSVG width="20px" height="20px" />
                  </span>
                </button>
              </div>)
            : null
          }
        </div>
      </li>
    );
  }
}
