// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import { defineMessages, intlShape, } from 'react-intl';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import type { InjectedProps } from '../../types/injectedPropsType';
import TransferLayout from '../../components/transfer/TransferLayout';
import TransferSummaryPage from '../../components/transfer/TransferSummaryPage';
import BorderedBox from '../../components/widgets/BorderedBox';
import YoroiTransferErrorPage from './YoroiTransferErrorPage';
import VerticallyCenteredLayout from '../../components/layout/VerticallyCenteredLayout';
import Dialog from '../../components/widgets/Dialog';
import DialogCloseButton from '../../components/widgets/DialogCloseButton';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import environment from '../../environment';
import { formattedWalletAmount } from '../../utils/formatters';
import { IGetFee, IReceivers, ITotalInput } from '../../api/ada/transactions/utils';
import {
  asHasUtxoChains,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import SpendingPasswordInput from '../../components/widgets/forms/SpendingPasswordInput';
import { addressToDisplayString, getAddressPayload } from '../../api/ada/lib/storage/bridge/utils';

const messages = defineMessages({
  title: {
    id: 'unmangle.dialog.title',
    defaultMessage: '!!!Unmangle transaction',
  },
});

type Props = {|
  ...InjectedProps,
  +onClose: void => void,
|};

@observer
export default class UnmangleTxDialogContainer extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  @observable spendingPasswordForm: void | ReactToolboxMobxForm;

  @action
  setSpendingPasswordForm(form: ReactToolboxMobxForm) {
    this.spendingPasswordForm = form;
  }

  componentDidMount() {
    const selected = this._getWalletsStore().selected;
    if (selected == null) {
      throw new Error(`${nameof(UnmangleTxDialogContainer)} no wallet selected`);
    }
    const withChains = asHasUtxoChains(selected.self);
    if (withChains == null) {
      throw new Error(`${nameof(UnmangleTxDialogContainer)} no chains`);
    }

    const filterTo = new Set(
      this.props.stores.substores.ada.addresses.mangledAddressesForDisplay.all
        .map(info => getAddressPayload(info.address))
    );

    this.props.stores.substores.ada.transactionBuilderStore.setupSelfTx.execute({
      publicDeriver: withChains,
      /**
       * We filter to only UTXOs of mangled addresses
       * this ensures that the tx fee is also paid by a UTXO of a mangled address
       */
      filter: utxo => filterTo.has(utxo.address), // TODO: filter UTXO smaller than tx fee for adding it
    });
  }

  componentWillUnmount() {
    const builderActions = this._getTxBuilderActions();
    builderActions.reset.trigger();
    this._getWalletsStore().sendMoneyRequest.reset();
  }

  submit = async () => {
    if (this.spendingPasswordForm == null) {
      throw new Error(`${nameof(UnmangleTxDialogContainer)} form not set`);
    }
    this.spendingPasswordForm.submit({
      onSuccess: async (form) => {
        const { walletPassword } = form.values();

        const txBuilderStore = this._getTxBuilderStore();
        if (txBuilderStore.tentativeTx == null) return;
        this.props.actions.ada.wallets.sendMoney.trigger({
          signRequest: txBuilderStore.tentativeTx,
          password: walletPassword,
        });
      },
      onError: () => {}
    });
  };

  render() {
    const { intl } = this.context;

    return (
      <Dialog
        title={intl.formatMessage(messages.title)}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        classicTheme={this.props.stores.profile.isClassicTheme}
        onClose={this.props.onClose}
      >
        {this.getContent()}
      </Dialog>
    );
  }

  getContent: (void) => Node = () => {
    const { profile } = this.props.stores;

    const txBuilder = this._getTxBuilderStore();

    if (txBuilder.setupSelfTx.error != null) {
      return (
        <YoroiTransferErrorPage
          error={txBuilder.setupSelfTx.error}
          onCancel={this.props.onClose}
          classicTheme={profile.isClassicTheme}
        />
      );
    }

    if (txBuilder.tentativeTx == null) {
      return (
        <TransferLayout>
          <VerticallyCenteredLayout>
            <LoadingSpinner />
          </VerticallyCenteredLayout>
        </TransferLayout>
      );
    }
    const tentativeTx = txBuilder.tentativeTx;

    const transferTx = {
      recoveredBalance: ITotalInput(tentativeTx, true),
      fee: IGetFee(tentativeTx, true),
      senders: Array.from(new Set(tentativeTx.senderUtxos.map(utxo => utxo.receiver)))
        .map(addr => addressToDisplayString(addr)),
      receiver: IReceivers(tentativeTx, false)
        .map(addr => addressToDisplayString(addr))[0],
    };

    const isSubmitting = false;

    const spendingPasswordForm = (<SpendingPasswordInput
      setForm={(form) => this.setSpendingPasswordForm(form)}
      classicTheme={this.props.stores.profile.isClassicTheme}
      isSubmitting={isSubmitting}
    />);

    return (
      <TransferSummaryPage
        form={spendingPasswordForm}
        formattedWalletAmount={formattedWalletAmount}
        selectedExplorer={this.props.stores.profile.selectedExplorer}
        transferTx={transferTx}
        onSubmit={this.submit}
        isSubmitting={this._getWalletsStore().sendMoneyRequest.isExecuting}
        onCancel={this.props.onClose}
        error={this._getWalletsStore().sendMoneyRequest.error}
        classicTheme={profile.isClassicTheme}
      />
    );
  }

  _getRouter() {
    return this.props.actions.router;
  }

  _getWalletsStore() {
    return this.props.stores.substores[environment.API].wallets;
  }

  _getTxBuilderStore() {
    return this.props.stores.substores.ada.transactionBuilderStore;
  }

  _getTxBuilderActions() {
    return this.props.actions.ada.txBuilderActions;
  }
}
