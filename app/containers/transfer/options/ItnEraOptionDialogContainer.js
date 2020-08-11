// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { computed, } from 'mobx';
import { observer } from 'mobx-react';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import ItnOptionDialog from '../../../components/transfer/cards/ItnOptionDialog';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { RestoreModeType } from '../../../actions/common/wallet-restore-actions';
import config from '../../../config';
import { HardwareUnsupportedError } from '../../../api/common/errors';
import ErrorPage from '../../../components/transfer/ErrorPage';
import { intlShape } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import { WalletTypeOption, } from '../../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import ItnClaimDisclaimer from '../../../components/transfer/ItnClaimDisclaimer';

export type GeneratedData = typeof ItnEraOptionDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onCancel: void => void,
|};

const DisclaimerStatus = Object.freeze({
  Seeing: 1,
  Accepted: 2,
});

@observer
export default class ItnEraOptionDialogContainer extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  startTransferIcarusRewards: void => void = () => {
    this.generated.actions.yoroiTransfer.startTransferFunds.trigger({
      source: {
        type: 'cip1852',
        extra: undefined,
        length: config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT,
      },
    });
  }

  startTransferYoroiPaperRewards: void => void = () => {
    this.generated.actions.yoroiTransfer.startTransferFunds.trigger({
      source: {
        type: 'cip1852',
        extra: 'paper',
        length: config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT,
      },
    });
  }

  render(): Node {
    const { intl } = this.context;

    const { selected } = this.generated.stores.wallets;
    if (selected == null) throw new Error(`${nameof(ItnEraOptionDialogContainer)} no wallet selected`);
    if (selected.getParent().getWalletType() === WalletTypeOption.HARDWARE_WALLET) {
      return (
        <ErrorPage
          error={new HardwareUnsupportedError()}
          onCancel={this.props.onCancel}
          title=""
          classicTheme={false}
          backButtonLabel={intl.formatMessage(globalMessages.cancel)}
        />
      );
    }

    const disclaimerStatus = this.generated.stores.uiDialogs.getActiveData<number>('disclaimer');

    if (disclaimerStatus === DisclaimerStatus.Seeing) {
      return (
        <ItnClaimDisclaimer
          onBack={() => this.generated.actions.dialogs.updateDataForActiveDialog.trigger({
            disclaimer: undefined,
            continuation: undefined,
          })}
          onNext={() => {
            const continuation = this.generated.stores.uiDialogs.getActiveData<void => void>('continuation');
            if (continuation == null) throw new Error(`${nameof(ItnEraOptionDialogContainer)} empty continuation`);
            this.generated.actions.dialogs.updateDataForActiveDialog.trigger({
              disclaimer: DisclaimerStatus.Accepted,
            });
            continuation();
          }}
        />
      );
    }
    if (disclaimerStatus === DisclaimerStatus.Accepted) {
      return null;
    }
    // avoid re-showing the disclaimer
    // if the person presses the back button and selects a different wallet type
    const nextDisclaimerStatus = disclaimerStatus == null
      ? DisclaimerStatus.Seeing
      : DisclaimerStatus.Accepted;
    return (
      <ItnOptionDialog
        onRegular={() => this.generated.actions.dialogs.updateDataForActiveDialog.trigger({
          disclaimer: nextDisclaimerStatus,
          continuation: this.startTransferIcarusRewards
        })}
        onPaper={() => this.generated.actions.dialogs.updateDataForActiveDialog.trigger({
          disclaimer: nextDisclaimerStatus,
          continuation: this.startTransferYoroiPaperRewards
        })}
        onCancel={this.props.onCancel}
      />
    );
  }

  @computed get generated(): {|
    stores: {|
      wallets: {|
        selected: null | PublicDeriver<>,
      |},
      uiDialogs: {|
        getActiveData: <T>(number | string) => (void |T),
      |},
    |},
    actions: {|
      yoroiTransfer: {|
        startTransferFunds: {|
          trigger: (params: {|
            source: RestoreModeType
          |}) => void
        |},
      |},
      dialogs: {|
        updateDataForActiveDialog: {|
          trigger: (params: {|
          [key: string]: any,
          |}) => void
        |}
      |},
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(ItnEraOptionDialogContainer)} no way to generated props`);
    }
    const { actions, stores } = this.props;
    const { yoroiTransfer } = actions;
    return Object.freeze({
      stores: {
        wallets: {
          selected: stores.wallets.selected,
        },
        uiDialogs: {
          getActiveData: stores.uiDialogs.getActiveData,
        },
      },
      actions: {
        dialogs: {
          updateDataForActiveDialog: { trigger: actions.dialogs.updateDataForActiveDialog.trigger },
        },
        yoroiTransfer: {
          startTransferFunds: { trigger: yoroiTransfer.startTransferFunds.trigger },
        },
      },
    });
  }
}
