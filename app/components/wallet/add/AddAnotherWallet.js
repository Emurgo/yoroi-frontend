// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';

import MainCards from './MainCards';
import LogoYoroiIcon from '../../../assets/images/yoroi-logo-white.inline.svg';
import LogoYoroiShelleyTestnetIcon from '../../../assets/images/yoroi-logo-shelley-testnet-white.inline.svg';

import styles from './AddAnotherWallet.scss';

import environment from '../../../environment';

type Props = {|
  +onCreate: void => void,
  +onRestore: void => void,
  +onHardwareConnect: void => void,
|};

@observer
export default class AddAnotherWallet extends Component<Props> {
  render() {
    const LogoIcon = environment.isShelley() ? LogoYoroiShelleyTestnetIcon : LogoYoroiIcon;

    return (
      <div className={styles.component}>
        <div className={styles.hero}>
          <div className={styles.heroInner}>
            {/* Left block  */}
            <div className={styles.heroLogo}>
              <LogoIcon width="400" height="128" />
            </div>
            {/* Right block  */}
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
