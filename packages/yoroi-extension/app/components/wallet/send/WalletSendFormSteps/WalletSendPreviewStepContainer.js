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
import { getNetworkById } from '../../../../api/ada/lib/storage/database/prepackaged/networks';
import type { WalletState } from '../../../../../chrome/extension/background/types';
import { HaskellShelleyTxSignRequest } from '../../../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';

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
  +isSending: boolean,
  selectedExplorer: Map<number, SelectedExplorer>,
  +selectedWallet: WalletState,
  +onSubmit: ({| password: string |}) => Promise<void>,
|};

@observer
export default class WalletSendPreviewStepContainer extends Component<Props> {
  render(): Node {
    const {
      signRequest,
      unitOfAccountSetting,
      onUpdateStep,
      selectedWallet,
      selectedExplorer,
      isSending,
      getTokenInfo,
      getCurrentPrice,
      onSubmit,
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
    const network = getNetworkById(selectedWallet.networkId);

    const receiverWithHandle = signRequest instanceof HaskellShelleyTxSignRequest
      ? signRequest.receiverWithHandle()
      : null;
    const receiver = {
      address: receiverWithHandle?.address ?? signRequest.receivers(false)[0],
      handle: receiverWithHandle?.handle,
    }

    return (
      <WalletSendPreviewStep
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
        receiver={receiver}
        totalAmount={totalInput}
        transactionFee={fee}
        transactionSize={
          showSize
            ? `${fullSize}/${MAX_TX_BYTES} (Biggest output: ${maxOutput}/${MAX_VALUE_BYTES})`
            : null
        }
        onSubmit={onSubmit}
        isSubmitting={isSending}
        unitOfAccountSetting={unitOfAccountSetting}
        addressToDisplayString={addr => addressToDisplayString(addr, network)}
        selectedNetwork={network}
        isDefaultIncluded={this.props.isDefaultIncluded}
        plannedTxInfoMap={this.props.plannedTxInfoMap}
        minAda={this.props.minAda}
        walletType={selectedWallet.type}
        onUpdateStep={onUpdateStep}
      />
    );
  }
}
