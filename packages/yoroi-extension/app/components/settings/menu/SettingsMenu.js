// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import environmnent from '../../../environment';
import { ROUTES } from '../../../routes-config';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import SubMenu from '../../topbar/SubMenu';
import { withLayout } from '../../../styles/context/layout';
import type { InjectedLayoutProps } from '../../../styles/context/layout';
import type { SubMenuOption } from '../../topbar/SubMenu';

export const settingsMenuMessages: Object = defineMessages({
  general: {
    id: 'settings.menu.general.link.label',
    defaultMessage: '!!!General',
  },
  blockchain: {
    id: 'settings.menu.blockchain.link.label',
    defaultMessage: '!!!Blockchain',
  },
  levelOfComplexity: {
    id: 'settings.menu.levelOfComplexity.link.label',
    defaultMessage: '!!!Level of Complexity',
  },
  externalStorage: {
    id: 'settings.menu.externalStorage.link.label',
    defaultMessage: '!!!External Storage',
  },
  analytics: {
    id: 'settings.menu.analytics.link.label',
    defaultMessage: '!!!Analytics',
  },
});

type Props = {|
  +isActiveItem: string => boolean,
  +onItemClick: string => void,
|};
@observer
class SettingsMenu extends Component<Props & InjectedLayoutProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { onItemClick, isActiveItem, isRevampLayout } = this.props;
    const isProduction = environmnent.isProduction();
    const settingOptions: Array<SubMenuOption> = [
      {
        label: intl.formatMessage(settingsMenuMessages.general),
        route: ROUTES.SETTINGS.GENERAL,
        className: 'general',
      },
      {
        label: intl.formatMessage(settingsMenuMessages.blockchain),
        route: ROUTES.SETTINGS.BLOCKCHAIN,
        className: 'blockchain',
      },
      {
        label: intl.formatMessage(globalMessages.walletLabel),
        route: ROUTES.SETTINGS.WALLET,
        className: 'wallet',
      },
      {
        label: intl.formatMessage(settingsMenuMessages.externalStorage),
        route: ROUTES.SETTINGS.EXTERNAL_STORAGE,
        className: 'externalStorage',
        hidden: isProduction,
      },
      {
        label: intl.formatMessage(
          isRevampLayout ? globalMessages.termsOfService : globalMessages.termsOfUse
        ),
        route: ROUTES.SETTINGS.TERMS_OF_USE,
        className: 'termsOfUse',
      },
      {
        label: intl.formatMessage(globalMessages.support),
        route: ROUTES.SETTINGS.SUPPORT,
        className: 'support',
      },
      {
        label: intl.formatMessage(settingsMenuMessages.levelOfComplexity),
        route: ROUTES.SETTINGS.LEVEL_OF_COMPLEXITY,
        className: 'levelOfComplexity',
      },
      {
        label: intl.formatMessage(settingsMenuMessages.analytics),
        route: ROUTES.SETTINGS.ANALYTICS,
        className: 'analytics',
        hidden: !isRevampLayout,
      },
    ];

    return (
      <SubMenu
        options={settingOptions}
        onItemClick={onItemClick}
        isActiveItem={isActiveItem}
        locationId='settings'
      />
    );
  }
}

export default (withLayout(SettingsMenu): ComponentType<Props>);
