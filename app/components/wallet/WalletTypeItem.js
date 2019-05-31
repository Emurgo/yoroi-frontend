// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import classnames from 'classnames';
import styles from './WalletTypeItem.scss';
import SvgInline from 'react-svg-inline';
import arrowDown from '../../assets/images/expand-arrow-grey.inline.svg';

const messages = defineMessages({
  more: {
    id: 'settings.general.learn.more',
    defaultMessage: '!!!Learn more',
  },
});

type Props = {
  type: string,
  title: string,
  description?: string,
  action: Function,
};

type State = {
  showMore: boolean,
};

@observer
export default class WalletTypeItem extends Component<Props, State> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  static defaultProps = {
    description: undefined
  }

  state = {
    showMore: false,
  };

  toggleDesc() {
    this.setState(prevState => ({ showMore: !prevState.showMore }));
  }

  render() {
    const { intl } = this.context;
    const { action, type, title, description } = this.props;

    const showMoreClasses = classnames([
      styles.walletTypeMore,
      this.state.showMore && styles.showMore,
    ]);

    const showMoreBtnClasses = classnames([
      styles.moreBtn,
      this.state.showMore && styles.arrowUp,
    ]);

    return (
      <li className={styles.walletTypeListItem}>
        <div className={styles.walletType}>
          <button onClick={action} type="button" className={styles.walletTypeTop}>
            <div className={`${styles.walletTypeImg} ${styles[type]}`} />
            <div className={styles.walletTypeTitle}>
              {title}
            </div>
          </button>
          {description &&
            <div>
              <div className={showMoreClasses}>
                <div className={styles.walletTypeMoreInner}>
                  <p className={styles.walletTypeDesc}>{description}</p>
                </div>
              </div>
              <button className={showMoreBtnClasses} type="button" onClick={this.toggleDesc.bind(this)}>
                {intl.formatMessage(messages.more)}
                <SvgInline svg={arrowDown} width="20px" height="20px" className={styles.moreBtnIcon} />
              </button>
            </div>
          }
        </div>
      </li>
    );
  }

}
