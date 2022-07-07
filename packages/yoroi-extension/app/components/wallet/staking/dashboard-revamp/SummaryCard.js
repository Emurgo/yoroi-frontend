// @flow
import type { Node, ComponentType } from 'react';
import { Box, styled } from '@mui/system';

import { Button, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { defineMessages, injectIntl } from 'react-intl';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import { ReactComponent as StakingIcon }  from '../../../../assets/images/dashboard/staking-active.inline.svg';
import { ReactComponent as TotalDelegatedIcon }  from '../../../../assets/images/dashboard/total-delegated.inline.svg';
import { MultiToken } from '../../../../api/common/lib/MultiToken';
import styles from '../dashboard/UserSummary.scss';
import LoadingSpinner from '../../../widgets/LoadingSpinner';
import type { TokenEntry, TokenLookupKey } from '../../../../api/common/lib/MultiToken';
import { hiddenAmount } from '../../../../utils/strings';
import { truncateToken } from '../../../../utils/formatters';
import { getTokenName } from '../../../../stores/stateless/tokenHelpers';
import type { TokenRow } from '../../../../api/ada/lib/storage/database/primitives/tables';

type Props = {|
  +onOverviewClick: Function,
  +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
  +totalRewards: void | MultiToken,
  +totalDelegated: void | MultiToken,
  +unitOfAccount: TokenEntry => (void | {| currency: string, amount: string |}),
  +shouldHideBalance: boolean,
|};
type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

const messages = defineMessages({
  summary: {
    id: 'wallet.staking.summary',
    defaultMessage: '!!!Summary',
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
  onOverviewClick,
  shouldHideBalance,
  unitOfAccount,
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

  const renderAmount: (void | MultiToken) => Node = token => {
    if (token == null) {
      return (
        <div className={styles.loadingSpinner}>
          <LoadingSpinner small />
        </div>
      );
    }

    return formatTokenEntry(token.getDefaultEntry());
  };

  const renderAmountWithUnitOfAccount: (void | MultiToken) => Node = token => {
    if (token == null) {
      return null;
    }

    const unitOfAccountCalculated = unitOfAccount(token.getDefaultEntry());

    if (!unitOfAccountCalculated) {
      return null;
    }

    if (shouldHideBalance) {
      return `${hiddenAmount}  ${unitOfAccountCalculated.currency}`;
    }

    return `${unitOfAccountCalculated.amount} ${unitOfAccountCalculated.currency}`;
  };

  return (
    <>
      <Card>
        <Box
          sx={{
            padding: '22px 24px',
            borderBottom: '1px solid var(--yoroi-palette-gray-200)',
          }}
        >
          <Typography variant="h5" color="var(--yoroi-palette-gray-900)">
            {intl.formatMessage(messages.summary)}
          </Typography>
        </Box>
        <Box>
          <InfoRow>
            <WrapperIcon bgcolor="#EEF1FA">
              <StakingIcon />
            </WrapperIcon>
            <InfoDetails>
              <Typography variant="body1" color="var(--yoroi-palette-gray-600)" marginBottom="4px">
                {intl.formatMessage(globalMessages.totalRewardsLabel)}
              </Typography>
              <Typography variant="h1" fontWeight="400" color="var(--yoroi-palette-gray-900)">
                {renderAmount(totalRewards)}
              </Typography>
              <Typography variant="body1" color="var(--yoroi-palette-gray-900)">
                {renderAmountWithUnitOfAccount(totalRewards)}
              </Typography>
            </InfoDetails>
            <OverviewButton color="secondary" onClick={onOverviewClick}>
              {intl.formatMessage(globalMessages.overview)}
            </OverviewButton>
          </InfoRow>
          <InfoRow>
            <WrapperIcon bgcolor="#F3FAFF">
              <TotalDelegatedIcon />
            </WrapperIcon>
            <InfoDetails>
              <Typography variant="body1" color="var(--yoroi-palette-gray-600)" marginBottom="4px">
                {intl.formatMessage(globalMessages.totalDelegated)}
              </Typography>
              <Typography variant="h1" fontWeight="400" color="var(--yoroi-palette-gray-900)">
                {renderAmount(totalDelegated)}
              </Typography>
              <Typography variant="body1" color="var(--yoroi-palette-gray-900)">
                {renderAmountWithUnitOfAccount(totalDelegated)}
              </Typography>
            </InfoDetails>
          </InfoRow>
        </Box>
      </Card>
    </>
  );
}
export default (injectIntl(observer(SummaryCard)): ComponentType<Props>);

const Card = styled(Box)({
  backgroundColor: 'var(--yoroi-palette-common-white)',
  borderRadius: '8px',
  flex: '1 1 48.5%',
  maxWidth: '48.5%',
});
const InfoRow = styled(Box)({
  padding: '40px 0',
  margin: '0 24px',
  display: 'flex',
  '& + &': {
    borderTop: '1px solid var(--yoroi-palette-gray-200)',
  },
});
const WrapperIcon = styled(Box)({
  borderRadius: '8px',
  width: '90px',
  height: '90px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '24px',
});
const InfoDetails = styled(Box)({});
const OverviewButton = styled(Button)({
  marginLeft: 'auto',
  minWidth: 'auto',
  width: 'auto',
});
