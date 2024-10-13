// @flow

/* eslint react/jsx-one-expression-per-line: 0 */ // the &nbsp; in the html breaks this

import type { Node } from 'react';
import { Component } from 'react';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import globalMessages from '../../../i18n/global-messages';
import LocalizableError from '../../../i18n/LocalizableError';
import styles from './DelegationTxDialog.scss';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import RawHash from '../../widgets/hashWrappers/RawHash';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import SpendingPasswordInput from '../../widgets/forms/SpendingPasswordInput';
import type { TokenLookupKey } from '../../../api/common/lib/MultiToken';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import { genFormatTokenAmount, getTokenName } from '../../../stores/stateless/tokenHelpers';
import { ReactComponent as InfoIcon } from '../../../assets/images/info-icon-revamp.inline.svg';

import WarningBox from '../../widgets/WarningBox';
import { Box, styled, Tooltip, Typography } from '@mui/material';
import { toSvg } from 'jdenticon';
import { CopyAddress } from '../assets/TruncatedText';

const messages = defineMessages({
  delegationTips: {
    id: 'wallet.delegation.transaction.delegationTips',
    defaultMessage: '!!!Delegation tips',
  },
  explanationLine1: {
    id: 'wallet.delegation.transaction.explanationLine1',
    defaultMessage: '!!!You can only delegate to one stake pool at a time',
  },
  explanationLine2: {
    id: 'wallet.delegation.transaction.explanationLine2',
    defaultMessage: '!!!You can switch to delegate to a different stake pool at any time',
  },
  explanationLine3: {
    id: 'wallet.delegation.transaction.explanationLine3',
    defaultMessage: '!!!You can cancel your delegation at any time',
  },
  stakePoolName: {
    id: 'wallet.delegation.transaction.stakePoolName',
    defaultMessage: '!!!Stake pool name',
  },
  approximateLabel: {
    id: 'wallet.delegation.transaction.approximationLabel',
    defaultMessage: '!!!Current approximation of rewards that you will receive per epoch:',
  },
  epochRewardLabel: {
    id: 'wallet.delegation.transaction.epochRewardLabel',
    defaultMessage: '!!!Approx epoch reward',
  },
  epochRewardTip: {
    id: 'wallet.delegation.transaction.epochRewardTip',
    defaultMessage: '!!!Current approximation of rewards that you will receive per epoch',
  },
  amountToDelegate: {
    id: 'wallet.delegation.transaction.amountToDelegate',
    defaultMessage: '!!!Amount to delegate',
  },
  amountToDelegateTip: {
    id: 'wallet.delegation.transaction.amountToDelegateTip',
    defaultMessage: '!!!Amount to delegate equals to your wallet balance at the moment of delegation',
  },
});

const IconWrapper = styled(Box)(({ theme }) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));

type Props = {|
  +staleTx: boolean,
  +selectedExplorer: SelectedExplorer,
  +poolName: null | string,
  +poolHash: string,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +amountToDelegate: MultiToken,
  +transactionFee: MultiToken,
  +approximateReward: {|
    +amount: BigNumber,
    +token: $ReadOnly<TokenRow>,
  |},
  +isHardware: boolean,
  +isSubmitting: boolean,
  +onCancel: void => void,
  +onSubmit: ({| password?: string |}) => PossiblyAsync<void>,
  +error: ?LocalizableError,
|};

@observer
export default class DelegationTxDialog extends Component<Props> {
  @observable spendingPasswordForm: void | ReactToolboxMobxForm;

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  @action
  setSpendingPasswordForm(form: ReactToolboxMobxForm) {
    this.spendingPasswordForm = form;
  }

  submit(): void {
    if (this.spendingPasswordForm == null) {
      this.props.onSubmit(Object.freeze({}));
      return;
    }
    this.spendingPasswordForm.submit({
      onSuccess: async form => {
        const { walletPassword } = form.values();
        await this.props.onSubmit({ password: walletPassword });
      },
      onError: () => {},
    });
  }

