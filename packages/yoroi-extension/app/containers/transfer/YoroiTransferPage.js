// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, } from 'react-intl';
import validWords from 'bip39/src/wordlists/english.json';
import type { StoresAndActionsProps } from '../../types/injectedPropsType';
import TransferSummaryPage from '../../components/transfer/TransferSummaryPage';
import YoroiPaperWalletFormPage from './YoroiPaperWalletFormPage';
import YoroiPlatePage from './YoroiPlatePage';
import YoroiTransferWaitingPage from './YoroiTransferWaitingPage';
import YoroiTransferErrorPage from './YoroiTransferErrorPage';
import YoroiTransferSuccessPage from './YoroiTransferSuccessPage';
import config from '../../config';
import { TransferStatus, } from '../../types/TransferTypes';
import { ROUTES } from '../../routes-config';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { ApiOptions, getApiForNetwork, } from '../../api/common/utils';
import { addressToDisplayString, } from '../../api/ada/lib/storage/bridge/utils';
import { ChainDerivations } from '../../config/numbersConfig';
import WithdrawalTxDialogContainer from './WithdrawalTxDialogContainer';
import { genAddressLookup } from '../../stores/stateless/addressStores';
import {
  Bip44DerivationLevels,
} from '../../api/ada/lib/storage/database/walletTypes/bip44/api/utils';
import { genLookupOrFail } from '../../stores/stateless/tokenHelpers';

// Stay this long on the success page, then jump to the wallet transactions page
const SUCCESS_PAGE_STAY_TIME = 5 * 1000;

