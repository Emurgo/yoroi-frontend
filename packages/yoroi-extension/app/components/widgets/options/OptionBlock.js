// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { IntlContext } from 'react-intl';
import classnames from 'classnames';

import globalMessages from '../../../i18n/global-messages';
import { ReactComponent as ArrowDownSVG } from '../../../assets/images/expand-arrow-grey.inline.svg';
import styles from './OptionBlock.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Box, styled, Typography } from '@mui/material';

const GradientBox = styled(Box)(({ theme }: any) => ({
  backgroundImage: theme.palette.ds.bg_gradient_1,
  marginBottom: '16px',
  borderRadius: '8px',
}));

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
  static contextType = IntlContext;
  static defaultProps: {| learnMoreText: void |} = {
    learnMoreText: undefined,
  };

  state: State = {
    showLearnMore: false,
  };

  toggleLearnMore() {
    this.setState(prevState => ({ showLearnMore: !prevState.showLearnMore }));
  }

  render(): Node {
    const { intl } = this.context;
    const { parentName, type, title, learnMoreText, onSubmit } = this.props;

    const learnMoreTextBlockClasses = classnames([styles.learnMoreTextBlock, this.state.showLearnMore && styles.showlearnMore]);

    const learnMoreButtonClasses = classnames([styles.learnMoreButton, this.state.showLearnMore && styles.arrowUp]);

    const getNetworkNameForId = () => {
      const nameArr = title.split(' ');
      return nameArr.length === 1 ? 'Mainnet' : nameArr[1]
    };

    return (
      <GradientBox className={styles.optionBlockWrapper}>
        <li className={styles.optionBlockListItem}>
          <div className={styles.optionBlockWrapper}>
            {/* Submit button block */}
            <button
              onClick={onSubmit}
              type="button"
              className={classnames([styles.optionSubmitButton, `${parentName}_${type}`])}
              id={'connectHWWallet-select' + getNetworkNameForId() +'Network-button'}
            >
              <div className={`${styles.optionImage} ${styles[type]}`} />
              <Typography className={styles.optionTitle} color="ds.text_gray_medium">
                {title}
              </Typography>
            </button>
            {/* Learn more block */}
            {learnMoreText != null && learnMoreText !== '' ? (
              <div>
                <div className={learnMoreTextBlockClasses}>
                  <div className={styles.learnMoreTextWrapper}>
                    <Typography color="ds.text_gray_low">{learnMoreText}</Typography>
                  </div>
                </div>
                <button className={learnMoreButtonClasses} type="button" onClick={this.toggleLearnMore.bind(this)}>
                  {intl.formatMessage(globalMessages.learnMore)}
                  <span className={styles.learnMoreButtonIcon}>
                    <ArrowDownSVG width="20px" height="20px" />
                  </span>
                </button>
              </div>
            ) : null}
          </div>
        </li>
      </GradientBox>
    );
  }
}
