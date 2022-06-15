// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import type { InjectedOrGenerated } from '../../../../types/injectedPropsType';
import WalletSendPreviewStep from './WalletSendPreviewStep';
import type { UnitOfAccountSettingType } from '../../../../types/unitOfAccountType';
import LocalizableError from '../../../../i18n/LocalizableError';
import { PublicDeriver } from '../../../../api/ada/lib/storage/models/PublicDeriver/index';
import { SelectedExplorer } from '../../../../domain/SelectedExplorer';
import { addressToDisplayString } from '../../../../api/ada/lib/storage/bridge/utils';
import type { ISignRequest } from '../../../../api/common/lib/transactions/ISignRequest';
import type { TokenInfoMap } from '../../../../stores/toplevel/TokenInfoStore';
import { genLookupOrFail } from '../../../../stores/stateless/tokenHelpers';

export type GeneratedData = typeof WalletSendPreviewStepContainer.prototype.generated;

// TODO: unmagic the constants
const MAX_VALUE_BYTES = 5000;
const MAX_TX_BYTES = 16384;

type DialogProps = {|
  +signRequest: ISignRequest<any>,
  +staleTx: boolean,
  +unitOfAccountSetting: UnitOfAccountSettingType,
|};
type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  ...DialogProps,
  +openTransactionSuccessDialog: () => void,
|};

@observer
export default class WalletSendPreviewStepContainer extends Component<Props> {

  componentWillUnmount() {
    this.generated.stores.wallets.sendMoneyRequest.reset();
  }

  render(): Node {
    const {
      signRequest,
      unitOfAccountSetting,
      openTransactionSuccessDialog,
    } = this.props;
    const { stores, actions } = this.generated;
    const publicDeriver = stores.wallets.selected;
    const { profile } = stores;

    if (publicDeriver == null) throw new Error(`Active wallet required for ${nameof(WalletSendPreviewStepContainer)}`);

    const { sendMoney } = actions.wallets;
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
      <WalletSendPreviewStep
        staleTx={this.props.staleTx}
        selectedExplorer={stores.explorers.selectedExplorer
          .get(
            publicDeriver.getParent().getNetworkInfo().NetworkId
          ) ?? (() => { throw new Error('No explorer for wallet network'); })()
        }
        getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
        getCurrentPrice={this.generated.stores.coinPriceStore.getCurrentPrice}
        amount={totalInput.joinSubtractCopy(fee)}
        receivers={receivers}
        totalAmount={totalInput}
        transactionFee={fee}
        transactionSize={showSize ? `${fullSize}/${MAX_TX_BYTES} (Biggest output: ${maxOutput}/${MAX_VALUE_BYTES})` : null}
        onSubmit={async ({ password }) => {
          await sendMoney.trigger({
            signRequest,
            password,
            publicDeriver,
            onSuccess: openTransactionSuccessDialog,
          });
        }}
        isSubmitting={sendMoneyRequest.isExecuting}
        classicTheme={profile.isClassicTheme}
        unitOfAccountSetting={unitOfAccountSetting}
        addressToDisplayString={
          addr => addressToDisplayString(addr, publicDeriver.getParent().getNetworkInfo())
        }
        selectedNetwork={publicDeriver.getParent().getNetworkInfo()}
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
            onSuccess?: void => void,
          |}) => Promise<void>
        |},
      |},
      dialogs: {|
        closeActiveDialog: {|
          trigger: (params: void) => void
        |}
      |}
    |},
    stores: {|
      coinPriceStore: {|
        getCurrentPrice: (
          from: string,
          to: string
        ) => ?string,
      |},
      explorers: {|
        selectedExplorer: Map<number, SelectedExplorer>,
      |},
      tokenInfoStore: {|
        tokenInfo: TokenInfoMap,
      |},
      profile: {|
        isClassicTheme: boolean,
      |},
      wallets: {|
        sendMoneyRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean,
          reset: () => void
        |},
        selected: null | PublicDeriver<>
      |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(WalletSendPreviewStepContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        explorers: {
          selectedExplorer: stores.explorers.selectedExplorer,
        },
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
        },
        tokenInfoStore: {
          tokenInfo: stores.tokenInfoStore.tokenInfo,
        },
        coinPriceStore: {
          getCurrentPrice: stores.coinPriceStore.getCurrentPrice,
        },
        wallets: {
          selected: stores.wallets.selected,
          sendMoneyRequest: {
            isExecuting: stores.wallets.sendMoneyRequest.isExecuting,
            reset: stores.wallets.sendMoneyRequest.reset,
            error: stores.wallets.sendMoneyRequest.error,
          },
        },
      },
      actions: {
        dialogs: {
          closeActiveDialog: {
            trigger: actions.dialogs.closeActiveDialog.trigger,
          },
        },
        wallets: {
          sendMoney: {
            trigger: actions.wallets.sendMoney.trigger,
          },
        },
      },
    });
  }
}
