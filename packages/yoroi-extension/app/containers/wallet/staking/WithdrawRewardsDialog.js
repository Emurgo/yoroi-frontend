// @flow

import { Component } from 'react';
import type { Node } from 'react';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import Dialog from '../../../components/widgets/Dialog';
import { Box, Typography } from '@mui/material';
import { defineMessages, intlShape } from 'react-intl';
import DialogCloseButton from '../../../components/widgets/DialogCloseButton';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import globalMessages from '../../../i18n/global-messages';
import { toSvg } from 'jdenticon';
import styles from './WithdrawRewardsDialog.scss';
import { CopyAddress } from '../../../components/wallet/assets/NFTDetails';
import { addressToDisplayString } from '../../../api/ada/lib/storage/bridge/utils';
import { truncateAddress } from '../../../utils/formatters';

const messages = defineMessages({
  dialogTitle: {
    id: 'wallet.withdrawRewards.transaction.title',
    defaultMessage: '!!!Withdraw reward',
  },
  withdrawalAddress: {
    id: 'wallet.withdrawRewards.transaction.address',
    defaultMessage: '!!!Withdrawal address',
  },
});

export type GeneratedData = typeof WithdrawRewardsDialog.prototype.generated;

type Props = {
  ...InjectedOrGenerated<GeneratedData>,
  +onClose: void => void,
};

@observer
export default class WithdrawRewardsDialog extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    const publicDeriver = this.generated.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(WithdrawRewardsDialog)} no public deriver. Should never happen`);
    }

    const delegationStore = this.generated.stores.delegation;
    const delegationRequests = delegationStore.getDelegationRequests(publicDeriver);

    if (delegationRequests == null) {
      throw new Error(`${nameof(WithdrawRewardsDialog)} opened for non-reward wallet`);
    }

    if (
      !delegationRequests.getCurrentDelegation.wasExecuted ||
      delegationRequests.getCurrentDelegation.isExecuting ||
      delegationRequests.getCurrentDelegation.result == null
    ) {
      return null;
    }

    if (delegationRequests.getCurrentDelegation.result.currEpoch == null) return null;

    const currentPools = delegationRequests.getCurrentDelegation.result.currEpoch.pools;
    const currentPage = this.generated.stores.delegation.selectedPage;

    if (currentPools.length === 0) return null;

    const currentPool = currentPools[0][currentPage];
    const network = publicDeriver.getParent().getNetworkInfo();
    const meta = this.generated.stores.delegation.getLocalPoolInfo(network, String(currentPool));
    if (meta == null) {
      // server hasn't returned information about the stake pool yet
      return null;
    }
    const name = meta.info?.name ?? intl.formatMessage(globalMessages.unknownPoolLabel);
    const avatarSource = toSvg(currentPool, 36, { padding: 0 });
    const avatarGenerated = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSource)}`;

    const {
      createWithdrawalTx,
      shouldDeregister,
    } = this.generated.stores.substores.ada.delegationTransaction;

    if (this.generated.stores.profile.selectedNetwork == null) {
      throw new Error(`${nameof(WithdrawRewardsDialog)} no selected network`);
    }
    const defaultToken = this.generated.stores.tokenInfoStore.getDefaultTokenInfo(
      this.generated.stores.profile.selectedNetwork.NetworkId
    );

    const tentativeTx = createWithdrawalTx.result;

    if (!tentativeTx) return 'no tx...';
    const receivers = tentativeTx.receivers(true);
    const receiverAddress = addressToDisplayString(receivers[0], network);

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitle)}
        closeOnOverlayClick={false}
        onClose={this.props.onClose}
        closeButton={<DialogCloseButton />}
        className={styles.dialog}
      >
        <Box>
          <Box mb="16px">
            <Typography variant="body1" color="grayscale.600">
              {intl.formatMessage(globalMessages.stakePoolChecksumAndName)}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                mt: '4px',
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'inline-block',
                  }}
                  component="img"
                  src={avatarGenerated}
                />
              </Box>
              <Typography variant="body1" color="grayscale.900">
                {name}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography variant="body1" color="grayscale.600">
              {intl.formatMessage(globalMessages.stakePoolHash)}
            </Typography>
            <Typography variant="body1" color="grayscale.900">
              <CopyAddress text={currentPool}>{currentPool}</CopyAddress>
            </Typography>
          </Box>
          <Box>
            <Typography variant="body1" color="grayscale.600">
              {intl.formatMessage(messages.withdrawalAddress)}
            </Typography>
            <Typography variant="body1" color="grayscale.900">
              <CopyAddress text={receiverAddress}>{truncateAddress(receiverAddress)}</CopyAddress>
            </Typography>
          </Box>
        </Box>
      </Dialog>
    );
  }

  @computed get generated(): {|
    stores: {|
      tokenInfoStore: {|
        getDefaultTokenInfo: number => $ReadOnly<TokenRow>,
      |},
      profile: {| selectedNetwork: void | $ReadOnly<NetworkRow> |},
      substores: {|
        ada: {|
          delegationTransaction: {|
            createWithdrawalTx: {|
              reset: void => void,
              error: ?LocalizableError,
              result: ?ISignRequest<any>,
            |},
            shouldDeregister: boolean,
          |},
        |},
      |},
      wallets: {| selected: null | PublicDeriver<> |},
      delegation: {|
        selectedPage: number,
        getLocalPoolInfo: ($ReadOnly<NetworkRow>, string) => void | PoolMeta,
        getDelegationRequests: (PublicDeriver<>) => void | DelegationRequests,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(WithdrawRewardsDialog)} no way to generated props`);
    }
    const { stores, actions } = this.props;

    return Object.freeze({
      stores: {
        profile: {
          selectedNetwork: stores.profile.selectedNetwork,
        },
        tokenInfoStore: {
          getDefaultTokenInfo: stores.tokenInfoStore.getDefaultTokenInfo,
        },
        substores: {
          ada: {
            delegationTransaction: {
              createWithdrawalTx: {
                error: stores.substores.ada.delegationTransaction.createWithdrawalTx.error,
                result: stores.substores.ada.delegationTransaction.createWithdrawalTx.result,
                reset: stores.substores.ada.delegationTransaction.createWithdrawalTx.reset,
              },
              shouldDeregister: stores.substores.ada.delegationTransaction.shouldDeregister,
            },
          },
        },
        wallets: {
          selected: stores.wallets.selected,
        },
        delegation: {
          selectedPage: stores.delegation.selectedPage,
          getLocalPoolInfo: stores.delegation.getLocalPoolInfo,
          getDelegationRequests: stores.delegation.getDelegationRequests,
        },
      },
    });
  }
}
