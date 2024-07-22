// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import WalletSendPreviewStep from './WalletSendPreviewStep';
import type { UnitOfAccountSettingType } from '../../../../types/unitOfAccountType';
import LocalizableError from '../../../../i18n/LocalizableError';
import { SelectedExplorer } from '../../../../domain/SelectedExplorer';
import { addressToDisplayString } from '../../../../api/ada/lib/storage/bridge/utils';
import type { ISignRequest } from '../../../../api/common/lib/transactions/ISignRequest';
import type { TokenRow } from '../../../../api/ada/lib/storage/database/primitives/tables';
import type { MultiToken, TokenLookupKey } from '../../../../api/common/lib/MultiToken';
import { ampli } from '../../../../../ampli/index';
import TrezorSendActions from '../../../../actions/ada/trezor-send-actions';
import LedgerSendActions from '../../../../actions/ada/ledger-send-actions';
import type { SendMoneyRequest } from '../../../../stores/toplevel/WalletStore';
import { getNetworkById } from '../../../../api/ada/lib/storage/database/prepackaged/networks';
import type { WalletState } from '../../../../../chrome/extension/background/types';

// TODO: unmagic the constants
const MAX_VALUE_BYTES = 5000;
const MAX_TX_BYTES = 16384;

type Props = {|
  +signRequest: null | ISignRequest<any>,
  +staleTx: boolean,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +isDefaultIncluded: boolean,
  +plannedTxInfoMap: Array<{|
    token: $ReadOnly<TokenRow>,
    amount?: string,
    shouldSendAll?: boolean,
  |}>,
  +minAda: ?MultiToken,
  +onUpdateStep: (step: number) => void,
  +getCurrentPrice: (from: string, to: string) => ?string,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +isClassicTheme: boolean,
  +openTransactionSuccessDialog: void => void,
  +sendMoneyRequest: SendMoneyRequest,
  +sendMoney: (params: {|
    password: string,
    +wallet: {
      publicDeriverId: number,
      +plate: { TextPart: string, ... },
      ...
    },
    signRequest: ISignRequest<any>,
    onSuccess?: void => void,
  |}) => Promise<void>,
  +ledgerSendError: null | LocalizableError,
  +trezorSendError: null | LocalizableError,
  +ledgerSend: LedgerSendActions,
  +trezorSend: TrezorSendActions,
  selectedExplorer: Map<number, SelectedExplorer>,
  +selectedWallet: WalletState,
  receiverHandle: ?{|
    nameServer: string,
    handle: string,
  |},
|};

@observer
export default class WalletSendPreviewStepContainer extends Component<Props> {
  componentWillUnmount() {
    this.props.sendMoneyRequest.reset();
    this.props.ledgerSend.cancel.trigger();
    this.props.trezorSend.cancel.trigger();
  }

  onSubmit: ({| password: string |}) => Promise<void> = async ({ password }) => {
    const { signRequest, openTransactionSuccessDialog } = this.props;
    const { ledgerSend, trezorSend, sendMoney, selectedWallet } = this.props;

    if (signRequest == null) throw new Error('Unexpected missing active signing request');

    ampli.sendSummarySubmitted({
      asset_count: signRequest.totalInput().nonDefaultEntries().length,
    });

    if (selectedWallet.type === 'ledger') {
      await ledgerSend.sendUsingLedgerWallet.trigger({
        params: { signRequest },
        onSuccess: openTransactionSuccessDialog,
        wallet: selectedWallet,
     });
    } else if (selectedWallet.type === 'trezor') {
      await trezorSend.sendUsingTrezor.trigger({
        params: { signRequest },
        onSuccess: openTransactionSuccessDialog,
        wallet: selectedWallet,
      });
    } else {
      // walletType === 'mnemonic'
      await sendMoney({
        signRequest,
        password,
        wallet: selectedWallet,
        onSuccess: openTransactionSuccessDialog,
      });
    }
  };

  render(): Node {
    const {
      signRequest,
      unitOfAccountSetting,
      onUpdateStep,
      selectedWallet,
      selectedExplorer,
      sendMoneyRequest,
      isClassicTheme,
      getTokenInfo,
      getCurrentPrice,
      receiverHandle,
    } = this.props;

    if (selectedWallet == null)
      throw new Error(`Active wallet required for ${nameof(WalletSendPreviewStepContainer)}`);
    if (signRequest == null) throw new Error('Unexpected missing active signing request');

    const totalInput = signRequest.totalInput();
    const fee = signRequest.fee();
    const size = signRequest.size?.();
    const fullSize = size ? size.full : 0;
    const maxOutput = size ? Math.max(...size.outputs) : 0;
    const showSize =
      size != null && (size.full > MAX_TX_BYTES - 1000 || maxOutput > MAX_VALUE_BYTES - 1000);
    const receivers = signRequest.receivers(false);
    const network = getNetworkById(selectedWallet.networkId);

    return (
      <WalletSendPreviewStep
        receiverHandle={receiverHandle}
        staleTx={this.props.staleTx}
        selectedExplorer={
          selectedExplorer.get(selectedWallet.networkId) ??
          (() => {
            throw new Error('No explorer for wallet network');
          })()
        }
        getTokenInfo={getTokenInfo}
        getCurrentPrice={getCurrentPrice}
        amount={totalInput.joinSubtractCopy(fee)}
        receivers={receivers}
        totalAmount={totalInput}
        transactionFee={fee}
        transactionSize={
          showSize
            ? `${fullSize}/${MAX_TX_BYTES} (Biggest output: ${maxOutput}/${MAX_VALUE_BYTES})`
            : null
        }
        onSubmit={this.onSubmit}
        isSubmitting={sendMoneyRequest.isExecuting}
        classicTheme={isClassicTheme}
        unitOfAccountSetting={unitOfAccountSetting}
        addressToDisplayString={addr => addressToDisplayString(addr, network)}
        selectedNetwork={network}
        isDefaultIncluded={this.props.isDefaultIncluded}
        plannedTxInfoMap={this.props.plannedTxInfoMap}
        minAda={this.props.minAda}
        walletType={selectedWallet.type}
        ledgerSendError={this.props.ledgerSendError}
        trezorSendError={this.props.trezorSendError}
        onUpdateStep={onUpdateStep}
      />
    );
  }
}
