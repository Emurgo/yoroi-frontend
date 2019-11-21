// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './IntroBanner.scss';
import { defineMessages, intlShape, } from 'react-intl';
import TestnetLogo from '../../../assets/images/yoroi-logotestnet-gradient.inline.svg';

type Props = {||};

const messages = defineMessages({
  title: {
    id: 'profile.languageSelect.intro',
    defaultMessage: '!!!You are on the Yoroi Shelley Testnet',
  },
  detail1: {
    id: 'profile.languageSelect.detail1',
    defaultMessage: '!!!Currently, this version allows you to verify that',
  },
  detail2: {
    id: 'profile.languageSelect.detail2',
    defaultMessage: '!!!your balance was correctly taken into consideration during the first snapshot.',
  },
});

@observer
export default class IntroBanner extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    return (
      <div className={styles.component}>
        <span className={styles.banner}><TestnetLogo /></span>
        <div className={styles.mainTitle}>
          {intl.formatMessage(messages.title)}
        </div>
        <div className={styles.detail}>
          {intl.formatMessage(messages.detail1)}<br />
          {intl.formatMessage(messages.detail2)}
        </div>
      </div>
    );
  }
}
