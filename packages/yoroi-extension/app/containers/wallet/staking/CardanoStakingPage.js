// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, runInAction } from 'mobx';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';

import DelegationSendForm from '../../../components/wallet/send/DelegationSendForm';
import LocalizableError from '../../../i18n/LocalizableError';
import Dialog from '../../../components/widgets/Dialog';
import { EPOCH_REWARD_DENOMINATOR } from '../../../config/numbersConfig';
import DialogCloseButton from '../../../components/widgets/DialogCloseButton';
import globalMessages from '../../../i18n/global-messages';
import { ReactComponent as InvalidURIImg } from '../../../assets/images/uri/invalid-uri.inline.svg';
import ErrorBlock from '../../../components/widgets/ErrorBlock';
import AnnotatedLoader from '../../../components/transfer/AnnotatedLoader';
import DelegationSuccessDialog from '../../../components/wallet/staking/DelegationSuccessDialog';
import type { PoolMeta, PoolTransition } from '../../../stores/toplevel/DelegationStore';
import DelegationTxDialog from '../../../components/wallet/staking/DelegationTxDialog';
import StakePool from '../../../components/wallet/staking/dashboard/StakePool';
import type { PoolData } from './SeizaFetcher';
import SeizaFetcher from './SeizaFetcher';
import config from '../../../config';
import { handleExternalLinkClick } from '../../../utils/routing';
import { genLookupOrFail, getTokenName } from '../../../stores/stateless/tokenHelpers';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import WalletDelegationBanner from '../WalletDelegationBanner';
import { truncateToken } from '../../../utils/formatters';
import { Box } from '@mui/system';
import { getNetworkById, isTestnet } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import type { StoresProps } from '../../../stores';

type Props = {|
  urlTemplate: ?string,
  poolTransition: ?PoolTransition,
|};

type AllProps = {| ...Props, ...StoresProps |};

type State = {|
  firstPool: PoolData | void,
  selectedPoolId: ?string,
|};

