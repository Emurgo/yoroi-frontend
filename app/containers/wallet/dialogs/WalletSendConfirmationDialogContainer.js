// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import WalletSendConfirmationDialog from '../../../components/wallet/send/WalletSendConfirmationDialog';
import {
  formattedAmountToNaturalUnits,
  formattedWalletAmount,
} from '../../../utils/formatters';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import LocalizableError from '../../../i18n/LocalizableError';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import { getApiForNetwork, getApiMeta } from '../../../api/common/utils';
import { addressToDisplayString } from '../../../api/ada/lib/storage/bridge/utils';
import type { ISignRequest } from '../../../api/common/lib/transactions/ISignRequest';

export type GeneratedData = typeof WalletSendConfirmationDialogContainer.prototype.generated;

type DialogProps = {|
  +signRequest: ISignRequest<any>,
  +ticker: string,
  +staleTx: boolean,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +coinPrice: ?number,
|};
type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  ...DialogProps,
|};

@observer
export default class WalletSendConfirmationDialogContainer extends Component<Props> {

  componentWillUnmount() {
    this.generated.stores.wallets.sendMoneyRequest.reset();
  }

  render(): Node {
    const {
      ticker,
      signRequest,
      unitOfAccountSetting, coinPrice,
    } = this.props;
    const { stores, actions } = this.generated;
    const publicDeriver = stores.wallets.selected;
    const { profile } = stores;

    if (publicDeriver == null) throw new Error(`Active wallet required for ${nameof(WalletSendConfirmationDialogContainer)}`);
    const selectedApiType =  getApiForNetwork(publicDeriver.getParent().getNetworkInfo());
    const apiMeta = getApiMeta(selectedApiType)?.meta;
    if (apiMeta == null) throw new Error(`${nameof(WalletSendConfirmationDialogContainer)} no API selected`);

    const { sendMoney } = actions.wallets;
    const { sendMoneyRequest } = stores.wallets;

    const totalInput = signRequest.totalInput(true);
    const fee = signRequest.fee(true);
    const receivers = signRequest.receivers(false);
    return (
      <WalletSendConfirmationDialog
        staleTx={this.props.staleTx}
        selectedExplorer={stores.explorers.selectedExplorer
          .get(
            publicDeriver.getParent().getNetworkInfo().NetworkId
          ) ?? (() => { throw new Error('No explorer for wallet network'); })()
        }
        amount={totalInput.minus(fee)}
        receivers={receivers}
        totalAmount={totalInput}
        transactionFee={fee}
        amountToNaturalUnits={amount => formattedAmountToNaturalUnits(
          amount,
          apiMeta.decimalPlaces.toNumber()
        )}
        formattedWalletAmount={amount => formattedWalletAmount(
          amount,
          apiMeta.decimalPlaces.toNumber()
        )}
        onSubmit={async ({ password }) => {
          await sendMoney.trigger({
            signRequest,
            password,
            publicDeriver,
          });
        }}
        isSubmitting={sendMoneyRequest.isExecuting}
        onCancel={() => {
          actions.dialogs.closeActiveDialog.trigger();
          sendMoneyRequest.reset();
        }}
        error={sendMoneyRequest.error}
        ticker={ticker}
        classicTheme={profile.isClassicTheme}
        unitOfAccountSetting={unitOfAccountSetting}
        coinPrice={coinPrice}
        addressToDisplayString={
          addr => addressToDisplayString(addr, publicDeriver.getParent().getNetworkInfo())
        }
      />
    );
  }

  @computed get generated(): {|
    actions: {|
      wallets: {|
        sendMoney: {|
          trigger: (params: {|
            password: string,
            publicDeriver: PublicDeriver<>,
            signRequest: ISignRequest<any>,
          |}) => Promise<void>
        |},
      |},
      dialogs: {|
        closeActiveDialog: {|
          trigger: (params: void) => void
        |}
      |}
    |},
    stores: {|
      explorers: {|
        selectedExplorer: Map<number, SelectedExplorer>,
      |},
      profile: {|
        isClassicTheme: boolean,
      |},
      wallets: {|
        sendMoneyRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean,
          reset: () => void
        |},
        selected: null | PublicDeriver<>
      |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(WalletSendConfirmationDialogContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        explorers: {
          selectedExplorer: stores.explorers.selectedExplorer,
        },
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
        },
        wallets: {
          selected: stores.wallets.selected,
          sendMoneyRequest: {
            isExecuting: stores.wallets.sendMoneyRequest.isExecuting,
            reset: stores.wallets.sendMoneyRequest.reset,
            error: stores.wallets.sendMoneyRequest.error,
          },
        },
      },
      actions: {
        dialogs: {
          closeActiveDialog: {
            trigger: actions.dialogs.closeActiveDialog.trigger,
          },
        },
        wallets: {
          sendMoney: {
            trigger: actions.wallets.sendMoney.trigger,
          },
        },
      },
    });
  }
}
