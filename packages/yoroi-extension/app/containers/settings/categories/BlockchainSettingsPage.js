// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { intlShape } from 'react-intl';
import ExplorerSettings from '../../../components/settings/categories/general-setting/ExplorerSettings';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import UriSettingsBlock from '../../../components/settings/categories/general-setting/UriSettingsBlock';
import registerProtocols from '../../../uri-protocols';
import environment from '../../../environment';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import LocalizableError from '../../../i18n/LocalizableError';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import NoWalletMessage from '../../wallet/NoWalletMessage';
import { isCardanoHaskell } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import type { ExplorerRow } from '../../../api/ada/lib/storage/database/explorers/tables';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import type { GetAllExplorersResponse } from '../../../api/ada/lib/storage/bridge/explorers';
import { Typography } from '@mui/material';
import { settingsMenuMessages } from '../../../components/settings/menu/SettingsMenu';

type GeneratedData = typeof BlockchainSettingsPage.prototype.generated;

@observer
export default class BlockchainSettingsPage extends Component<InjectedOrGenerated<GeneratedData>> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const walletsStore = this.generated.stores.wallets;
    const profileStore = this.generated.stores.profile;
    if (walletsStore.selected == null) {
      return <NoWalletMessage />;
    }
    const networkInfo = walletsStore.selected.getParent().getNetworkInfo();

    const { stores } = this.generated;
    const { intl } = this.context;

    const isSubmittingExplorer = stores.explorers.setSelectedExplorerRequest.isExecuting;

    const uriSettings =
      isCardanoHaskell(networkInfo) && this.generated.canRegisterProtocol() ? (
        <UriSettingsBlock
          registerUriScheme={() => registerProtocols()}
          isFirefox={environment.userAgentInfo.isFirefox()}
        />
      ) : null;

    return (
      <>
        {profileStore.isRevampTheme && (
          <Typography variant="h5" fontWeight={500} mb="24px">
            {intl.formatMessage(settingsMenuMessages.blockchain)}
          </Typography>
        )}
        <ExplorerSettings
          onSelectExplorer={this.generated.actions.explorers.updateSelectedExplorer.trigger}
          isSubmitting={isSubmittingExplorer}
          explorers={
            this.generated.stores.explorers.allExplorers.get(networkInfo.NetworkId) ??
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

  @computed get generated(): {|
    actions: {|
      explorers: {|
        updateSelectedExplorer: {|
          trigger: (params: {|
            explorer: $ReadOnly<ExplorerRow>,
          |}) => Promise<void>,
        |},
      |},
    |},
    canRegisterProtocol: () => boolean,
    stores: {|
      explorers: {|
        selectedExplorer: Map<number, SelectedExplorer>,
        setSelectedExplorerRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean,
        |},
        allExplorers: GetAllExplorersResponse,
      |},
      wallets: {|
        selected: null | PublicDeriver<>,
      |},
      profile: {|
        isRevampTheme: boolean,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(BlockchainSettingsPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        explorers: {
          selectedExplorer: stores.explorers.selectedExplorer,
          allExplorers: stores.explorers.allExplorers,
          setSelectedExplorerRequest: {
            isExecuting: stores.explorers.setSelectedExplorerRequest.isExecuting,
            error: stores.explorers.setSelectedExplorerRequest.error,
          },
        },
        wallets: {
          selected: stores.wallets.selected,
        },
        profile: {
          isRevampTheme: stores.profile.isRevampTheme,
        },
      },
      actions: {
        explorers: {
          updateSelectedExplorer: { trigger: actions.explorers.updateSelectedExplorer.trigger },
        },
      },
      canRegisterProtocol: environment.userAgentInfo.canRegisterProtocol,
    });
  }
}
