// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import SettingsMenuItem from './SettingsMenuItem';
import styles from './SettingsMenu.scss';
import environmnent from '../../../environment';
import { ROUTES } from '../../../routes-config';
import type { Theme } from '../../../themes';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  general: {
    id: 'settings.menu.general.link.label',
    defaultMessage: '!!!General',
  },
  paperWallet: {
    id: 'settings.menu.paperWallet.link.label',
    defaultMessage: '!!!Paper Wallet',
  },
  support: {
    id: 'settings.menu.support.link.label',
    defaultMessage: '!!!Support',
  },
  termsOfUse: {
    id: 'settings.menu.termsOfUse.link.label',
    defaultMessage: '!!!Terms of use',
  },
  externalStorage: {
    id: 'settings.menu.externalStorage.link.label',
    defaultMessage: '!!!External Storage',
  },
});

type Props = {|
  +isActiveItem: string => boolean,
  +onItemClick: string => void,
  +currentLocale: string,
  +currentTheme: Theme,
|};

@observer
export default class SettingsMenu extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { onItemClick, isActiveItem, } = this.props;

    return (
      <div className={styles.componentWrapper}>
        <div className={styles.component}>
          <SettingsMenuItem
            label={intl.formatMessage(messages.general)}
            onClick={() => onItemClick(ROUTES.SETTINGS.GENERAL)}
            active={isActiveItem(ROUTES.SETTINGS.GENERAL)}
            className="general"
          />

          {!environmnent.isShelley() &&
            <SettingsMenuItem
              label={intl.formatMessage(messages.paperWallet)}
              onClick={() => onItemClick(ROUTES.SETTINGS.PAPER_WALLET)}
              active={isActiveItem(ROUTES.SETTINGS.PAPER_WALLET)}
              className="paperWallet"
            />
          }

          <SettingsMenuItem
            label={intl.formatMessage(globalMessages.walletLabel)}
            onClick={() => onItemClick(ROUTES.SETTINGS.WALLET)}
            active={isActiveItem(ROUTES.SETTINGS.WALLET)}
            className="wallet"
          />

          {!environmnent.isProduction() &&
            <SettingsMenuItem
              label={intl.formatMessage(messages.externalStorage)}
              onClick={() => onItemClick(ROUTES.SETTINGS.EXTERNAL_STORAGE)}
              active={isActiveItem(ROUTES.SETTINGS.EXTERNAL_STORAGE)}
              className="externalStorage"
            />
          }

          <SettingsMenuItem
            label={intl.formatMessage(messages.termsOfUse)}
            onClick={() => onItemClick(ROUTES.SETTINGS.TERMS_OF_USE)}
            active={isActiveItem(ROUTES.SETTINGS.TERMS_OF_USE)}
            className="termsOfUse"
          />

          <SettingsMenuItem
            label={intl.formatMessage(messages.support)}
            onClick={() => onItemClick(ROUTES.SETTINGS.SUPPORT)}
            active={isActiveItem(ROUTES.SETTINGS.SUPPORT)}
            className="support"
          />
        </div>
      </div>
    );
  }

}
