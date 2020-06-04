// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './IntroBanner.scss';
import { defineMessages, intlShape, } from 'react-intl';
import TestnetLogo from '../../../assets/images/yoroi-logotestnet-gradient.inline.svg';
import NightlyLogo from '../../../assets/images/yoroi-logo-nightly.inline.svg';
import YoroiLogo from '../../../assets/images/yoroi-logo-blue.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {|
  +isNightly: boolean,
  +isShelley: boolean,
|};

const messages = defineMessages({
  title: {
    id: 'profile.languageSelect.intro',
    defaultMessage: '!!!You are on the Yoroi Shelley Testnet',
  },
});

@observer
export default class IntroBanner extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  _getLogo: void => string = () => {
    if (this.props.isNightly) {
      return NightlyLogo;
    }
    if (this.props.isShelley) {
      return TestnetLogo;
    }
    return YoroiLogo;
  }

  render(): Node {
    const { intl } = this.context;
    const Logo = this._getLogo();
    return (
      <div className={styles.component}>
        <span className={styles.banner}>
          <Logo />
        </span>
        <div className={styles.mainTitle}>
          {intl.formatMessage(messages.title)}
        </div>
      </div>
    );
  }
}
