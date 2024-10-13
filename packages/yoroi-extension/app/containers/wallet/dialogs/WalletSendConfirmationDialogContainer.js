// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
import WalletSendConfirmationDialog from '../../../components/wallet/send/WalletSendConfirmationDialog';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import { addressToDisplayString } from '../../../api/ada/lib/storage/bridge/utils';
import type { ISignRequest } from '../../../api/common/lib/transactions/ISignRequest';
import { genLookupOrFail } from '../../../stores/stateless/tokenHelpers';
import { getNetworkById } from '../../../api/ada/lib/storage/database/prepackaged/networks';

// TODO: unmagic the constants
const MAX_VALUE_BYTES = 5000;
const MAX_TX_BYTES = 16384;

type LocalProps = {|
  +signRequest: ISignRequest<any>,
  +staleTx: boolean,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +openTransactionSuccessDialog: () => void,
|};

type Props = {| ...StoresAndActionsProps, ...LocalProps |};

@observer
export default class WalletSendConfirmationDialogContainer extends Component<Props> {

  componentWillUnmount() {
    this.props.stores.wallets.sendMoneyRequest.reset();
  }

  render(): Node {
    const {
      signRequest,
      unitOfAccountSetting,
      openTransactionSuccessDialog,
    } = this.props;
    const { stores, actions } = this.props;
    const publicDeriver = stores.wallets.selected;

    if (publicDeriver == null)
      throw new Error(`Active wallet required for ${nameof(WalletSendConfirmationDialogContainer)}`);

    const { sendMoneyRequest } = stores.wallets;

    const totalInput = signRequest.totalInput();
    const fee = signRequest.fee();
    const size = signRequest.size?.();
    const fullSize = size ? size.full : 0;
    const maxOutput = size ? Math.max(...size.outputs) : 0;
    const showSize = size != null && (
      size.full > (MAX_TX_BYTES - 1000)
      || maxOutput > (MAX_VALUE_BYTES - 1000)
    );
    const receivers = signRequest.receivers(false);
    return (
      <WalletSendConfirmationDialog
        staleTx={this.props.staleTx}
        selectedExplorer={stores.explorers.selectedExplorer
          .get(
            publicDeriver.networkId
          ) ?? (() => { throw new Error('No explorer for wallet network'); })()
        }
        getTokenInfo={genLookupOrFail(stores.tokenInfoStore.tokenInfo)}
        getCurrentPrice={stores.coinPriceStore.getCurrentPrice}
        amount={totalInput.joinSubtractCopy(fee)}
        receivers={receivers}
        totalAmount={totalInput}
        transactionFee={fee}
        transactionSize={showSize ? `${fullSize}/${MAX_TX_BYTES} (Biggest output: ${maxOutput}/${MAX_VALUE_BYTES})` : null}
        onSubmit={async ({ password }) => {
          await stores.substores.ada.mnemonicSend.sendMoney({
            signRequest,
            password,
            wallet: publicDeriver,
            onSuccess: openTransactionSuccessDialog,
          });
        }}
        isSubmitting={sendMoneyRequest.isExecuting}
        onCancel={() => {
          actions.dialogs.closeActiveDialog.trigger();
          sendMoneyRequest.reset();
        }}
        error={sendMoneyRequest.error}
        unitOfAccountSetting={unitOfAccountSetting}
        addressToDisplayString={
          addr => addressToDisplayString(addr, getNetworkById(publicDeriver.networkId))
        }
      />
    );
  }
}
