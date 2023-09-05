// @flow

import { Component } from 'react';
import type { Node } from 'react';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import Dialog from '../../../components/widgets/Dialog';
import { Box, Typography } from '@mui/material';
import { defineMessages, intlShape } from 'react-intl';
import DialogCloseButton from '../../../components/widgets/DialogCloseButton';
import { action, computed, observable } from 'mobx';
import { isUsingStaticRendering, observer } from 'mobx-react';
import globalMessages from '../../../i18n/global-messages';
import { toSvg } from 'jdenticon';
import styles from './WithdrawRewardsDialog.scss';
import { CopyAddress } from '../../../components/wallet/assets/NFTDetails';
import { addressToDisplayString } from '../../../api/ada/lib/storage/bridge/utils';
import { truncateAddress } from '../../../utils/formatters';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import { getDefaultEntryToken } from '../../../stores/toplevel/TokenInfoStore';
import {
  genFormatTokenAmount,
  genLookupOrFail,
  getTokenName,
} from '../../../stores/stateless/tokenHelpers';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import {
  isLedgerNanoWallet,
  isTrezorTWallet,
} from '../../../api/ada/lib/storage/models/ConceptualWallet';
import { asGetSigningKey } from '../../../api/ada/lib/storage/models/PublicDeriver/traits';
import SpendingPasswordInput from '../../../components/widgets/forms/SpendingPasswordInput';
import VerticallyCenteredLayout from '../../../components/layout/VerticallyCenteredLayout';
import LoadingSpinner from '../../../components/widgets/LoadingSpinner';
import LegacyTransferLayout from '../../../components/transfer/LegacyTransferLayout';

