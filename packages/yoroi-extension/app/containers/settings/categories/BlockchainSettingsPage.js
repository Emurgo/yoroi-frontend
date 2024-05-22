// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import ExplorerSettings from '../../../components/settings/categories/general-setting/ExplorerSettings';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
import UriSettingsBlock from '../../../components/settings/categories/general-setting/UriSettingsBlock';
import registerProtocols from '../../../uri-protocols';
import environment from '../../../environment';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import NoWalletMessage from '../../wallet/NoWalletMessage';
import { isCardanoHaskell } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import { Typography } from '@mui/material';
import { settingsMenuMessages } from '../../../components/settings/menu/SettingsMenu';

@observer
export default class BlockchainSettingsPage extends Component<StoresAndActionsProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const walletsStore = this.props.stores.wallets;
    const profileStore = this.props.stores.profile;
    if (walletsStore.selected == null) {
      return <NoWalletMessage />;
    }
    const networkInfo = walletsStore.selected.getParent().getNetworkInfo();

    const { stores } = this.props;
    const { intl } = this.context;

    const isSubmittingExplorer = stores.explorers.setSelectedExplorerRequest.isExecuting;

    const uriSettings =
      isCardanoHaskell(networkInfo) && environment.userAgentInfo.canRegisterProtocol() ? (
        <UriSettingsBlock
          registerUriScheme={() => registerProtocols()}
          isFirefox={environment.userAgentInfo.isFirefox()}
        />
      ) : null;

    return (
      <>
        {profileStore.isRevampTheme && (
          <Typography component="div" variant="h5" fontWeight={500} mb="24px">
            {intl.formatMessage(settingsMenuMessages.blockchain)}
          </Typography>
        )}
        <ExplorerSettings
          onSelectExplorer={this.props.actions.explorers.updateSelectedExplorer.trigger}
          isSubmitting={isSubmittingExplorer}
          explorers={
            this.props.stores.explorers.allExplorers.get(networkInfo.NetworkId) ??
            (() => {
              throw new Error('No explorer for wallet network');
            })()
          }
          selectedExplorer={
            stores.explorers.selectedExplorer.get(networkInfo.NetworkId) ??
            (() => {
              throw new Error('No explorer for wallet network');
            })()
          }
          error={stores.explorers.setSelectedExplorerRequest.error}
        />
        {uriSettings}
      </>
    );
  }
}
