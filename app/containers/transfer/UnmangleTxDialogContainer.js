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
import {
  asHasUtxoChains,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import SpendingPasswordInput from '../../components/widgets/forms/SpendingPasswordInput';
import { addressToDisplayString, getAddressPayload } from '../../api/ada/lib/storage/bridge/utils';
import globalMessages from '../../i18n/global-messages';
import type { ConfigType } from '../../../config/config-types';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { SelectedExplorer } from '../../domain/SelectedExplorer';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import LocalizableError from '../../i18n/LocalizableError';
import type { SetupSelfTxRequest } from '../../stores/toplevel/TransactionBuilderStore';
import { ApiOptions, getApiForNetwork, getApiMeta } from '../../api/common/utils';
import { GROUP_MANGLED } from '../../stores/stateless/addressStores';
import type { IAddressTypeStore, IAddressTypeUiSubset } from '../../stores/stateless/addressStores';
import type { ISignRequest } from '../../api/common/lib/transactions/ISignRequest';

declare var CONFIG: ConfigType;

export type GeneratedData = typeof UnmangleTxDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onClose: void => void,
|};

@observer
export default class UnmangleTxDialogContainer extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  @observable spendingPasswordForm: void | ReactToolboxMobxForm;

  @action
  setSpendingPasswordForm(form: ReactToolboxMobxForm) {
    this.spendingPasswordForm = form;
  }

  componentDidMount() {
    const selected = this.generated.stores.wallets.selected;
    if (selected == null) {
      throw new Error(`${nameof(UnmangleTxDialogContainer)} no wallet selected`);
    }
    const withChains = asHasUtxoChains(selected);
    if (withChains == null) {
      throw new Error(`${nameof(UnmangleTxDialogContainer)} no chains`);
    }

    const request = this.generated.stores.addresses.addressSubgroupMap.get(GROUP_MANGLED.class);
    if (request == null) throw new Error('No request. Should never happen');

    const filterTo = new Set(
      request.all
        // we don't want to include any UTXO that would do nothing but increase the tx fee
        .filter(info => info.value != null && info.value.gt(CONFIG.genesis.linearFee.coefficient))
        .map(info => getAddressPayload(info.address, selected.getParent.getNetworkInfo()))
    );

    // note: don't await
    this.generated.actions.txBuilderActions.initialize.trigger({
      publicDeriver: withChains,
      /**
       * We filter to only UTXOs of mangled addresses
       * this ensures that the tx fee is also paid by a UTXO of a mangled address
       */
      filter: utxo => filterTo.has(utxo.address),
    });
  }

  componentWillUnmount() {
    const builderActions = this.generated.actions.txBuilderActions;
    builderActions.reset.trigger();
    this.generated.stores.wallets.sendMoneyRequest.reset();
  }

  submit: void => Promise<void> = async () => {
    const selected = this.generated.stores.wallets.selected;
    if (selected == null) {
      throw new Error(`${nameof(UnmangleTxDialogContainer)} no wallet selected`);
    }
    if (this.spendingPasswordForm == null) {
      throw new Error(`${nameof(UnmangleTxDialogContainer)} form not set`);
    }
    this.spendingPasswordForm.submit({
      onSuccess: async (form) => {
        const { walletPassword } = form.values();

        const txBuilderStore = this.generated.stores.transactionBuilderStore;
        if (txBuilderStore.tentativeTx == null) return;
        await this.generated.actions.wallets.sendMoney.trigger({
          signRequest: txBuilderStore.tentativeTx,
          password: walletPassword,
          publicDeriver: selected,
        });
      },
      onError: () => {}
    });
  };

  render(): Node {
    const txBuilder = this.generated.stores.transactionBuilderStore;

    if (txBuilder.setupSelfTx.error != null) {
      return (
        <YoroiTransferErrorPage
          error={txBuilder.setupSelfTx.error}
          onCancel={this.props.onClose}
          classicTheme={this.generated.stores.profile.isClassicTheme}
        />
      );
    }

    if (txBuilder.tentativeTx == null) {
      return this.getSpinner();
    }
    const tentativeTx = txBuilder.tentativeTx;
    return this.getContent(tentativeTx);
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
      throw new Error(`${nameof(UnmangleTxDialogContainer)} no wallet selected`);
    }
    const api = getApiForNetwork(selected.getParent().getNetworkInfo());
    if (api !== ApiOptions.ada) {
      throw new Error(`${nameof(UnmangleTxDialogContainer)} not ADA API type`);
    }
    const apiMeta = getApiMeta(api);
    if (apiMeta == null) throw new Error(`${nameof(UnmangleTxDialogContainer)} no API selected`);

    const coinPrice: ?number = this.generated.stores.profile.unitOfAccount.enabled
      ? (
        this.generated.stores.coinPriceStore.getCurrentPrice(
          apiMeta.meta.primaryTicker,
          this.generated.stores.profile.unitOfAccount.currency
        )
      )
      : null;

    const transferTx = {
      recoveredBalance: tentativeTx.totalInput(true),
      fee: tentativeTx.fee(true),
      senders: tentativeTx
        .uniqueSenderAddresses()
        .map(addr => addressToDisplayString(addr, selected.getParent.getNetworkInfo())),
      receiver: tentativeTx
        .receivers(false)
        .map(addr => addressToDisplayString(addr, selected.getParent.getNetworkInfo()))[0],
    };

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
        transferTx={transferTx}
        onSubmit={this.submit}
        isSubmitting={this.generated.stores.wallets.sendMoneyRequest.isExecuting}
        onCancel={this.props.onClose}
        error={this.generated.stores.wallets.sendMoneyRequest.error}
        dialogTitle={intl.formatMessage(globalMessages.walletSendConfirmationDialogTitle)}
        coinPrice={coinPrice}
        unitOfAccountSetting={this.generated.stores.profile.unitOfAccount}
      />
    );
  }

  @computed get generated(): {|
    actions: {|
      txBuilderActions: {|
        reset: {| trigger: (params: void) => void |},
        initialize: {| trigger: (params: SetupSelfTxRequest) => Promise<void> |},
      |},
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
      addresses: {|
        addressSubgroupMap: $ReadOnlyMap<Class<IAddressTypeStore>, IAddressTypeUiSubset>,
      |},
      transactionBuilderStore: {|
        setupSelfTx: {|
          error: ?LocalizableError,
        |},
        tentativeTx: null | ISignRequest<any>,
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
      throw new Error(`${nameof(UnmangleTxDialogContainer)} no way to generated props`);
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
        addresses: {
          addressSubgroupMap: stores.addresses.addressSubgroupMap,
        },
        transactionBuilderStore: {
          tentativeTx: stores.transactionBuilderStore.tentativeTx,
          setupSelfTx: {
            error: stores.transactionBuilderStore.setupSelfTx.error,
          },
        },
      },
      actions: {
        txBuilderActions: {
          initialize: {
            trigger: actions.txBuilderActions.initialize.trigger,
          },
          reset: {
            trigger: actions.txBuilderActions.reset.trigger
          },
        },
        wallets: {
          sendMoney: {
            trigger: actions.wallets.sendMoney.trigger
          },
        },
      },
    });
  }
}
