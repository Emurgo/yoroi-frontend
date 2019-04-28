// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import SettingsMenuItem from './SettingsMenuItem';
import styles from './SettingsMenu.scss';
import { ROUTES } from '../../../routes-config';
import environment from '../../../environment';

const messages = defineMessages({
  general: {
    id: 'settings.menu.general.link.label',
    defaultMessage: '!!!General',
  },
  paperWallet: {
    id: 'settings.menu.paperWallet.link.label',
    defaultMessage: '!!!Paper Wallet',
  },
  wallet: {
    id: 'settings.menu.wallet.link.label',
    defaultMessage: '!!!Wallet',
  },
  support: {
    id: 'settings.menu.support.link.label',
    defaultMessage: '!!!Support',
  },
  termsOfUse: {
    id: 'settings.menu.termsOfUse.link.label',
    defaultMessage: '!!!Terms of use',
  },
  display: {
    id: 'settings.menu.display.link.label',
    defaultMessage: '!!!Themes',
  },
  AboutYoroi: {
    id: 'settings.menu.aboutYroi.link.label',
    defaultMessage: '!!!About Yoroi',
  },
  adaRedemption: {
    id: 'settings.menu.adaRedemption.link.label',
    defaultMessage: '!!!Ada Redemption',
  }
});

type Props = {
  isActiveItem: Function,
  onItemClick: Function,
  hasActiveWallet: boolean,
  currentLocale: string,
  classicTheme: boolean,
};

@observer
export default class SettingsMenu extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const { onItemClick, isActiveItem, hasActiveWallet, currentLocale, classicTheme } = this.props;

    return (
      <div className={classicTheme ? '' : styles.componentWrapper}>
        <div className={classicTheme ? styles.componentClassic : styles.component}>
          <SettingsMenuItem
            label={intl.formatMessage(messages.general)}
            onClick={() => onItemClick(ROUTES.SETTINGS.GENERAL)}
            active={isActiveItem(ROUTES.SETTINGS.GENERAL)}
            className="general"
            classicTheme={classicTheme}
          />

          <SettingsMenuItem
            label={intl.formatMessage(messages.paperWallet)}
            onClick={() => onItemClick(ROUTES.SETTINGS.PAPER_WALLET)}
            active={isActiveItem(ROUTES.SETTINGS.PAPER_WALLET)}
            className="paperWallet"
            classicTheme={classicTheme}
          />

          <SettingsMenuItem
            label={intl.formatMessage(messages.wallet)}
            onClick={() => {
              if (hasActiveWallet) {
                onItemClick(ROUTES.SETTINGS.WALLET);
              }
            }}
            active={isActiveItem(ROUTES.SETTINGS.WALLET)}
            className="wallet"
            disabled={!hasActiveWallet}
            classicTheme={classicTheme}
          />

          <SettingsMenuItem
            label={intl.formatMessage(messages.termsOfUse)}
            onClick={() => onItemClick(ROUTES.SETTINGS.TERMS_OF_USE)}
            active={isActiveItem(ROUTES.SETTINGS.TERMS_OF_USE)}
            className="termsOfUse"
            classicTheme={classicTheme}
          />

          <SettingsMenuItem
            label={intl.formatMessage(messages.support)}
            onClick={() => onItemClick(ROUTES.SETTINGS.SUPPORT)}
            active={isActiveItem(ROUTES.SETTINGS.SUPPORT)}
            className="support"
            classicTheme={classicTheme}
          />

          <SettingsMenuItem
            label={intl.formatMessage(messages.display)}
            onClick={() => onItemClick(ROUTES.SETTINGS.DISPLAY)}
            active={isActiveItem(ROUTES.SETTINGS.DISPLAY)}
            className="display"
            classicTheme={classicTheme}
          />

          {(!environment.isMainnet() || currentLocale === 'ko-KR' || currentLocale === 'ja-JP') &&
            // all unredemed Ada is held being either Japanese or Korean people
            // avoid showing this menu option to all users to avoid confusing them
            <SettingsMenuItem
              label={intl.formatMessage(messages.adaRedemption)}
              onClick={() => onItemClick(ROUTES.SETTINGS.ADA_REDEMPTION)}
              active={isActiveItem(ROUTES.SETTINGS.ADA_REDEMPTION)}
              className="adaRedemption"
              classicTheme={classicTheme}
            />
          }

          <SettingsMenuItem
            label={intl.formatMessage(messages.AboutYoroi)}
            onClick={() => onItemClick(ROUTES.SETTINGS.ABOUT_YOROI)}
            active={isActiveItem(ROUTES.SETTINGS.ABOUT_YOROI)}
            className="AboutYoroi"
            classicTheme={classicTheme}
          />
        </div>
      </div>
    );
  }

}