  render(): Node {
    const { intl } = this.context;

    const spendingPasswordForm = this.props.isHardware ? undefined : (
      <SpendingPasswordInput
        setForm={form => this.setSpendingPasswordForm(form)}
        isSubmitting={this.props.isSubmitting}
      />
    );

    const staleTxWarning = (
      <div className={styles.warningBox}>
        <WarningBox>
          {intl.formatMessage(globalMessages.staleTxnWarningLine1)}
          <br />
          {intl.formatMessage(globalMessages.staleTxnWarningLine2)}
        </WarningBox>
      </div>
    );

    const formatValue = genFormatTokenAmount(this.props.getTokenInfo);

    const decimalPlaces = this.props.getTokenInfo(this.props.amountToDelegate.getDefaultEntry()).Metadata.numberOfDecimals;
    const delegatingValue = new BigNumber(this.props.amountToDelegate.getDefaultEntry().amount).shiftedBy(-decimalPlaces);

    const avatarSource = toSvg(this.props.poolHash, 36, { padding: 0 });
    const avatarGenerated = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSource)}`;
    const tokenTicker = getTokenName(this.props.getTokenInfo(this.props.amountToDelegate.getDefaultEntry()));

    return (
      <Dialog
        title={intl.formatMessage(globalMessages.delegateLabel)}
        actions={[
          {
            label: intl.formatMessage(globalMessages.delegateLabel),
            onClick: this.submit.bind(this),
            primary: true,
            isSubmitting: this.props.isSubmitting,
            disabled: this.props.isSubmitting,
          },
        ]}
        closeOnOverlayClick={false}
        onClose={!this.props.isSubmitting ? this.props.onCancel : null}
        closeButton={<DialogCloseButton/>}
      >
        {this.props.staleTx && staleTxWarning}
        <Box
          sx={{
            background: theme => theme.palette.ds.bg_gradient_1,
            mb: '24px',
            p: '12px 16px 8px 16px',
            borderRadius: '8px',
          }}
        >
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            mb: '8px'
          }}>
            <IconWrapper>
              <InfoIcon/>
            </IconWrapper>
            <Typography component="div" variant="body1" fontWeight={500} color="ds.text_gray_medium">
              {intl.formatMessage(messages.delegationTips)}
            </Typography>
          </Box>
          <Box
            sx={{
              listStyle: 'outside',
              pl: '27px',
            }}
            component="ul"
          >
            {[messages.explanationLine1, messages.explanationLine2, messages.explanationLine3].map(msg => {
              const message = intl.formatMessage(msg);
              return (
                <Box component="li" key={message}>
                  <Typography component="div" variant="body1" color="ds.text_gray_medium">
                    {message}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
        <Box mb="16px">
          <Typography component="div" variant="body1" color="ds.text_gray_medium" mb="4px">
            {intl.formatMessage(globalMessages.stakePoolChecksumAndName)}
          </Typography>
          <Box sx={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <Box>
              <Box
                sx={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'inline-block'
                }}
                component="img"
                src={avatarGenerated}
              />
            </Box>
            <Typography component="div" variant="body1" color="grayscale.900">
              {this.props.poolName ?? intl.formatMessage(globalMessages.unknownPoolLabel)}
            </Typography>
          </Box>
        </Box>
        <Box mb="24px">
          <Typography component="div" variant="body1" color="ds.text_gray_medium">
            {intl.formatMessage(globalMessages.stakePoolHash)}
          </Typography>
          <Box>
            <Typography
              component="div"
              variant="body1"
              sx={{
                '& > div > p': { p: '2px 3px' },
                px: '2px',
                ml: '-3px',
                mt: '-2px'
              }}
            >
              <CopyAddress text={this.props.poolHash}>
                <ExplorableHashContainer
                  selectedExplorer={this.props.selectedExplorer}
                  hash={this.props.poolHash}
                  light
                  primary
                  linkType="pool"
                  placementTooltip="top"
                >
                  <RawHash light primary>
                    {this.props.poolHash}
                  </RawHash>
                </ExplorableHashContainer>
              </CopyAddress>
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            py: '24px',
            borderTop: '1px solid',
            borderColor: 'grayscale.200',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <Box>
            <Box display="flex" gap="6px" alignItems="center">
              <Typography component="div" color="ds.text_gray_medium" variant="body1">
                {intl.formatMessage(messages.amountToDelegate)}
              </Typography>
              <Tooltip
                title={
                  <Typography component="div" variant="body2">
                    {intl.formatMessage(messages.amountToDelegateTip)}
                  </Typography>
                }
                placement="top"
              >
                <IconWrapper component="span" sx={{ cursor: 'pointer' }}>
                  <InfoIcon/>
                </IconWrapper>
              </Tooltip>
            </Box>
            <Typography component="div" color="grayscale.900">
              {delegatingValue.toString()} {tokenTicker}
            </Typography>
          </Box>
          <Box>
            <Box display="flex" gap="6px" alignItems="center">
              <Typography component="div" color="ds.text_gray_medium" variant="body1">
                {intl.formatMessage(messages.epochRewardLabel)}
              </Typography>
              <Tooltip
                title={
                  <Typography component="div" variant="body2">
                    {intl.formatMessage(messages.epochRewardTip)}
                  </Typography>
                }
              >
                <IconWrapper component="span" sx={{ cursor: 'pointer' }}>
                  <InfoIcon/>
                </IconWrapper>
              </Tooltip>
            </Box>
            <Typography component="div" color="grayscale.900">
              {this.props.approximateReward.amount
                .shiftedBy(-this.props.approximateReward.token.Metadata.numberOfDecimals)
                .toFormat(this.props.approximateReward.token.Metadata.numberOfDecimals)}
              &nbsp;
              {tokenTicker}
            </Typography>
          </Box>
          <Box>
            <Typography component="div" color="ds.text_gray_medium" variant="body1">
              {intl.formatMessage(globalMessages.feeLabel)}
            </Typography>
            <Typography component="div" color="grayscale.900">
              {formatValue(this.props.transactionFee.getDefaultEntry())} {tokenTicker}
            </Typography>
          </Box>
        </Box>

        {spendingPasswordForm}
        {this.props.error ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: '13px',
            }}
          >
            <Typography component="div" variant="caption1" color="magenta.500" textAlign="center">
              {intl.formatMessage(this.props.error, this.props.error.values)}
            </Typography>
          </Box>
        ) : null}
      </Dialog>
    );
  }
}
