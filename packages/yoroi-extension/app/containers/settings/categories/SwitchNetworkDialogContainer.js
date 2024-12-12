// @flow
import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
import { Component } from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import SwitchNetworkDialog from '../../../components/wallet/settings/SwitchNetworkDialog';
import { networks } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import globalMessages from '../../../i18n/global-messages';

type Props = {|
  ...StoresAndActionsProps,
|};

const networkNames = Object.freeze({
  CardanoMainnet: globalMessages.mainnet,
  CardanoPreprodTestnet: globalMessages.preprod,
  CardanoPreviewTestnet: globalMessages.preview,
  CardanoSanchoTestnet: globalMessages.sancho,
});
// type assertion to ensure we have all names:
(networks: {| [$Keys<typeof networkNames>]: any |});

@observer
export default class SwitchNetworkDialogContainer extends Component<Props> {
  render(): Node {
    const profileStore = this.props.stores.profile;

    return (
      <SwitchNetworkDialog
        onCancel={() => {
          this.props.actions.dialogs.closeActiveDialog.trigger();
        }}
        onApply={async (networkId) => {
          if (networkId !== profileStore.getCurrentNetworkId()) {
            await profileStore.setCurrentNetworkId(networkId);
            window.location.reload();
          }
        }}
        networks={Object.keys(networks).map(network => ({
          id: networks[network].NetworkId,
          name: networkNames[network],
        }))}
        currentNetworkId={profileStore.getCurrentNetworkId()}
      />
    );
  }
}
