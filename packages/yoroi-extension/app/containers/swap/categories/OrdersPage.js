// @flow
import type { Node } from 'react';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { ExplorerRow } from '../../../api/ada/lib/storage/database/explorers/tables';
import type { GetAllExplorersResponse } from '../../../api/ada/lib/storage/bridge/explorers';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { intlShape } from 'react-intl';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import { isCardanoHaskell } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import { trackUriPrompt } from '../../../api/analytics';
import ExplorerSettings from '../../../components/settings/categories/general-setting/ExplorerSettings';
import UriSettingsBlock from '../../../components/settings/categories/general-setting/UriSettingsBlock';
import registerProtocols from '../../../uri-protocols';
import environment from '../../../environment';
import LocalizableError from '../../../i18n/LocalizableError';
import NoWalletMessage from '../../wallet/NoWalletMessage';

type GeneratedData = typeof SwapOrdersPage.prototype.generated;

@observer
export default class SwapOrdersPage extends Component<InjectedOrGenerated<GeneratedData>> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    return <>Orders here coming soon</>;
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
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(SwapOrdersPage)} no way to generated props`);
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
