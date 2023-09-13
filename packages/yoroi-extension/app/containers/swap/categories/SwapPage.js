// @flow
import type { Node } from 'react';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import type { LanguageType } from '../../../i18n/translations';
import type { Theme } from '../../../styles/utils';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { defineMessages, intlShape } from 'react-intl';
import { handleExternalLinkClick } from '../../../utils/routing';
import { THEMES } from '../../../styles/utils';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver';
import { ReactComponent as AdaCurrency } from '../../../assets/images/currencies/ADA.inline.svg';
import { unitOfAccountDisabledValue } from '../../../types/unitOfAccountType';
import { trackSetUnitOfAccount, trackSetLocale } from '../../../api/analytics';
import GeneralSettings from '../../../components/settings/categories/general-setting/GeneralSettings';
import ThemeSettingsBlock from '../../../components/settings/categories/general-setting/ThemeSettingsBlock';
import AboutYoroiSettingsBlock from '../../../components/settings/categories/general-setting/AboutYoroiSettingsBlock';
import UnitOfAccountSettings from '../../../components/settings/categories/general-setting/UnitOfAccountSettings';
import LocalizableError from '../../../i18n/LocalizableError';
import { Box, Button } from '@mui/material';
import SwapInput from '../../../components/swap/SwapInput';

type GeneratedData = typeof SwapPage.prototype.generated;

@observer
export default class SwapPage extends Component<InjectedOrGenerated<GeneratedData>> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    return (
      <Box width="100%" mx="auto" maxWidth="506px" display="flex" flexDirection="column" gap="16px">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Box>Market</Box>
            <Box>Limit</Box>
          </Box>
          <Box>Refresh</Box>
        </Box>
        <SwapInput label="Swap from" />
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>Switch</Box>
          <Box>
            <Button variant="tertiary" color="primary">
              Clear
            </Button>
          </Box>
        </Box>
        <SwapInput label="Swap to" />
      </Box>
    );
  }

  @computed get generated(): {|
    actions: {|
      router: {|
        goToRoute: {|
          trigger: (params: {|
            publicDeriver?: null | PublicDeriver<>,
            params?: ?any,
            route: string,
          |}) => void,
        |},
      |},
    |},
    stores: {|
      wallets: {|
        selected: null | PublicDeriver<>,
        publicDerivers: Array<PublicDeriver<>>,
        getLastSelectedWallet: void => ?PublicDeriver<>,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(SwapPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const profileStore = stores.profile;
    return Object.freeze({
      stores: {
        wallets: {
          selected: stores.wallets.selected,
          publicDerivers: stores.wallets.publicDerivers,
          getLastSelectedWallet: stores.wallets.getLastSelectedWallet,
        },
      },
      actions: {
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
      },
    });
  }
}
