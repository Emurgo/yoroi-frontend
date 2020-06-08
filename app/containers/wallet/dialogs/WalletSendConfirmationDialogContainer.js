// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import type { BaseSignRequest } from '../../../api/ada/transactions/types';
import {
  copySignRequest,
  IGetFee,
  IReceivers,
  ITotalInput,
} from '../../../api/ada/transactions/utils';
import WalletSendConfirmationDialog from '../../../components/wallet/send/WalletSendConfirmationDialog';
import {
  formattedAmountToNaturalUnits,
} from '../../../utils/formatters';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import { RustModule } from '../../../api/ada/lib/cardanoCrypto/rustLoader';
import type { SelectedApiType } from '../../../stores/toplevel/ProfileStore';
import LocalizableError from '../../../i18n/LocalizableError';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import type { ExplorerType } from '../../../domain/Explorer';

export type GeneratedData = typeof WalletSendConfirmationDialogContainer.prototype.generated;

type DialogProps = {|
  +signRequest: BaseSignRequest<RustModule.WalletV2.Transaction | RustModule.WalletV3.InputOutput>,
  +currencyUnit: string,
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

  getSelectedApi: void => SelectedApiType = () => {
    const { selectedAPI } = this.generated.stores.profile;
    if (selectedAPI === undefined) {
      throw new Error(`${nameof(WalletSendConfirmationDialogContainer)} no API selected`);
    }
    return selectedAPI;
  }

  render(): Node {
    const {
      currencyUnit,
      signRequest,
      unitOfAccountSetting, coinPrice,
    } = this.props;
    const selectedAPI = this.getSelectedApi();
    const { stores, actions } = this.generated;
    const { wallets } = stores.substores[selectedAPI.type];
    const { sendMoneyRequest } = wallets;
    const publicDeriver = stores.wallets.selected;
    const { profile } = stores;
    const { sendMoney } = actions[selectedAPI.type].wallets;

    if (publicDeriver == null) throw new Error('Active wallet required for WalletSendPage.');

    const totalInput = ITotalInput(signRequest, true);
    const fee = IGetFee(signRequest, true);
    const receivers = IReceivers(signRequest, false);
    return (
      <WalletSendConfirmationDialog
        staleTx={this.props.staleTx}
        selectedExplorer={stores.profile.selectedExplorer}
        amount={totalInput.minus(fee)}
        receivers={receivers}
        totalAmount={totalInput}
        transactionFee={fee}
        amountToNaturalUnits={formattedAmountToNaturalUnits}
        onSubmit={async ({ password }) => {
          const copyRequest = copySignRequest(signRequest);
          await sendMoney.trigger({
            signRequest: copyRequest,
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
        currencyUnit={currencyUnit}
        classicTheme={profile.isClassicTheme}
        unitOfAccountSetting={unitOfAccountSetting}
        coinPrice={coinPrice}
      />
    );
  }

  @computed get generated(): {|
    actions: {|
      ada: {|
        wallets: {|
          sendMoney: {|
            trigger: (params: {|
              password: string,
              publicDeriver: PublicDeriver<>,
              signRequest: BaseSignRequest<
                RustModule.WalletV2.Transaction | RustModule.WalletV3.InputOutput
              >
            |}) => Promise<void>
          |}
        |}
      |},
      dialogs: {|
        closeActiveDialog: {|
          trigger: (params: void) => void
        |}
      |}
    |},
    stores: {|
      profile: {|
        isClassicTheme: boolean,
        selectedAPI: void | SelectedApiType,
        selectedExplorer: ExplorerType
      |},
      substores: {|
        ada: {|
          wallets: {|
            sendMoneyRequest: {|
              error: ?LocalizableError,
              isExecuting: boolean,
              reset: () => void
            |}
          |}
        |}
      |},
      wallets: {| selected: null | PublicDeriver<> |}
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
        profile: {
          selectedAPI: stores.profile.selectedAPI,
          isClassicTheme: stores.profile.isClassicTheme,
          selectedExplorer: stores.profile.selectedExplorer,
        },
        wallets: {
          selected: stores.wallets.selected,
        },
        substores: {
          ada: {
            wallets: {
              sendMoneyRequest: {
                isExecuting: stores.substores.ada.wallets.sendMoneyRequest.isExecuting,
                reset: stores.substores.ada.wallets.sendMoneyRequest.reset,
                error: stores.substores.ada.wallets.sendMoneyRequest.error,
              },
            },
          },
        },
      },
      actions: {
        dialogs: {
          closeActiveDialog: {
            trigger: actions.dialogs.closeActiveDialog.trigger,
          },
        },
        ada: {
          wallets: {
            sendMoney: {
              trigger: actions.ada.wallets.sendMoney.trigger,
            },
          },
        },
      },
    });
  }
}
