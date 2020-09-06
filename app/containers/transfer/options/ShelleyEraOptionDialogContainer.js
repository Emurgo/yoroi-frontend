// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { computed, } from 'mobx';
import { observer } from 'mobx-react';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import ShelleyOptionDialog from '../../../components/transfer/cards/ShelleyOptionDialog';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { RestoreModeType } from '../../../actions/common/wallet-restore-actions';
import config from '../../../config';
import { HardwareUnsupportedError } from '../../../api/common/errors';
import ErrorPage from '../../../components/transfer/ErrorPage';
import { intlShape } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import { WalletTypeOption, } from '../../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import RewardClaimDisclaimer from '../../../components/transfer/RewardClaimDisclaimer';
import { ChainDerivations } from '../../../config/numbersConfig';
import DeregisterDialogContainer from '../DeregisterDialogContainer';
import type { GeneratedData as DeregisterDialogContainerData } from '../DeregisterDialogContainer';

import {
  Bip44DerivationLevels,
} from '../../../api/ada/lib/storage/database/walletTypes/bip44/api/utils';

export type GeneratedData = typeof ShelleyEraOptionDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onCancel: void => void,
|};

export const DisclaimerStatus = Object.freeze({
  FeeDisclaimer: 1,
  DeregisterDisclaimer: 2,
  Done: 3,
});


@observer
export default class ShelleyEraOptionDialogContainer extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  startTransferIcarusRewards: void => void = () => {
    this.generated.actions.yoroiTransfer.startTransferFunds.trigger({
      source: {
        type: 'cip1852',
        extra: undefined,
        length: config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT,
        chain: ChainDerivations.CHIMERIC_ACCOUNT,
      },
    });
  }

  startTransferYoroiPaperRewards: void => void = () => {
    this.generated.actions.yoroiTransfer.startTransferFunds.trigger({
      source: {
        type: 'cip1852',
        extra: 'paper',
        length: config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT,
        chain: ChainDerivations.CHIMERIC_ACCOUNT,
      },
    });
  }

  startTransferPrivateKey: void => void = () => {
    this.generated.actions.yoroiTransfer.startTransferFunds.trigger({
      source: {
        type: 'cip1852',
        extra: 'privateKey',
        derivationLevel: Bip44DerivationLevels.ADDRESS.level,
      },
    });
  }

  callContinuation: void => void = () => {
    const continuation = this.generated.stores.uiDialogs.getActiveData<void => void>('continuation');
    if (continuation == null) throw new Error(`${nameof(ShelleyEraOptionDialogContainer)} empty continuation`);
    continuation();
  }

  render(): Node {
    const { intl } = this.context;

    const { selected } = this.generated.stores.wallets;
    if (selected == null) throw new Error(`${nameof(ShelleyEraOptionDialogContainer)} no wallet selected`);
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

    if (disclaimerStatus === DisclaimerStatus.FeeDisclaimer) {
      return (
        <RewardClaimDisclaimer
          onBack={() => this.generated.actions.dialogs.updateDataForActiveDialog.trigger({
            disclaimer: undefined,
            continuation: undefined,
          })}
          onNext={() => {
            const nextStatus = DisclaimerStatus.DeregisterDisclaimer;
            this.generated.actions.dialogs.updateDataForActiveDialog.trigger({
              disclaimer: nextStatus,
            });
            if (nextStatus === DisclaimerStatus.Done) {
              this.callContinuation();
            }
          }}
        />
      );
    }
    if (disclaimerStatus === DisclaimerStatus.DeregisterDisclaimer) {
      return (
        <DeregisterDialogContainer
          {...this.generated.DeregisterDialogContainerProps}
          onNext={() => {
            this.generated.actions.dialogs.updateDataForActiveDialog.trigger({
              disclaimer: DisclaimerStatus.Done,
            });
            this.callContinuation();
          }}
        />
      );
    }
    if (disclaimerStatus === DisclaimerStatus.Done) {
      return null;
    }

    return (
      <ShelleyOptionDialog
        onRegular={() => this.generated.actions.dialogs.updateDataForActiveDialog.trigger({
          disclaimer: DisclaimerStatus.FeeDisclaimer,
          continuation: this.startTransferIcarusRewards
        })}
        onPaper={() => this.generated.actions.dialogs.updateDataForActiveDialog.trigger({
          disclaimer: DisclaimerStatus.FeeDisclaimer,
          continuation: this.startTransferYoroiPaperRewards
        })}
        onPrivateKey={() => this.generated.actions.dialogs.updateDataForActiveDialog.trigger({
          disclaimer: DisclaimerStatus.FeeDisclaimer,
          continuation: this.startTransferPrivateKey,
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
      ada: {|
        delegationTransaction: {|
          setShouldDeregister: {|
            trigger: boolean => void,
          |},
        |},
      |},
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
    |},
    DeregisterDialogContainerProps: InjectedOrGenerated<DeregisterDialogContainerData>,
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(ShelleyEraOptionDialogContainer)} no way to generated props`);
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
        ada: {
          delegationTransaction: {
            setShouldDeregister: {
              trigger: actions.ada.delegationTransaction.setShouldDeregister.trigger,
            },
          },
        },
        dialogs: {
          updateDataForActiveDialog: { trigger: actions.dialogs.updateDataForActiveDialog.trigger },
        },
        yoroiTransfer: {
          startTransferFunds: { trigger: yoroiTransfer.startTransferFunds.trigger },
        },
      },
      DeregisterDialogContainerProps: (
        { actions, stores, }: InjectedOrGenerated<DeregisterDialogContainerData>
      ),
    });
  }
}
