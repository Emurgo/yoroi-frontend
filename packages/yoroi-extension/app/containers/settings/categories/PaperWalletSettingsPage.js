// @flow
import type { Node } from 'react';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { ROUTES } from '../../../routes-config';
import PaperWalletSettings from '../../../components/settings/categories/PaperWalletSettings';

@observer
export default class PaperWalletSettingsPage extends Component<StoresAndActionsProps> {
  render(): Node {
    const { actions } = this.props;
    return <PaperWalletSettings onRedirect={() => actions.router.redirect.trigger({ route: ROUTES.TRANSFER.ROOT })} />;
  }
}