@observer
export default class CardanoStakingPage extends Component<AllProps, State> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };
  state: State = {
    firstPool: undefined,
    selectedPoolId: undefined,
  };
  @observable notificationElementId: string = '';

  cancel: void => void = () => {
    const { stores } = this.props;
    const selectedWallet = stores.wallets.selected;
    stores.delegation.setPoolTransitionConfig(selectedWallet, {
      shouldUpdatePool: false,
      show: 'idle',
    });
    stores.substores.ada.delegationTransaction.reset({ justTransaction: true });
  };

  UNSAFE_componentWillMount(): * {
    const suggestedPoolId = this.props.poolTransition?.suggestedPool?.hash;
    if (suggestedPoolId != null) {
      runInAction(() => {
        this.setState(s =>
          ({ ...s, selectedPoolId: suggestedPoolId }));
      });
    }
  }

  async componentWillUnmount() {
    const { stores } = this.props;
    stores.substores.ada.delegationTransaction.reset({ justTransaction: false });
    stores.delegation.poolInfoQuery.reset();
  }

  render(): null | Node {
    const { urlTemplate } = this.props;

    const selectedWallet = this.props.stores.wallets.selected;
    if (selectedWallet == null) {
      return null;
    }

    const selectedPlate = this.props.stores.wallets.activeWalletPlate;
    const stakingListBias = selectedPlate?.TextPart || 'bias';

    const delegatedPoolId = this.props.stores.delegation.getDelegatedPoolId(
      selectedWallet.publicDeriverId
    );
    if (urlTemplate != null) {
      const totalAda = this._getTotalAda();
      const locale = this.props.stores.profile.currentLocale;

      const balance = selectedWallet.balance;
      const isStakeRegistered = this.props.stores.delegation.isStakeRegistered(
        selectedWallet.publicDeriverId
      );
      const isCurrentlyDelegating = this.props.stores.delegation.isCurrentlyDelegating(selectedWallet.publicDeriverId);
      const isWalletWithNoFunds = balance != null && balance.getDefaultEntry().amount.isZero();
      const poolList = delegatedPoolId != null && isStakeRegistered ? [delegatedPoolId] : [];

      return (
        <>
          {!isCurrentlyDelegating ? (
            <WalletDelegationBanner
              isOpen={this.props.stores.transactions.showDelegationBanner}
              onDelegateClick={async poolId => {
                this.setState({ selectedPoolId: poolId });
                await this.props.stores.delegation.createDelegationTransaction(poolId);
              }}
              poolInfo={this.state.firstPool}
              isWalletWithNoFunds={isWalletWithNoFunds}
              ticker={truncateToken(
                getTokenName(
                  this.props.stores.tokenInfoStore.getDefaultTokenInfo(
                    selectedWallet.networkId
                  )
                )
              )}
              isTestnet={isTestnet(getNetworkById(selectedWallet.networkId))}
            />
          ) : null}

          <Box sx={{ iframe: { minHeight: '60vh' } }}>
            {this.getDialog()}
            <SeizaFetcher
              urlTemplate={urlTemplate}
              locale={locale}
              bias={stakingListBias}
              totalAda={totalAda}
              poolList={poolList}
              setFirstPool={pool => {
                this.setState({ firstPool: pool });
              }}
              stakepoolSelectedAction={async poolId => {
                this.setState({ selectedPoolId: poolId });
                await this.props.stores.delegation.createDelegationTransaction(poolId);
              }}
            />
          </Box>
        </>
      );
    }

    return (
      <div>
        {this.getDialog()}
        <DelegationSendForm
          hasAnyPending={this.props.stores.transactions.hasAnyPending}
          poolQueryError={this.props.stores.delegation.poolInfoQuery.error}
          isProcessing={this.props.stores.delegation.poolInfoQuery.isExecuting}
          updatePool={poolId => {
            this.setState({ selectedPoolId: poolId });
          }}
          onNext={async () => {
            if (this.state.selectedPoolId != null) {
              return this.props.stores.delegation.createDelegationTransaction(this.state.selectedPoolId);
            }
          }}
        />
        {this._displayPoolInfo()}
      </div>
    );
  }

  _getTotalAda: (?MultiToken) => ?number = () => {
    const publicDeriver = this.props.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(CardanoStakingPage)} no public deriver. Should never happen`);
    }

    const { balance } = publicDeriver;
    if (balance == null) {
      return null;
    }
    const delegationStore = this.props.stores.delegation;
    const rewardBalance = delegationStore.getRewardBalanceOrZero(
      publicDeriver
    );
    const tokenInfo = genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)(
      rewardBalance.getDefaultEntry()
    );
    return balance
      .joinAddCopy(rewardBalance)
      .getDefaultEntry()
      .amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals)
      .toNumber();
  };

  _displayPoolInfo: void => void | Node = () => {
    const { intl } = this.context;
    const selectedWallet = this.props.stores.wallets.selected;
    if (selectedWallet == null) return null;

    const selectedPoolInfo = this._getPoolInfo(selectedWallet);
    if (selectedPoolInfo == null) return;

    const tooltipNotification = {
      duration: config.wallets.ADDRESS_COPY_TOOLTIP_NOTIFICATION_DURATION,
      message: globalMessages.copyTooltipMessage,
    };

    const moreInfo =
      selectedPoolInfo.info?.homepage != null
        ? {
            openPoolPage: handleExternalLinkClick,
            url: selectedPoolInfo.info.homepage,
          }
        : undefined;

    return (
      <StakePool
        purpose="delegation"
        poolName={
          selectedPoolInfo.info?.name ?? intl.formatMessage(globalMessages.unknownPoolLabel)
        }
        data={{
          description: selectedPoolInfo.info?.description ?? undefined,
          /* TODO: fill once we know this from the backend */
        }}
        selectedExplorer={
          this.props.stores.explorers.selectedExplorer.get(
            selectedWallet.networkId
          ) ??
          (() => {
            throw new Error('No explorer for wallet network');
          })()
        }
        hash={selectedPoolInfo.poolId}
        moreInfo={moreInfo}
        onCopyAddressTooltip={(address, elementId) => {
          const { uiNotifications } = this.props.stores;
          if (!uiNotifications.isOpen(elementId)) {
            runInAction(() => {
              this.notificationElementId = elementId;
            });
            uiNotifications.open({
              id: elementId,
              duration: tooltipNotification.duration,
              message: tooltipNotification.message,
            });
          }
        }}
        notification={
          this.notificationElementId == null
            ? null
            : this.props.stores.uiNotifications.getTooltipActiveNotification(
                this.notificationElementId
              )
        }
        undelegate={undefined}
      />
    );
  };

  _getPoolInfo: ({ networkId: number, ... }) => void | PoolMeta = publicDeriver => {
    const selectedPoolId = this.state.selectedPoolId;
    return selectedPoolId == null ? undefined
      : this.props.stores.delegation.getLocalPoolInfo(
          publicDeriver.networkId,
          selectedPoolId
        );
  };

  _errorDialog: LocalizableError => Node = error => {
    const { intl } = this.context;
    const dialogBackButton = [
      {
        label: intl.formatMessage(globalMessages.backButtonLabel),
        onClick: this.cancel,
        primary: true,
      },
    ];
    return (
      <Dialog
        title={intl.formatMessage(globalMessages.errorLabel)}
        closeOnOverlayClick={false}
        onClose={this.cancel}
        closeButton={<DialogCloseButton onClose={this.cancel} />}
        dialogActions={dialogBackButton}
      >
        <>
          <center>
            <InvalidURIImg />
          </center>
          <ErrorBlock error={error} />
        </>
      </Dialog>
    );
  };

  getDialog: void => void | Node = () => {
    const { intl } = this.context;
    const { stores } = this.props;
    const { delegationTransaction } = stores.substores.ada;
    const delegationTx = delegationTransaction.createDelegationTx.result;
    const uiDialogs = stores.uiDialogs;

    const selectedWallet = stores.wallets.selected;
    if (selectedWallet == null) {
      return null;
    }

    const networkInfo = getNetworkById(selectedWallet.networkId);
    const currentParams = networkInfo.BaseConfig.reduce(
      (acc, next) => Object.assign(acc, next),
      {}
    );

    const approximateReward = tokenEntry => {
      const tokenRow = stores.tokenInfoStore.tokenInfo
        .get(tokenEntry.networkId.toString())
        ?.get(tokenEntry.identifier);
      if (tokenRow == null)
        throw new Error(
          `${nameof(CardanoStakingPage)} no token info for ${JSON.stringify(tokenEntry)}`
        );

      return {
        amount: tokenEntry.amount
          .times(currentParams.PerEpochPercentageReward)
          .div(EPOCH_REWARD_DENOMINATOR),
        token: tokenRow,
      };
    };

    const showSignDialog =
      stores.wallets.sendMoneyRequest.isExecuting ||
      !stores.wallets.sendMoneyRequest.wasExecuted ||
      stores.wallets.sendMoneyRequest.error != null;

    const selectedPoolInfo = this._getPoolInfo(selectedWallet);
    if (stores.delegation.poolInfoQuery.error != null) {
      return undefined;
    }
    if (stores.delegation.poolInfoQuery.isExecuting) {
      return (
        <Dialog
          title={intl.formatMessage(globalMessages.processingLabel)}
          closeOnOverlayClick={false}
        >
          <AnnotatedLoader
            title={intl.formatMessage(globalMessages.processingLabel)}
            details={intl.formatMessage(globalMessages.poolFetching)}
          />
        </Dialog>
      );
    }
    if (stores.delegation.poolInfoQuery.error != null) {
      return this._errorDialog(stores.delegation.poolInfoQuery.error);
    }
    if (delegationTransaction.createDelegationTx.isExecuting) {
      return (
        <Dialog
          title={intl.formatMessage(globalMessages.processingLabel)}
          closeOnOverlayClick={false}
        >
          <AnnotatedLoader
            title={intl.formatMessage(globalMessages.processingLabel)}
            details={intl.formatMessage(globalMessages.txGeneration)}
          />
        </Dialog>
      );
    }
    if (delegationTransaction.createDelegationTx.error != null) {
      return this._errorDialog(delegationTransaction.createDelegationTx.error);
    }
    const selectedPoolId = this.state.selectedPoolId;
    if (delegationTx != null && selectedPoolId != null && showSignDialog) {
      // may happen for a split second before backend query starts
      if (selectedPoolInfo == null) return null;
      return (
        <DelegationTxDialog
          staleTx={delegationTransaction.isStale}
          poolName={
            selectedPoolInfo.info?.name ?? intl.formatMessage(globalMessages.unknownPoolLabel)
          }
          poolHash={selectedPoolId}
          transactionFee={delegationTx.signTxRequest.fee()}
          amountToDelegate={delegationTx.totalAmountToDelegate}
          approximateReward={approximateReward(
            delegationTx.totalAmountToDelegate.getDefaultEntry()
          )}
          getTokenInfo={genLookupOrFail(stores.tokenInfoStore.tokenInfo)}
          isSubmitting={stores.wallets.sendMoneyRequest.isExecuting}
          isHardware={selectedWallet.type !== 'mnemonic'}
          onCancel={this.cancel}
          onSubmit={async ({ password }) => {
            await stores.substores.ada.delegationTransaction.signTransaction({
              password,
              wallet: selectedWallet,
              dialog: DelegationSuccessDialog,
            });
          }}
          error={stores.wallets.sendMoneyRequest.error}
          selectedExplorer={
            stores.explorers.selectedExplorer.get(
              selectedWallet.networkId
            ) ??
            (() => {
              throw new Error('No explorer for wallet network');
            })()
          }
        />
      );
    }
    if (uiDialogs.isOpen(DelegationSuccessDialog)) {
      return (
        <DelegationSuccessDialog
          onClose={() => stores.substores.ada.delegationTransaction.complete()}
        />
      );
    }
    return undefined;
  };
}