@observer
export default class YoroiTransferPage extends Component<StoresAndActionsProps> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  goToCreateWallet: void => void = () => {
    this.props.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
  }

  setupTransferFundsWithPaperMnemonic: ((payload: {|
    paperPassword: string,
    recoveryPhrase: string,
  |}) => void) = (payload) => {
    this.props.actions.yoroiTransfer.setupTransferFundsWithPaperMnemonic.trigger({
      ...payload,
    });
  };

  checkAddresses: void => Promise<void> = async () => {
    const walletsStore = this.props.stores.wallets;
    const yoroiTransfer = this.props.stores.yoroiTransfer;
    const publicDeriver = walletsStore.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(this.checkAddresses)} no wallet selected`);
    }
    await this.props.actions.yoroiTransfer.checkAddresses.trigger({
      getDestinationAddress: yoroiTransfer.nextInternalAddress(publicDeriver),
    });
  };

  /** Broadcast the transfer transaction if one exists and return to wallet page */
  transferFunds: void => Promise<void> = async () => {
    // broadcast transfer transaction then call continuation
    const walletsStore = this.props.stores.wallets;
    const yoroiTransfer = this.props.stores.yoroiTransfer;
    const publicDeriver = this.props.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(this.transferFunds)} no wallet selected`);
    }
    await this.props.actions.yoroiTransfer.transferFunds.trigger({
      network: publicDeriver.getParent().getNetworkInfo(),
      next: async () => {
        const preRefreshTime = new Date().getTime();
        try {
          await walletsStore.refreshWalletFromRemote(publicDeriver);
        } catch (_e) {
          // still need to re-route even if refresh failed
        }
        const timeToRefresh = (new Date().getTime()) - preRefreshTime;
        await new Promise(resolve => {
          setTimeout(() => {
            if (walletsStore.selected != null) {
              this.props.actions.router.goToRoute.trigger({
                route: ROUTES.WALLETS.TRANSACTIONS
              });
            }
            resolve();
          }, Math.max(SUCCESS_PAGE_STAY_TIME - timeToRefresh, 0));
        });
      },
      getDestinationAddress: yoroiTransfer.nextInternalAddress(publicDeriver),
      rebuildTx: true,
    });
  }

  backToUninitialized: (() => void) = () => {
    this.props.actions.yoroiTransfer.backToUninitialized.trigger();
  };

  cancelTransferFunds: (() => void) = () => {
    this.props.actions.yoroiTransfer.cancelTransferFunds.trigger();
  };

  render(): null | Node {
    const { actions, stores } = this.props;
    const { profile } = stores;
    const yoroiTransfer = this.props.stores.yoroiTransfer;

    const publicDeriver = this.props.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(this.checkAddresses)} no wallet selected`);
    }
    const api = getApiForNetwork(publicDeriver.getParent().getNetworkInfo());
    if (api !== ApiOptions.ada) {
      throw new Error(`${nameof(YoroiTransferPage)} not ADA API type`);
    }

    switch (yoroiTransfer.status) {
      case TransferStatus.GETTING_PAPER_MNEMONICS:
        return (
          <YoroiPaperWalletFormPage
            onSubmit={this.setupTransferFundsWithPaperMnemonic}
            onBack={this.backToUninitialized}
            mnemonicValidator={mnemonic => this.props.stores.walletRestore.isValidMnemonic({
              mnemonic,
              mode: { type: 'bip44', extra: 'paper', length: config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT },
            })}
            validWords={validWords}
            mnemonicLength={config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT}
            passwordMatches={_password => true}
            includeLengthCheck={false}
            classicTheme={profile.isClassicTheme}
          />
        );
      case TransferStatus.DISPLAY_CHECKSUM:
        return (
          <YoroiPlatePage
            actions={actions}
            stores={stores}
            onNext={this.checkAddresses}
            onCancel={this.backToUninitialized}
            accountIndex={this.props.stores.walletRestore.selectedAccount}
          />
        );
      case TransferStatus.RESTORING_ADDRESSES:
      case TransferStatus.CHECKING_ADDRESSES:
      case TransferStatus.GENERATING_TX:
        return (
          <YoroiTransferWaitingPage status={yoroiTransfer.status} />
        );
      case TransferStatus.READY_TO_TRANSFER: {
        if (yoroiTransfer.transferTx == null) {
          return null; // TODO: throw error? Shouldn't happen
        }
        const { transferTx } = yoroiTransfer;
        const { intl } = this.context;
        if (this.props.stores.yoroiTransfer.mode == null) {
          throw new Error(`${nameof(YoroiTransferPage)} unknown mode`);
        }
        const { mode } = this.props.stores.yoroiTransfer;
        if (
          mode.chain === ChainDerivations.CHIMERIC_ACCOUNT ||
          mode.derivationLevel === Bip44DerivationLevels.ADDRESS.level
        ) {
          return (
            <WithdrawalTxDialogContainer
              actions={actions}
              stores={stores}
              onClose={this.cancelTransferFunds}
            />
          );
        }
        return (
          <TransferSummaryPage
            form={null}
            transferTx={transferTx}
            selectedExplorer={this.props.stores.explorers.selectedExplorer
              .get(publicDeriver.getParent().getNetworkInfo().NetworkId) ?? (() => { throw new Error('No explorer for wallet network'); })()
            }
            getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
            onSubmit={{
              label: intl.formatMessage(globalMessages.nextButtonLabel),
              trigger: this.transferFunds,
            }}
            isSubmitting={stores.wallets.sendMoneyRequest.isExecuting}
            onCancel={{
              label: intl.formatMessage(globalMessages.cancel),
              trigger: this.cancelTransferFunds
            }}
            error={yoroiTransfer.error}
            dialogTitle={intl.formatMessage(globalMessages.walletSendConfirmationDialogTitle)}
            getCurrentPrice={this.props.stores.coinPriceStore.getCurrentPrice}
            addressLookup={genAddressLookup(
              publicDeriver,
              intl,
              undefined, // don't want to go to route from within a dialog
              this.props.stores.addresses.addressSubgroupMap,
            )}
            unitOfAccountSetting={stores.profile.unitOfAccount}
            addressToDisplayString={
              addr => addressToDisplayString(addr, publicDeriver.getParent().getNetworkInfo())
            }
          />
        );
      }
      case TransferStatus.ERROR:
        return (
          <YoroiTransferErrorPage
            error={yoroiTransfer.error}
            onCancel={this.cancelTransferFunds}
            classicTheme={profile.isClassicTheme}
          />
        );
      case TransferStatus.SUCCESS:
        return (
          <YoroiTransferSuccessPage
            classicTheme={profile.isClassicTheme}
          />
        );
      default:
        return null;
    }
  }
}
