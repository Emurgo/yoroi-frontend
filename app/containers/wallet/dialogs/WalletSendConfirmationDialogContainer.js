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
  formattedWalletAmount,
} from '../../../utils/formatters';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import { RustModule } from '../../../api/ada/lib/cardanoCrypto/rustLoader';
import LocalizableError from '../../../i18n/LocalizableError';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import type { ExplorerType } from '../../../domain/Explorer';
import { ApiOptions, getApiForNetwork, getApiMeta } from '../../../api/common/utils';

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

  getApiType: PublicDeriver<> => 'ada' = (publicDeriver) => {
    const selectedApiType = getApiForNetwork(publicDeriver.getParent().getNetworkInfo());
    if (selectedApiType !== ApiOptions.ada) {
      throw new Error(`${nameof(WalletSendConfirmationDialogContainer)} sending only supported for ADA`);
    }
    return (selectedApiType: any);
  }

  componentWillUnmount() {
    this.generated.stores.substores.ada.wallets.sendMoneyRequest.reset();
  }

  render(): Node {
    const {
      currencyUnit,
      signRequest,
      unitOfAccountSetting, coinPrice,
    } = this.props;
    const { stores, actions } = this.generated;
    const publicDeriver = stores.wallets.selected;
    const { profile } = stores;

    if (publicDeriver == null) throw new Error(`Active wallet required for ${nameof(WalletSendConfirmationDialogContainer)}`);
    const selectedApiType = this.getApiType(publicDeriver);
    const apiMeta = getApiMeta(selectedApiType)?.meta;
    if (apiMeta == null) throw new Error(`${nameof(WalletSendConfirmationDialogContainer)} no API selected`);

    const { sendMoney } = actions[selectedApiType].wallets;
    const { wallets } = stores.substores[selectedApiType];
    const { sendMoneyRequest } = wallets;

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
        amountToNaturalUnits={amount => formattedAmountToNaturalUnits(
          amount,
          apiMeta.decimalPlaces.toNumber()
        )}
        formattedWalletAmount={amount => formattedWalletAmount(
          amount,
          apiMeta.decimalPlaces.toNumber()
        )}
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
