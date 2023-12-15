// @flow

import type { Node } from 'react';
import { Component } from 'react';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { defineMessages, intlShape } from 'react-intl';
import { Box, Typography } from '@mui/material';
import DialogCloseButton from '../../../components/widgets/DialogCloseButton';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import globalMessages from '../../../i18n/global-messages';
import { toSvg } from 'jdenticon';
import { CopyAddress } from '../../../components/wallet/assets/NFTDetails';
import { addressToDisplayString } from '../../../api/ada/lib/storage/bridge/utils';
import { truncateAddress } from '../../../utils/formatters';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import type { TokenInfoMap } from '../../../stores/toplevel/TokenInfoStore';
import { getDefaultEntryToken } from '../../../stores/toplevel/TokenInfoStore';
import type { DelegationRequests, PoolMeta } from '../../../stores/toplevel/DelegationStore';
import type { NetworkRow, TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import type { ISignRequest } from '../../../api/common/lib/transactions/ISignRequest';
import type { SelectedExplorer } from '../../../domain/SelectedExplorer';
import type { SendUsingTrezorParams } from '../../../actions/ada/trezor-send-actions';
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
import YoroiTransferErrorPage from '../../transfer/YoroiTransferErrorPage';
import ExplorableHashContainer from '../../widgets/ExplorableHashContainer';
import RawHash from '../../../components/widgets/hashWrappers/RawHash';
import Warning from '../../../components/common/Warning';
import Dialog from '../../../components/widgets/Dialog';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver';
import type { SendUsingLedgerParams } from '../../../actions/ada/ledger-send-actions';
import LocalizableError from '../../../i18n/LocalizableError';
import type { CreateWithdrawalTxResponse } from '../../../api/ada';

const messages = defineMessages({
  dialogTitle: {
    id: 'wallet.withdrawRewards.transaction.title',
    defaultMessage: '!!!Withdraw reward',
  },
  withdrawalAddress: {
    id: 'wallet.withdrawRewards.transaction.address',
    defaultMessage: '!!!Withdrawal address',
  },
  accumulatedRewards: {
    id: 'wallet.withdrawRewards.transaction.accumulatedRewards',
    defaultMessage: '!!!Accumulated Rewards',
  },
  deregistrationWarning: {
    id: 'wallet.undelegation.transaction.warning',
    defaultMessage:
      '!!!Your rewards will automatically get withdrawn once you undelegate from a stake pool. You will also receive back your staking deposit of 2 ADA. If you wish to choose another stake pool, you can change your preference without undelegation.',
  },
  undelegateAnyway: {
    id: 'wallet.undelegation.transaction.button.label',
    defaultMessage: '!!!Undelegate anyway',
  },
});

export type GeneratedData = typeof WithdrawRewardsDialog.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onClose: void => void,
|};

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
    } else {
      this.spendingPasswordForm.submit({
        onSuccess: async form => {
          const { walletPassword } = form.values();
          await this.generated.actions.wallets.sendMoney.trigger({
            signRequest,
            password: walletPassword,
            publicDeriver: selected,
          });
        },
        onError: () => {},
      });
    }
  };

  getTotalBalance: (
    recoveredBalance: MultiToken,
    fee: MultiToken,
    deregistrations: ?Array<{| +rewardAddress: string, +refund: MultiToken |}>
  ) => MultiToken = (recoveredBalance, fee, deregistrations) => {
    const baseTotal = recoveredBalance.joinSubtractCopy(fee);
    if (deregistrations == null) return baseTotal;

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
      !delegationRequests.getDelegatedBalance.wasExecuted ||
      delegationRequests.getDelegatedBalance.isExecuting ||
      delegationRequests.getDelegatedBalance.result == null
    ) {
      return null;
    }

    const currentPool = delegationRequests.getDelegatedBalance.result.delegation;
    if (currentPool == null) return null;

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

    if (createWithdrawalTx.error != null)
      return (
        <YoroiTransferErrorPage
          error={createWithdrawalTx.error}
          onCancel={this.props.onClose}
          classicTheme={false}
        />
      );

    const tentativeTx = createWithdrawalTx.result;
    if (!tentativeTx)
      return (
        <Dialog
          title={intl.formatMessage(globalMessages.processingLabel)}
          closeOnOverlayClick={false}
        >
          <Box width="350px">
            <LegacyTransferLayout>
              <VerticallyCenteredLayout>
                <LoadingSpinner />
              </VerticallyCenteredLayout>
            </LegacyTransferLayout>
          </Box>
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

    const selectedExplorer = this.generated.stores.explorers.selectedExplorer.get(
      publicDeriver.getParent().getNetworkInfo().NetworkId
    );
    if (!selectedExplorer) throw new Error('No explorer for wallet network');

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitle)}
        actions={[
          {
            label: intl.formatMessage(globalMessages.cancel),
            onClick: this.props.onClose,
          },
          {
            label: intl.formatMessage(
              shouldDeregister ? messages.undelegateAnyway : globalMessages.confirm
            ),
            onClick: this.submit,
            primary: true,
            isSubmitting,
          },
        ]}
        closeOnOverlayClick={false}
        onClose={this.props.onClose}
        closeButton={<DialogCloseButton />}
        scrollableContentClass="WithdrawRewards"
        styleOverride={{ width: '648px' }}
      >
        <Box className="WithdrawRewards" overflowY="auto" maxHeight="70vh" maxWidth="604px">
          {shouldDeregister && (
            <Box mb="24px">
              <Warning>
                <Typography component="div" variant="body1">
                  {intl.formatMessage(messages.deregistrationWarning)}
                </Typography>
              </Warning>
            </Box>
          )}
          <Box mb="16px" px="5px">
            <Typography component="div" variant="body1" color="grayscale.600">
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
              <Typography component="div" variant="body1" color="grayscale.900">
                {name}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography component="div" variant="body1" color="grayscale.600" px="4px">
              {intl.formatMessage(globalMessages.stakePoolHash)}
            </Typography>
            <Typography component="div" variant="body1" sx={{ '& > div > p': { p: '2px 3px' }, px: '2px' }}>
              <CopyAddress text={currentPool}>
                <ExplorableHashContainer
                  selectedExplorer={selectedExplorer}
                  hash={currentPool}
                  light
                  primary
                  linkType="pool"
                  placementTooltip="top"
                >
                  <RawHash light primary>
                    {currentPool}
                  </RawHash>
                </ExplorableHashContainer>
              </CopyAddress>
            </Typography>
          </Box>
          <Box>
            <Typography component="div" variant="body1" color="grayscale.600" px="5px">
              {intl.formatMessage(messages.withdrawalAddress)}
            </Typography>
            <Typography component="div" variant="body1" sx={{ '& > div > p': { p: '2px 3px' }, px: '2px' }}>
              <CopyAddress text={receiverAddress}>
                <ExplorableHashContainer
                  selectedExplorer={selectedExplorer}
                  hash={receiverAddress}
                  light
                  primary
                  linkType="address"
                >
                  <RawHash light primary>
                    {truncateAddress(receiverAddress)}
                  </RawHash>
                </ExplorableHashContainer>
              </CopyAddress>
            </Typography>
          </Box>

          <Box
            display="flex"
            gap="16px"
            justifyContent="space-between"
            pt="24px"
            mt="28px"
            mx="5px"
            borderTop="1px solid"
            borderColor="grayscale.200"
          >
            <Box minWidth="180px">
              <Typography component="div" variant="body1" color="grayscale.600" mb="4px">
                {intl.formatMessage(messages.accumulatedRewards)}
              </Typography>
              <Typography component="div" variant="body1" color="grayscale.900">
                {formatValue(recoveredBalance.getDefaultEntry())} {ticker}
              </Typography>
            </Box>
            <Box minWidth="180px">
              <Typography component="div" variant="body1" color="grayscale.600" mb="4px">
                {intl.formatMessage(globalMessages.feeLabel)}
              </Typography>
              <Typography component="div" variant="body1" color="grayscale.900">
                {formatValue(txFee.getDefaultEntry())} {ticker}
              </Typography>
            </Box>
            <Box minWidth="180px">
              <Typography component="div" variant="body1" color="grayscale.600" mb="4px">
                {intl.formatMessage(globalMessages.finalBalanceLabel)}
              </Typography>
              <Typography component="div" variant="body1" color="grayscale.900">
                {formatValue(finalRewards.getDefaultEntry())} {ticker}
              </Typography>
            </Box>
          </Box>

          <Box mt="24px" mx="5px">
            {spendingPasswordForm}
          </Box>
          {error ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: '2px',
              }}
            >
              <Typography component="div" variant="caption1" color="magenta.500">
                {intl.formatMessage(error, error.values)}
              </Typography>
            </Box>
          ) : null}
        </Box>
      </Dialog>
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
          |}) => Promise<void>,
        |},
      |},
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
      |},
    |},
    stores: {|
      explorers: {|
        selectedExplorer: Map<number, SelectedExplorer>,
      |},
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
              result: ?CreateWithdrawalTxResponse,
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
        explorers: {
          selectedExplorer: stores.explorers.selectedExplorer,
        },
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
