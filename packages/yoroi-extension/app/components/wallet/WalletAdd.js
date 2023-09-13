// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import classnames from 'classnames';

import CustomTooltip from '../widgets/CustomTooltip';
import MainCards from './add/MainCards';
import { ReactComponent as LogoYoroiIcon }  from '../../assets/images/yoroi-logo-white.inline.svg';
import { ReactComponent as SettingsIcon }  from '../../assets/images/sidebar/wallet-settings-2-ic.inline.svg';
import { ReactComponent as DaedalusIcon }  from '../../assets/images/top-bar/daedalus-migration.inline.svg';
import { ReactComponent as NightlyLogo }  from '../../assets/images/yoroi-logo-nightly-white.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from './WalletAdd.scss';

import environment from '../../environment';

const messages = defineMessages({
  title: {
    id: 'wallet.add.page.title',
    defaultMessage: '!!!Your gateway to the financial world',
  },
  subTitle: {
    id: 'wallet.add.page.subtitle.label',
    defaultMessage: '!!!Yoroi light wallet for Cardano',
  },
});

type Props = {|
  +onCreate: void => void,
  +onRestore: void => void,
  +onHardwareConnect: void => void,
  +onSettings: void => void,
|};

@observer
export default class WalletAdd extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  getLogo: void => string = () => {
    if (environment.isNightly()) {
      return NightlyLogo;
    }
    return LogoYoroiIcon;
  }

  render(): Node {
    const { intl } = this.context;
    const {
      onSettings,
      onDaedalusTransfer,
    } = this.props;
    const LogoIcon = this.getLogo();

    return (
      <div className={styles.component}>
        {/* Setting button */}
        <div className={styles.hero}>
          <div className={styles.settingsBar}>
            <button type="button" onClick={onSettings} className={styles.settingsBarLink}>
              <SettingsIcon width="30" height="30" />
            </button>
          </div>

          <div className={styles.heroInner}>
            {/* Left block  */}
            <div className={styles.heroLeft}>
              <span className={styles.heroLogo}><LogoIcon width="156" height="50" /></span>
              <h2 className={styles.heroTitle}>
                <FormattedHTMLMessage {...(messages.title)} />
              </h2>
              <h3 className={styles.heroSubTitle}>{intl.formatMessage(messages.subTitle)}</h3>
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
