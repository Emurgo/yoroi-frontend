// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';

import MainCards from './MainCards';
import LogoYoroiIcon from '../../../assets/images/yoroi-logo-white.inline.svg';
import LogoYoroiShelleyTestnetIcon from '../../../assets/images/yoroi-logotestnet-gradient.inline.svg';
import NightlyLogo from '../../../assets/images/yoroi-logo-nightly.inline.svg';

import styles from './AddAnotherWallet.scss';

import environment from '../../../environment';

type Props = {|
  +onCreate: void => void,
  +onRestore: void => void,
  +onHardwareConnect: void => void,
|};

@observer
export default class AddAnotherWallet extends Component<Props> {

  getLogo: void => string = () => {
    if (environment.isNightly()) {
      return NightlyLogo;
    }
    if (environment.isShelley()) {
      return LogoYoroiShelleyTestnetIcon;
    }
    return LogoYoroiIcon;
  }

  render(): Node {
    const LogoIcon = this.getLogo();

    const iconClass = classnames(
      styles.heroLogo,
      LogoIcon === LogoYoroiIcon ? styles.makeBlue : null,
    );
    return (
      <div className={styles.component}>
        <div className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={iconClass}>
              <LogoIcon width="400" height="128" />
            </div>
            <div className={styles.heroRight}>
              <MainCards
                onCreate={this.props.onCreate}
                onRestore={this.props.onRestore}
                onHardwareConnect={this.props.onHardwareConnect}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
