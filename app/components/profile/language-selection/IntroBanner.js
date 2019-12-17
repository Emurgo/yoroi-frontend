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
      </div>
    );
  }
}
