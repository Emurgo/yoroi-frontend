// @flow

import type { Node } from 'react';
import { Component } from 'react';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { defineMessages, intlShape } from 'react-intl';
import { Box, Typography } from '@mui/material';
import DialogCloseButton from '../../../components/widgets/DialogCloseButton';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import globalMessages from '../../../i18n/global-messages';
import { toSvg } from 'jdenticon';
import { CopyAddress } from '../../../components/wallet/assets/TruncatedText';
import { addressToDisplayString } from '../../../api/ada/lib/storage/bridge/utils';
import { truncateAddress } from '../../../utils/formatters';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import { getDefaultEntryToken } from '../../../stores/toplevel/TokenInfoStore';
import { genFormatTokenAmount, genLookupOrFail, getTokenName } from '../../../stores/stateless/tokenHelpers';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import { isLedgerNanoWallet, isTrezorTWallet } from '../../../api/ada/lib/storage/models/ConceptualWallet';
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

type Props = {|
  ...StoresAndActionsProps,
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
    this.props.stores.wallets.sendMoneyRequest.reset();
    this.props.stores.substores.ada.delegationTransaction.createWithdrawalTx.reset();
    this.props.actions.ada.ledgerSend.cancel.trigger();
    this.props.actions.ada.trezorSend.cancel.trigger();
  }

  submit: void => Promise<void> = async () => {
    const selected = this.props.stores.wallets.selected;
    if (selected == null) throw new Error(`${nameof(WithdrawRewardsDialog)} no wallet selected`);
    const signRequest = this.props.stores.substores.ada.delegationTransaction.createWithdrawalTx.result;
    if (signRequest == null) return;

    if (this.spendingPasswordForm == null) {
      if (isTrezorTWallet(selected.getParent())) {
        await this.props.actions.ada.trezorSend.sendUsingTrezor.trigger({
          params: {
            signRequest,
          },
          publicDeriver: selected,
        });
      }
      if (isLedgerNanoWallet(selected.getParent())) {
        await this.props.actions.ada.ledgerSend.sendUsingLedgerWallet.trigger({
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
          await this.props.actions.wallets.sendMoney.trigger({
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

    const publicDeriver = this.props.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(WithdrawRewardsDialog)} no public deriver. Should never happen`);
    }

    const currentPool = this.props.stores.delegation.getDelegatedPoolId(publicDeriver);
    if (currentPool == null) return null;

    const network = publicDeriver.getParent().getNetworkInfo();
    const meta = this.props.stores.delegation.getLocalPoolInfo(network, String(currentPool));
    if (meta == null) {
      // server hasn't returned information about the stake pool yet
      return null;
    }
    const name = meta.info?.name ?? intl.formatMessage(globalMessages.unknownPoolLabel);
    const avatarSource = toSvg(currentPool, 36, { padding: 0 });
    const avatarGenerated = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSource)}`;

    const { createWithdrawalTx, shouldDeregister } = this.props.stores.substores.ada.delegationTransaction;

    if (this.props.stores.profile.selectedNetwork == null) {
      throw new Error(`${nameof(WithdrawRewardsDialog)} no selected network`);
    }
    const defaultToken = this.props.stores.tokenInfoStore.getDefaultTokenInfo(
      this.props.stores.profile.selectedNetwork.NetworkId
    );
    const ticker = getTokenName(defaultToken);
    const formatValue = genFormatTokenAmount(genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo));

    if (createWithdrawalTx.error != null)
      return <YoroiTransferErrorPage error={createWithdrawalTx.error} onCancel={this.props.onClose} classicTheme={false} />;

    const tentativeTx = createWithdrawalTx.result;
    if (!tentativeTx)
      return (
        <Dialog title={intl.formatMessage(globalMessages.processingLabel)} closeOnOverlayClick={false}>
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
    const isSubmitting = this.props.stores.wallets.sendMoneyRequest.isExecuting;
    const error = this.props.stores.wallets.sendMoneyRequest.error;
    const spendingPasswordForm =
      withSigning == null ? undefined : (
        <SpendingPasswordInput
          setForm={form => this.setSpendingPasswordForm(form)}
          classicTheme={false}
          isSubmitting={isSubmitting}
        />
      );

    const selectedExplorer = this.props.stores.explorers.selectedExplorer.get(
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
            label: intl.formatMessage(shouldDeregister ? messages.undelegateAnyway : globalMessages.confirm),
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
                <Typography component="div" variant="body1" color="ds.text_gray_normal">
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
}
