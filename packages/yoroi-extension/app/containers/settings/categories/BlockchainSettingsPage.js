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
import { Typography } from '@mui/material';
import { settingsMenuMessages } from '../../../components/settings/menu/SettingsMenu';

@observer
export default class BlockchainSettingsPage extends Component<StoresAndActionsProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { stores } = this.props;
    const profileStore = stores.profile;
    const { selected } = stores.wallets;
    if (selected == null) {
      return <NoWalletMessage />;

    }
    const { intl } = this.context;

    const isSubmittingExplorer = stores.explorers.setSelectedExplorerRequest.isExecuting;

    const uriSettings =
      selected.isCardanoHaskell && environment.userAgentInfo.canRegisterProtocol() ? (
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
          onSelectExplorer={({ explorerId }) =>
            stores.explorers.setSelectedExplorer(
              { explorerId, networkId: selected.networkId }
            )
          }
          isSubmitting={isSubmittingExplorer}
          explorers={
            this.props.stores.explorers.allExplorers.get(selected.networkId) ??
            (() => {
              throw new Error('No explorer for wallet network');
            })()
          }
          selectedExplorer={
            stores.explorers.selectedExplorer.get(selected.networkId) ??
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
