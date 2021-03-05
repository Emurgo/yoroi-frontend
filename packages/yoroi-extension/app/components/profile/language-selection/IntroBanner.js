// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './IntroBanner.scss';
import { intlShape, } from 'react-intl';
import NightlyLogo from '../../../assets/images/yoroi-logo-nightly.inline.svg';
import YoroiLogo from '../../../assets/images/yoroi-logo-blue.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {|
  +isNightly: boolean,
|};

@observer
export default class IntroBanner extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  _getLogo: void => string = () => {
    if (this.props.isNightly) {
      return NightlyLogo;
    }
    return YoroiLogo;
  }

  render(): Node {
    const Logo = this._getLogo();
    const title = '';
    return (
      <div className={styles.component}>
        <span className={styles.banner}>
          <Logo />
        </span>
        <div className={styles.mainTitle}>
          {title}
        </div>
      </div>
    );
  }
}
