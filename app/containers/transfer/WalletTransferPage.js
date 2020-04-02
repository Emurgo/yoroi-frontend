// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { intlShape } from 'react-intl';

import type { InjectedOrGenerated } from '../../types/injectedPropsType';

import TransferTypeSelect from '../../components/transfer/cards/TransferTypeSelect';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import { TransferSource, } from '../../types/TransferTypes';
import YoroiTransferPage from './YoroiTransferPage';
import type { GeneratedData as YoroiTransferPageData } from './YoroiTransferPage';
import DaedalusTransferPage from './DaedalusTransferPage';
import type { GeneratedData as DaedalusTransferPageData } from './DaedalusTransferPage';

import ByronEraOptionDialogContainer from './options/ByronEraOptionDialogContainer';
import type { GeneratedData as ByronEraOptionDialogContainerData } from './options/ByronEraOptionDialogContainer';

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

  getIcarusTransferDialog: InjectedOrGenerated<YoroiTransferPageData> => Node = (props) => {
    return (<YoroiTransferPage {...props} />);
  }

  getDaedalusTransferDialog: InjectedOrGenerated<DaedalusTransferPageData> => Node = (props) => {
    return (<DaedalusTransferPage {...props} />);
  }

  render() {
    const { actions, stores } = this.generated;
    const { uiDialogs } = stores;

    let activeDialog = null;
    if (uiDialogs.isOpen(ByronEraOptionDialogContainer)) {
      activeDialog = (
        <ByronEraOptionDialogContainer
          onCancel={this.onClose}
          {...this.generated.ByronEraOptionDialogContainerProps}
        />
      );
    }

    const icarusTransfer = this.generated.YoroiTransferPageProps != null
      ? this.getIcarusTransferDialog(this.generated.YoroiTransferPageProps)
      : null;

    const daedalusTransfer = this.generated.DaedalusTransferPageProps != null
      ? this.getDaedalusTransferDialog(this.generated.DaedalusTransferPageProps)
      : null;

    return (
      <>
        <TransferTypeSelect
          onByron={() => actions.dialogs.open.trigger({ dialog: ByronEraOptionDialogContainer })}
          onShelleyItn={() => this.generated.actions.ada.yoroiTransfer
            .startTransferFunds.trigger({
              source: TransferSource.SHELLEY_UTXO
            })
          }
        />
        {activeDialog}
        {icarusTransfer}
        {daedalusTransfer}
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
    const { yoroiTransfer } = actions.ada;
    return Object.freeze({
      stores: {
        uiDialogs: {
          isOpen: stores.uiDialogs.isOpen,
          getParam: stores.uiDialogs.getParam,
        },
      },
      actions: {
        ada: {
          yoroiTransfer: {
            startTransferFunds: { trigger: yoroiTransfer.startTransferFunds.trigger },
          },
        },
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
      ByronEraOptionDialogContainerProps: (
        { actions, stores }: InjectedOrGenerated<ByronEraOptionDialogContainerData>
      ),
      YoroiTransferPageProps: (
        { actions, stores }: (?InjectedOrGenerated<YoroiTransferPageData>)
      ),
      DaedalusTransferPageProps: (
        { actions, stores }: (?InjectedOrGenerated<DaedalusTransferPageData>)
      ),
    });
  }
}
