// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import { intlShape, } from 'react-intl';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import LegacyTransferLayout from '../../components/transfer/LegacyTransferLayout';
import TransferSummaryPage from '../../components/transfer/TransferSummaryPage';
import YoroiTransferErrorPage from './YoroiTransferErrorPage';
import VerticallyCenteredLayout from '../../components/layout/VerticallyCenteredLayout';
import Dialog from '../../components/widgets/Dialog';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import SpendingPasswordInput from '../../components/widgets/forms/SpendingPasswordInput';
import { addressToDisplayString, } from '../../api/ada/lib/storage/bridge/utils';
import globalMessages from '../../i18n/global-messages';
import type { ConfigType } from '../../../config/config-types';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import LocalizableError from '../../i18n/LocalizableError';
import type { ISignRequest } from '../../api/common/lib/transactions/ISignRequest';
import type {
  TransferTx,
} from '../../types/TransferTypes';
import { genAddressLookup } from '../../stores/stateless/addressStores';
import { genLookupOrFail } from '../../stores/stateless/tokenHelpers';
import { getNetworkById } from '../../api/ada/lib/storage/database/prepackaged/networks';
import type { StoresProps } from '../../stores';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;

type LocalProps = {|
  +onClose: {|
    +trigger: void => void,
    +label: string,
  |},
  +onSubmit: {|
    +trigger: void => void,
    +label: string,
  |},
  +toTransferTx: ISignRequest<any> => TransferTx,
  +transactionRequest: {|
    +error: ?LocalizableError,
    +result: ?ISignRequest<any>,
    +reset: void => void,
  |},
  +header?: Node,
|};

@observer
export default class TransferSendPage extends Component<{| ...StoresProps, ...LocalProps |}> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  static defaultProps: {|header: void|} = {
    header: undefined
  };

  @observable spendingPasswordForm: void | ReactToolboxMobxForm;

  @action
  setSpendingPasswordForm(form: ReactToolboxMobxForm) {
    this.spendingPasswordForm = form;
  }

  componentWillUnmount() {
    const { stores } = this.props;
    stores.wallets.sendMoneyRequest.reset();
    this.props.transactionRequest.reset();
    stores.substores.ada.ledgerSend.cancel();
    stores.substores.ada.trezorSend.cancel();
  }

  submit: void => Promise<void> = async () => {
    const { stores } = this.props;
    const selected = stores.wallets.selected;
    if (selected == null) {
      throw new Error(`${nameof(TransferSendPage)} no wallet selected`);
    }
    const signRequest = this.props.transactionRequest.result;
    if (signRequest == null) return;
    if (this.spendingPasswordForm == null) {
      if (selected.type === 'trezor') {
        await stores.substores.ada.trezorSend.sendUsingTrezor({
          params: { signRequest },
          wallet: selected,
        });
      }
      if (selected.type === 'ledger') {
        await stores.substores.ada.ledgerSend.sendUsingLedgerWallet({
          params: { signRequest },
          wallet: selected,
        });
      }
      if (stores.wallets.sendMoneyRequest.error == null) {
        this.props.onSubmit.trigger();
      }
    } else {
      this.spendingPasswordForm.submit({
        onSuccess: async (form) => {
          const { walletPassword } = form.values();
          await stores.substores.ada.mnemonicSend.sendMoney({
            signRequest,
            password: walletPassword,
            wallet: selected,
          });
          if (stores.wallets.sendMoneyRequest.error == null) {
            this.props.onSubmit.trigger();
          }
        },
        onError: () => {}
      });
    }
  };

  render(): Node {
    if (this.props.transactionRequest.error != null) {
      return (
        <YoroiTransferErrorPage
          error={this.props.transactionRequest.error}
          onCancel={this.props.onClose.trigger}
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
    const selected = this.props.stores.wallets.selected;
    if (selected == null) {
      throw new Error(`${nameof(TransferSendPage)} no wallet selected`);
    }

    const spendingPasswordForm = selected.type === 'mnemonic'
      ? (
        <SpendingPasswordInput
          setForm={(form) => this.setSpendingPasswordForm(form)}
          isSubmitting={this.props.stores.wallets.sendMoneyRequest.isExecuting}
        />
      ) : null;

    const { intl } = this.context;

    return (
      <TransferSummaryPage
        header={this.props.header}
        form={spendingPasswordForm}
        selectedExplorer={this.props.stores.explorers.selectedExplorer
          .get(selected.networkId) ?? (() => { throw new Error('No explorer for wallet network'); })()
        }
        transferTx={this.props.toTransferTx(tentativeTx)}
        getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
        onSubmit={{
          label: this.props.onSubmit.label,
          trigger: this.submit,
        }}
        isSubmitting={this.props.stores.wallets.sendMoneyRequest.isExecuting}
        onCancel={this.props.onClose}
        error={this.props.stores.wallets.sendMoneyRequest.error}
        dialogTitle={intl.formatMessage(globalMessages.walletSendConfirmationDialogTitle)}
        getCurrentPrice={this.props.stores.coinPriceStore.getCurrentPrice}
        unitOfAccountSetting={this.props.stores.profile.unitOfAccount}
        addressLookup={genAddressLookup(
          selected.networkId,
          intl,
          undefined, // don't want to go to route from within a dialog
          this.props.stores.addresses.addressSubgroupMap,
        )}
        addressToDisplayString={
          addr => addressToDisplayString(addr, getNetworkById(selected.networkId))
        }
      />
    );
  }
}
