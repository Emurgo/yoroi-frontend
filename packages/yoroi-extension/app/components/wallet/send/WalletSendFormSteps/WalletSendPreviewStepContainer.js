// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import WalletSendPreviewStep from './WalletSendPreviewStep';
import type { UnitOfAccountSettingType } from '../../../../types/unitOfAccountType';
import LocalizableError from '../../../../i18n/LocalizableError';
import { PublicDeriver } from '../../../../api/ada/lib/storage/models/PublicDeriver/index';
import { SelectedExplorer } from '../../../../domain/SelectedExplorer';
import { addressToDisplayString } from '../../../../api/ada/lib/storage/bridge/utils';
import type { ISignRequest } from '../../../../api/common/lib/transactions/ISignRequest';
import type { TokenRow } from '../../../../api/ada/lib/storage/database/primitives/tables';
import type { MultiToken, TokenLookupKey } from '../../../../api/common/lib/MultiToken';
import {
  isLedgerNanoWallet,
  isTrezorTWallet,
} from '../../../../api/ada/lib/storage/models/ConceptualWallet';
import { ampli } from '../../../../../ampli/index';
import TrezorSendActions from '../../../../actions/ada/trezor-send-actions';
import LedgerSendActions from '../../../../actions/ada/ledger-send-actions';
import type { SendMoneyRequest } from '../../../../stores/toplevel/WalletStore';

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
    publicDeriver: PublicDeriver<>,
    signRequest: ISignRequest<any>,
    onSuccess?: void => void,
  |}) => Promise<void>,
  +ledgerSendError: null | LocalizableError,
  +trezorSendError: null | LocalizableError,
  +ledgerSend: LedgerSendActions,
  +trezorSend: TrezorSendActions,
  selectedExplorer: Map<number, SelectedExplorer>,
  selectedWallet: PublicDeriver<>,
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

    if (selectedWallet == null) throw new Error(`Unexpected missing active wallet`);
    if (signRequest == null) throw new Error('Unexpected missing active signing request');

    ampli.sendSummarySubmitted({
      asset_count: signRequest.totalInput().nonDefaultEntries().length,
    });

    const walletType = this. _getWalletType(selectedWallet);
    if (walletType === 'ledger') {
      await ledgerSend.sendUsingLedgerWallet.trigger({
        params: { signRequest },
        publicDeriver: selectedWallet,
        onSuccess: openTransactionSuccessDialog,
      });
    } else if (walletType === 'trezor') {
      await trezorSend.sendUsingTrezor.trigger({
        params: { signRequest },
        publicDeriver: selectedWallet,
        onSuccess: openTransactionSuccessDialog,
      });
    } else {
      // walletType === 'mnemonic'
      await sendMoney({
        signRequest,
        password,
        publicDeriver: selectedWallet,
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

    return (
      <WalletSendPreviewStep
        receiverHandle={receiverHandle}
        staleTx={this.props.staleTx}
        selectedExplorer={
          selectedExplorer.get(selectedWallet.getParent().getNetworkInfo().NetworkId) ??
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
        addressToDisplayString={addr =>
          addressToDisplayString(addr, selectedWallet.getParent().getNetworkInfo())
        }
        selectedNetwork={selectedWallet.getParent().getNetworkInfo()}
        isDefaultIncluded={this.props.isDefaultIncluded}
        plannedTxInfoMap={this.props.plannedTxInfoMap}
        minAda={this.props.minAda}
        walletType={this._getWalletType(selectedWallet)}
        ledgerSendError={this.props.ledgerSendError}
        trezorSendError={this.props.trezorSendError}
        onUpdateStep={onUpdateStep}
      />
    );
  }

  _getWalletType(selectedWallet: PublicDeriver<>): 'trezor' | 'ledger' | 'mnemonic' {
    const conceptualWallet = selectedWallet.getParent();

    if (isTrezorTWallet(conceptualWallet)) {
      return 'trezor';
    }
    if (isLedgerNanoWallet(conceptualWallet)) {
      return 'ledger';
    }
    return 'mnemonic';
  }
}
