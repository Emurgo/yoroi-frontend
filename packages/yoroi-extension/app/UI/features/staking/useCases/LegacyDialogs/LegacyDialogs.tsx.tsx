import { maybe, useStaking } from '../../module/StakingContextProvider';
import OverviewModal from '../../../../../components/wallet/staking/dashboard-revamp/OverviewDialog';
import { generateGraphData } from '../../common/helpers/graph';
import { GovernanceParticipateDialog } from '../../../../../containers/wallet/dialogs/GovernanceParticipateDialog';
import UnmangleTxDialogContainer from '../../../../../containers/transfer/UnmangleTxDialogContainer';
import RewardHistoryDialog from '../../../../../components/wallet/staking/dashboard-revamp/RewardHistoryDialog';
import { observer } from 'mobx-react';

export const LegacyDialogs = observer(() => {
  const { legacyUIDialogs, stores, totalRewards, toUnitOfAccount, delegationRequests, selectedWallet } = useStaking();
  const errorIfPresent = maybe(delegationRequests.error, error => ({ error }));

  const showRewardAmount = errorIfPresent == null && stores.delegation.isExecutedDelegatedBalance(selectedWallet.publicDeriverId);
  const isParticipatingToGovernance = stores.delegation.governanceStatus?.drepDelegation !== null;
  const isStakeRegistered = stores.delegation.isStakeRegistered(selectedWallet.publicDeriverId);

  const onClose = () => {
    legacyUIDialogs.closeActiveDialog();
  };

  return (
    <div>
      {legacyUIDialogs.isOpen(OverviewModal) ? (
        <OverviewModal
          onClose={onClose}
          getTokenInfo={genLookupOrFail(stores.tokenInfoStore.tokenInfo)}
          totalRewards={showRewardAmount ? totalRewards : undefined}
          shouldHideBalance={stores.profile.shouldHideBalance}
          unitOfAccount={toUnitOfAccount}
          withdrawRewards={
            isParticipatingToGovernance === false
              ? () => {
                  legacyUIDialogs.open({
                    dialog: GovernanceParticipateDialog,
                  });
                }
              : isStakeRegistered
                ? () => {
                    legacyUIDialogs.open({
                      dialog: GovernanceParticipateDialog,
                    });
                  }
                : undefined
          }
        />
      ) : null}
      {legacyUIDialogs.isOpen(GovernanceParticipateDialog) ? (
        <GovernanceParticipateDialog stores={stores} onClose={onClose} />
      ) : null}
      {legacyUIDialogs.isOpen(UnmangleTxDialogContainer) ? <UnmangleTxDialogContainer stores={stores} onClose={onClose} /> : null}
      {legacyUIDialogs.isOpen(RewardHistoryDialog) ? (
        <RewardHistoryDialog
          onClose={onClose}
          graphData={generateGraphData({
            delegationRequests,
            currentEpoch: stores.substores.ada.time.getCurrentTimeRequests(selectedWallet).currentEpoch,
            shouldHideBalance: stores.profile.shouldHideBalance,
            getLocalPoolInfo: stores.delegation.getLocalPoolInfo,
            tokenInfo: stores.tokenInfoStore.tokenInfo,
            networkId: selectedWallet.networkId,
            defaultTokenId: selectedWallet.defaultTokenId,
          })}
        />
      ) : null}
    </div>
  );
});

export const genLookupOrFail = map => lookup => {
  const tokenRow = map.get(lookup.networkId.toString())?.get(lookup.identifier);

  if (tokenRow == null) {
    throw new Error(`genLookupOrFail: no token info for ${JSON.stringify(lookup)}`);
  }

  return tokenRow;
};
