// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './IntroBanner.scss';
import SvgInline from 'react-svg-inline';
import { defineMessages, intlShape, } from 'react-intl';
import testnetLogo from '../../../assets/images/yoroi-logotestnet-gradient.inline.svg';

type Props = {||};

const messages = defineMessages({
  title: {
    id: 'profile.languageSelect.intro',
    defaultMessage: '!!!You are on the Yoroi Testnet',
  },
  detail1: {
    id: 'profile.languageSelect.detail1',
    defaultMessage: '!!!This is an indepdendent extension',
  },
  detail2: {
    id: 'profile.languageSelect.detail2',
    defaultMessage: '!!!changes here do not affect your funds on the mainnet',
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
        <SvgInline svg={testnetLogo} className={styles.banner} />
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
