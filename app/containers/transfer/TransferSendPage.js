// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { action, computed, observable } from 'mobx';
import { intlShape, } from 'react-intl';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import LegacyTransferLayout from '../../components/transfer/LegacyTransferLayout';
import TransferSummaryPage from '../../components/transfer/TransferSummaryPage';
import YoroiTransferErrorPage from './YoroiTransferErrorPage';
import VerticallyCenteredLayout from '../../components/layout/VerticallyCenteredLayout';
import Dialog from '../../components/widgets/Dialog';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import { formattedWalletAmount } from '../../utils/formatters';
import SpendingPasswordInput from '../../components/widgets/forms/SpendingPasswordInput';
import { addressToDisplayString, } from '../../api/ada/lib/storage/bridge/utils';
import globalMessages from '../../i18n/global-messages';
import type { ConfigType } from '../../../config/config-types';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { SelectedExplorer } from '../../domain/SelectedExplorer';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import LocalizableError from '../../i18n/LocalizableError';
import { getApiForNetwork, getApiMeta } from '../../api/common/utils';
import type { ISignRequest } from '../../api/common/lib/transactions/ISignRequest';
import type {
  TransferTx,
} from '../../types/TransferTypes';
import { genAddressLookup } from '../../stores/stateless/addressStores';

declare var CONFIG: ConfigType;

export type GeneratedData = typeof TransferSendPage.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onClose: void => void,
  +toTransferTx: ISignRequest<any> => TransferTx,
  +transactionRequest: {|
    +error: ?LocalizableError,
    +result: ?ISignRequest<any>,
    +reset: void => void,
  |}
|};

@observer
export default class TransferSendPage extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  @observable spendingPasswordForm: void | ReactToolboxMobxForm;

  @action
  setSpendingPasswordForm(form: ReactToolboxMobxForm) {
    this.spendingPasswordForm = form;
  }

  componentWillUnmount() {
    this.generated.stores.wallets.sendMoneyRequest.reset();
    this.props.transactionRequest.reset();
  }

  submit: void => Promise<void> = async () => {
    const selected = this.generated.stores.wallets.selected;
    if (selected == null) {
      throw new Error(`${nameof(TransferSendPage)} no wallet selected`);
    }
    if (this.spendingPasswordForm == null) {
      throw new Error(`${nameof(TransferSendPage)} form not set`);
    }
    this.spendingPasswordForm.submit({
      onSuccess: async (form) => {
        const { walletPassword } = form.values();

        if (this.props.transactionRequest.result == null) return;
        await this.generated.actions.wallets.sendMoney.trigger({
          signRequest: this.props.transactionRequest.result,
          password: walletPassword,
          publicDeriver: selected,
        });
      },
      onError: () => {}
    });
  };

  render(): Node {
    if (this.props.transactionRequest.error != null) {
      return (
        <YoroiTransferErrorPage
          error={this.props.transactionRequest.error}
          onCancel={this.props.onClose}
          classicTheme={this.generated.stores.profile.isClassicTheme}
        />
      );
    }

    if (this.props.transactionRequest.result == null) {
      return this.getSpinner();
    }
    return this.getContent(this.props.transactionRequest.result);
  }

  getSpinner: void => Node = () => {
    const { intl } = this.context;
    return (
      <Dialog
        title={intl.formatMessage(globalMessages.processingLabel)}
        closeOnOverlayClick={false}
      >
        <LegacyTransferLayout>
          <VerticallyCenteredLayout>
            <LoadingSpinner />
          </VerticallyCenteredLayout>
        </LegacyTransferLayout>
      </Dialog>
    );
  }

  getContent:  ISignRequest<any> => Node = (
    tentativeTx
  ) => {
    const selected = this.generated.stores.wallets.selected;
    if (selected == null) {
      throw new Error(`${nameof(TransferSendPage)} no wallet selected`);
    }
    const api = getApiForNetwork(selected.getParent().getNetworkInfo());
    const apiMeta = getApiMeta(api);
    if (apiMeta == null) throw new Error(`${nameof(TransferSendPage)} no API selected`);

    const coinPrice: ?number = this.generated.stores.profile.unitOfAccount.enabled
      ? (
        this.generated.stores.coinPriceStore.getCurrentPrice(
          apiMeta.meta.primaryTicker,
          this.generated.stores.profile.unitOfAccount.currency
        )
      )
      : null;

    const spendingPasswordForm = (<SpendingPasswordInput
      setForm={(form) => this.setSpendingPasswordForm(form)}
      classicTheme={this.generated.stores.profile.isClassicTheme}
      isSubmitting={this.generated.stores.wallets.sendMoneyRequest.isExecuting}
    />);

    const { intl } = this.context;

    return (
      <TransferSummaryPage
        form={spendingPasswordForm}
        formattedWalletAmount={amount => formattedWalletAmount(
          amount,
          apiMeta.meta.decimalPlaces.toNumber(),
        )}
        selectedExplorer={this.generated.stores.explorers.selectedExplorer
          .get(selected.getParent().getNetworkInfo().NetworkId) ?? (() => { throw new Error('No explorer for wallet network'); })()
        }
        transferTx={this.props.toTransferTx(tentativeTx)}
        onSubmit={this.submit}
        isSubmitting={this.generated.stores.wallets.sendMoneyRequest.isExecuting}
        onCancel={this.props.onClose}
        error={this.generated.stores.wallets.sendMoneyRequest.error}
        dialogTitle={intl.formatMessage(globalMessages.walletSendConfirmationDialogTitle)}
        coinPrice={coinPrice}
        unitOfAccountSetting={this.generated.stores.profile.unitOfAccount}
        addressLookup={genAddressLookup(selected, intl)}
        addressToDisplayString={
          addr => addressToDisplayString(addr, selected.getParent().getNetworkInfo())
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
        |}
      |},
    |},
    stores: {|
      coinPriceStore: {|
        getCurrentPrice: (from: string, to: string) => ?number
      |},
      explorers: {|
        selectedExplorer: Map<number, SelectedExplorer>,
      |},
      profile: {|
        isClassicTheme: boolean,
        unitOfAccount: UnitOfAccountSettingType
      |},
      wallets: {|
        selected: null | PublicDeriver<>,
        sendMoneyRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean,
          reset: () => void
        |},
      |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(TransferSendPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        explorers: {
          selectedExplorer: stores.explorers.selectedExplorer,
        },
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
          unitOfAccount: stores.profile.unitOfAccount,
        },
        wallets: {
          selected: stores.wallets.selected,
          sendMoneyRequest: {
            reset: stores.wallets.sendMoneyRequest.reset,
            error: stores.wallets.sendMoneyRequest.error,
            isExecuting: stores.wallets.sendMoneyRequest.isExecuting,
          },
        },
        coinPriceStore: {
          getCurrentPrice: stores.coinPriceStore.getCurrentPrice,
        },
      },
      actions: {
        wallets: {
          sendMoney: {
            trigger: actions.wallets.sendMoney.trigger
          },
        },
      },
    });
  }
}
