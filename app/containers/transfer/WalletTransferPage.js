// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { intlShape } from 'react-intl';

import environment from '../../environment';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import globalMessages from '../../i18n/global-messages';

import TransferTypeSelect from '../../components/transfer/cards/TransferTypeSelect';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';

import ByronEraOptionDialogContainer from './ByronEraOptionDialogContainer';

export type GeneratedData = typeof WalletTransferPage.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  publicDeriver: PublicDeriver<>,
|};

@observer
export default class WalletTransferPage extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  onClose: void => void = () => {
    this.generated.actions.dialogs.closeActiveDialog.trigger();
  };

  render() {
    const { actions, stores } = this.generated;
    const { uiDialogs } = stores;

    let activeDialog = null;
    if (uiDialogs.isOpen(ByronEraOptionDialogContainer)) {
      activeDialog = (
        <ByronEraOptionDialogContainer
          onClose={this.onClose}
          onTrezor={() => {}}
          onLedger={() => {}}
        />
      );
    }

    return (
      <>
        <TransferTypeSelect
          onByron={() => actions.dialogs.open.trigger({ dialog: ByronEraOptionDialogContainer })}
        />
        {activeDialog}
      </>
    );
  }

  _getRouter() {
    return this.generated.actions.router;
  }

  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(WalletTransferPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        uiDialogs: {
          isOpen: stores.uiDialogs.isOpen,
          getParam: stores.uiDialogs.getParam,
        },
      },
      actions: {
        router: {
          goToRoute: {
            trigger: actions.router.goToRoute.trigger,
          },
        },
        dialogs: {
          closeActiveDialog: {
            trigger: actions.dialogs.closeActiveDialog.trigger,
          },
          open: {
            trigger: actions.dialogs.open.trigger,
          },
        },
      },
    });
  }
}