const messages = defineMessages({
  dialogTitle: {
    id: 'wallet.withdrawRewards.transaction.title',
    defaultMessage: '!!!Withdraw reward',
  },
  withdrawalAddress: {
    id: 'wallet.withdrawRewards.transaction.address',
    defaultMessage: '!!!Withdrawal address',
  },
  finalRewards: {
    id: 'wallet.withdrawRewards.transaction.finalRewardsLabel',
    defaultMessage: '!!!Final Rewards',
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

  @observable spendingPasswordForm: void | ReactToolboxMobxForm;

  @action
  setSpendingPasswordForm(form: ReactToolboxMobxForm) {
    this.spendingPasswordForm = form;
  }

  componentWillUnmount() {
    this.generated.stores.wallets.sendMoneyRequest.reset();
    this.generated.stores.substores.ada.delegationTransaction.createWithdrawalTx.reset();
    this.generated.actions.ada.ledgerSend.cancel.trigger();
    this.generated.actions.ada.trezorSend.cancel.trigger();
  }

  submit: void => Promise<void> = async () => {
    const selected = this.generated.stores.wallets.selected;
    if (selected == null) throw new Error(`${nameof(WithdrawRewardsDialog)} no wallet selected`);
    const signRequest = this.generated.stores.substores.ada.delegationTransaction.createWithdrawalTx
      .result;
    if (signRequest == null) return;

    if (this.spendingPasswordForm == null) {
      if (isTrezorTWallet(selected.getParent())) {
        await this.generated.actions.ada.trezorSend.sendUsingTrezor.trigger({
          params: {
            signRequest,
          },
          publicDeriver: selected,
        });
      }
      if (isLedgerNanoWallet(selected.getParent())) {
        await this.generated.actions.ada.ledgerSend.sendUsingLedgerWallet.trigger({
          params: {
            signRequest,
          },
          publicDeriver: selected,
        });
      }
      // if (this.generated.stores.wallets.sendMoneyRequest.error == null) {
      //   this.props.onSubmit.trigger();
      // }
    } else {
      this.spendingPasswordForm.submit({
        onSuccess: async form => {
          const { walletPassword } = form.values();
          await this.generated.actions.wallets.sendMoney.trigger({
            signRequest,
            password: walletPassword,
            publicDeriver: selected,
          });
          // if (this.generated.stores.wallets.sendMoneyRequest.error == null) {
          //   this.props.onSubmit.trigger();
          // }
        },
        onError: () => {},
      });
    }
  };

  getTotalBalance: (
    recoveredBalance: MultiToken,
    fee: MultiToken,
    deregistrations: ?Array<{ +rewardAddress: string, +refund: MultiToken }>
  ) => MultiToken = (recoveredBalance, fee, deregistrations) => {
    const baseTotal = recoveredBalance.joinSubtractCopy(fee);
    if (deregistrations === null) return baseTotal;

    const refundSum = deregistrations.reduce(
      (sum, curr) => (curr.refund == null ? sum : sum.joinAddCopy(curr.refund)),
      new MultiToken([], recoveredBalance.defaults)
    );

    return baseTotal.joinAddCopy(refundSum);
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
    const ticker = getTokenName(defaultToken);
    const formatValue = genFormatTokenAmount(
      genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)
    );

    const tentativeTx = createWithdrawalTx.result;

    if (!tentativeTx)
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
    const receivers = tentativeTx.receivers(true);
    const receiverAddress = addressToDisplayString(receivers[0], network);
    const withdrawals = tentativeTx.withdrawals();
    const deregistrations = tentativeTx.keyDeregistrations();

    const recoveredBalance = withdrawals.reduce(
      (sum, curr) => sum.joinAddCopy(curr.amount),
      new MultiToken([], getDefaultEntryToken(defaultToken))
    );
    const txFee = tentativeTx.fee();
    const finalRewards = this.getTotalBalance(recoveredBalance, txFee, deregistrations);

    const withSigning = asGetSigningKey(publicDeriver);
    const isSubmitting = this.generated.stores.wallets.sendMoneyRequest.isExecuting;
    const error = this.generated.stores.wallets.sendMoneyRequest.error;
    const spendingPasswordForm =
      withSigning == null ? undefined : (
        <SpendingPasswordInput
          setForm={form => this.setSpendingPasswordForm(form)}
          classicTheme={false}
          isSubmitting={isSubmitting}
        />
      );

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitle)}
        actions={[
          {
            label: intl.formatMessage(globalMessages.withdrawLabel),
            onClick: this.submit,
            primary: true,
            disabled:
              isSubmitting ||
              !this.spendingPasswordForm ||
              !this.spendingPasswordForm.values().walletPassword,
          },
        ]}
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

          <Box
            display="flex"
            gap="16px"
            justifyContent="space-between"
            pt="24px"
            mt="28px"
            borderTop="1px solid"
            borderColor="grayscale.200"
          >
            <Box minWidth="180px">
              <Typography variant="body1" color="grayscale.600" mb="4px">
                {intl.formatMessage(globalMessages.rewardsLabel)}
              </Typography>
              <Typography variant="body1" color="grayscale.900">
                {formatValue(recoveredBalance.getDefaultEntry())} {ticker}
              </Typography>
            </Box>
            <Box minWidth="180px">
              <Typography variant="body1" color="grayscale.600" mb="4px">
                {intl.formatMessage(globalMessages.feeLabel)}
              </Typography>
              <Typography variant="body1" color="grayscale.900">
                {formatValue(txFee.getDefaultEntry())} {ticker}
              </Typography>
            </Box>
            <Box minWidth="180px">
              <Typography variant="body1" color="grayscale.600" mb="4px">
                {intl.formatMessage(messages.finalRewards)}
              </Typography>
              <Typography variant="body1" color="grayscale.900">
                {formatValue(finalRewards.getDefaultEntry())} {ticker}
              </Typography>
            </Box>
          </Box>

          <Box mt="24px">{spendingPasswordForm}</Box>
          <Box mt="-27px" pl="8px">
            <Typography variant="caption1" color="magenta.500">
              {error && intl.formatMessage(error, error.values)}
            </Typography>
          </Box>
        </Box>
      </Dialog>
    );
  }

  @computed get generated(): {|
    actions: {|
      ada: {|
        ledgerSend: {|
          sendUsingLedgerWallet: {|
            trigger: (params: {|
              params: SendUsingLedgerParams,
              publicDeriver: PublicDeriver<>,
              onSuccess?: void => void,
            |}) => Promise<void>,
          |},
          cancel: {| trigger: (params: void) => void |},
        |},
        trezorSend: {|
          sendUsingTrezor: {|
            trigger: (params: {|
              params: SendUsingTrezorParams,
              publicDeriver: PublicDeriver<>,
              onSuccess?: void => void,
            |}) => Promise<void>,
          |},
          cancel: {| trigger: (params: void) => void |},
        |},
        wallets: {|
          sendMoney: {|
            trigger: (params: {|
              password: string,
              publicDeriver: PublicDeriver<>,
              signRequest: ISignRequest<any>,
              onSuccess?: void => void,
            |}) => Promise<void>,
          |},
        |},
      |},
    |},
    stores: {|
      tokenInfoStore: {|
        getDefaultTokenInfo: number => $ReadOnly<TokenRow>,
        tokenInfo: TokenInfoMap,
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
      wallets: {|
        selected: null | PublicDeriver<>,
        sendMoneyRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean,
          reset: () => void,
        |},
      |},
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
      actions: {
        wallets: {
          sendMoney: {
            trigger: actions.wallets.sendMoney.trigger,
          },
        },
        ada: {
          ledgerSend: {
            sendUsingLedgerWallet: {
              trigger: actions.ada.ledgerSend.sendUsingLedgerWallet.trigger,
            },
            cancel: {
              trigger: actions.ada.ledgerSend.cancel.trigger,
            },
          },
          trezorSend: {
            sendUsingTrezor: {
              trigger: actions.ada.trezorSend.sendUsingTrezor.trigger,
            },
            cancel: {
              trigger: actions.ada.trezorSend.cancel.trigger,
            },
          },
        },
      },
      stores: {
        profile: {
          selectedNetwork: stores.profile.selectedNetwork,
        },
        tokenInfoStore: {
          getDefaultTokenInfo: stores.tokenInfoStore.getDefaultTokenInfo,
          tokenInfo: stores.tokenInfoStore.tokenInfo,
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
          sendMoneyRequest: {
            reset: stores.wallets.sendMoneyRequest.reset,
            error: stores.wallets.sendMoneyRequest.error,
            isExecuting: stores.wallets.sendMoneyRequest.isExecuting,
          },
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
