// @flow
import type { Node, ComponentType } from 'react';
import { Box, styled } from '@mui/system';

import { Button, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { defineMessages, injectIntl } from 'react-intl';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import { ReactComponent as StakingIcon } from '../../../../assets/images/dashboard/staking-active.inline.svg';
import { ReactComponent as TotalDelegatedIcon } from '../../../../assets/images/dashboard/total-delegated.inline.svg';
import { MultiToken } from '../../../../api/common/lib/MultiToken';
import styles from '../dashboard/UserSummary.scss';
import LoadingSpinner from '../../../widgets/LoadingSpinner';
import type { TokenEntry, TokenLookupKey } from '../../../../api/common/lib/MultiToken';
import { hiddenAmount } from '../../../../utils/strings';
import { truncateToken } from '../../../../utils/formatters';
import { getTokenName } from '../../../../stores/stateless/tokenHelpers';
import type { TokenRow } from '../../../../api/ada/lib/storage/database/primitives/tables';
import type { GraphData } from '../dashboard/StakingDashboard';
import RewardHistoryGraph from './RewardHistoryGraph';
import { maybe } from '../../../../coreUtils';

type Props = {|
  +onOverviewClick: Function,
  +onOpenRewardList: Function,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +totalRewards: ?MultiToken,
  +totalDelegated: ?MultiToken,
  +unitOfAccount: TokenEntry => void | {| currency: string, amount: string |},
  +shouldHideBalance: boolean,
  +graphData: GraphData,
  +withdrawRewards: void | (void => Promise<void>),
|};

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

const messages = defineMessages({
  summary: {
    id: 'wallet.staking.summary',
    defaultMessage: '!!!Rewards Summary',
  },
  dialogSummaryDescription: {
    id: 'wallet.staking.dialogSummaryDescription',
    defaultMessage:
      '!!!Your rewards are automatically staked. You don’t need to withdraw it everytime because you pay a transaction fee.',
  },
});

function SummaryCard({
  totalRewards,
  totalDelegated,
  getTokenInfo,
  onOverviewClick: _onOverviewClick, // todo: remove?
  withdrawRewards,
  shouldHideBalance,
  onOpenRewardList,
  unitOfAccount,
  graphData,
  intl,
}: Props & Intl): Node {
  const formatTokenEntry: TokenEntry => Node = tokenEntry => {
    const tokenInfo = getTokenInfo(tokenEntry);
    const splitAmount = tokenEntry.amount
      .shiftedBy(-tokenInfo.Metadata.numberOfDecimals)
      .toFormat(tokenInfo.Metadata.numberOfDecimals)
      .split('.');

    const amountNode = shouldHideBalance ? (
      <>{hiddenAmount}</>
    ) : (
      <>
        {splitAmount[0]}
        <span>.{splitAmount[1]} </span>
      </>
    );
    return (
      <>
        <span>{amountNode} </span>
        {truncateToken(getTokenName(tokenInfo))}
      </>
    );
  };

  const renderAmount: (?MultiToken) => ?Node = token => {
    return maybe(token, t => formatTokenEntry(t.getDefaultEntry()));
  };

  const renderAmountWithUnitOfAccount: (?MultiToken) => ?Node = token => {
    const unitOfAccountCalculated = maybe(token, t => unitOfAccount(t.getDefaultEntry()));
    return maybe(unitOfAccountCalculated, u => `${shouldHideBalance ? hiddenAmount : u.amount} ${u.currency}`);
  };

  return (
    <Card sx={{ border: '1px solid', borderColor: 'grayscale.200', bgcolor: 'ds.bg_color_min' }}>
      <Box
        sx={{
          padding: '15px 24px',
          borderBottom: '1px solid',
          borderColor: 'grayscale.200',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography component="div" variant="h5" color="ds.text_gray_medium" fontWeight={500}>
          {intl.formatMessage(messages.summary)}
        </Typography>
        <Button
          variant="primary"
          sx={{
            '&.MuiButton-sizeMedium': {
              height: 'unset',
              p: '9px 20px',
            },
          }}
          onClick={withdrawRewards}
          disabled={!withdrawRewards}
        >
          {intl.formatMessage(globalMessages.withdrawLabel)}
        </Button>
      </Box>
      <Box sx={{ display: 'flex' }}>
        <InfoRow sx={{ borderColor: 'grayscale.200' }}>
          <StakingIcon />
          <InfoDetails>
            <Typography component="div" variant="caption1" color="grayscale.600" sx={{ textTransform: 'uppercase' }}>
              {intl.formatMessage(globalMessages.totalRewardsLabel)}
            </Typography>
          </InfoDetails>
          <InfoDetails>
            <Typography component="div" variant="h2" color="ds.text_gray_medium" fontWeight={500}>
              {renderAmount(totalRewards)}
            </Typography>
            <Typography component="div" variant="body1" color="grayscale.600" fontWeight={500}>
              {renderAmountWithUnitOfAccount(totalRewards)}
            </Typography>
          </InfoDetails>
          {/* <OverviewButton color="secondary" onClick={onOverviewClick}>
              {intl.formatMessage(globalMessages.overview)}
            </OverviewButton> */}
        </InfoRow>
        <InfoRow sx={{ borderColor: 'grayscale.200' }}>
          <TotalDelegatedIcon />
          <InfoDetails>
            <Typography
              component="div"
              variant="caption1"
              color="grayscale.600"
              marginBottom="4px"
              sx={{ textTransform: 'uppercase' }}
            >
              {intl.formatMessage(globalMessages.totalDelegated)}
            </Typography>
          </InfoDetails>
          <InfoDetails>
            {totalDelegated ? (
              <Typography component="div" variant="h2" fontWeight="500" color="ds.text_gray_medium">
                {renderAmount(totalDelegated)}
              </Typography>
            ) : (
              <div className={styles.loadingSpinner}>
                <LoadingSpinner small />
              </div>
            )}
            <Typography component="div" variant="body1" color="grayscale.600" fontWeight={500}>
              {renderAmountWithUnitOfAccount(totalDelegated)}
            </Typography>
          </InfoDetails>
        </InfoRow>
      </Box>
      <RewardHistoryGraph onOpenRewardList={onOpenRewardList} graphData={graphData} />
    </Card>
  );
}
export default (injectIntl(observer(SummaryCard)): ComponentType<Props>);

const Card = styled(Box)({
  borderRadius: '8px',
  flex: '1 1 48.5%',
  maxWidth: '48.5%',
});
const InfoRow = styled(Box)({
  width: '100%',
  padding: 24,
  margin: '0',
  display: 'flex',
  flexFlow: 'column',
  borderStyle: 'solid',
  borderBottomWidth: '1px',
  gap: 8,
  '&:not(:first-child)': {
    borderLeftWidth: '1px',
  },
});

const InfoDetails = styled(Box)({});

// todo: remove?
// eslint-disable-next-line no-unused-vars
const OverviewButton = styled(Button)({
  marginLeft: 'auto',
  minWidth: 'auto',
  width: 'auto',
});
