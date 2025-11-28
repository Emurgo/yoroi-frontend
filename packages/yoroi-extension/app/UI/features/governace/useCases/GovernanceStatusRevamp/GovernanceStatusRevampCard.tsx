// features/governace/useCases/GovernanceStatusRevamp/GovernanceStatusCard.tsx
import React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Box, Typography, Button, IconButton, Link, Stack } from '@mui/material';
import { Icon } from '../../../../components';
import { useStrings } from '../../common/useStrings';
import { GovernanceStatusState, YOROI_VOTING_RECORD_LINK } from '../../common/constants';

interface GovernanceStatusCardProps {
  state: GovernanceStatusState;
  drepId: string;
  votingPowerLabel?: string;
  votingPowerValue?: string;
  delegatedAmountLabel?: string;
  delegatedAmountValue?: string;
  onDelegateClick?: () => void;
  onDetailsClick?: () => void;
}

export const GovernanceStatusRevampCard: React.FC<GovernanceStatusCardProps> = ({
  state,
  drepId,
  delegatedAmountLabel = 'Delegated Amount',
  delegatedAmountValue,
  onDelegateClick,
  onDetailsClick,
}) => {
  const isDisabled = state === 'disabled';
  const isDelegated = state === 'delegated';
  const strings = useStrings();
  const theme: any = useTheme();

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(drepId);
    } catch {
      // no-op
    }
  };

  const handleDelegateClick = () => {
    if (isDisabled) return;
    onDelegateClick?.();
  };

  // @ts-ignore || it will be used later
  const handleDetailsClick = () => {
    onDetailsClick?.();
  };

  // Will add this as constants later on when adding implementation with backend
  const statusVariant: 'active' | 'delegated' | 'disabled' =
    state === 'delegated' ? 'delegated' : state === 'disabled' ? 'disabled' : 'active';

  const primaryButtonLabel = isDelegated ? strings.changeToDrep : strings.delegateLabel;

  return (
    <Root state={state}>
      <TitleRow>
        <Avatar state={state}>
          <Icon.YoroiLogo fill={theme.palette.ds.gray_min} />
        </Avatar>

        <Typography variant="h5" color={isDisabled ? 'ds.gray_600' : 'ds.gray_900'}>
          {strings.yoroiDRep}
        </Typography>
      </TitleRow>

      <Typography variant="body1" color={isDisabled ? 'ds.gray_600' : 'ds.gray_900'}>
        {strings.yoroiDRepInfo}
      </Typography>

      <ItemsGroup>
        <ItemRow>
          <LeftPart>
            <Typography color={isDisabled ? 'ds.gray_600' : 'ds.gray_700'}>ID</Typography>
          </LeftPart>

          <RightPart>
            <Typography color={isDisabled ? 'ds.gray_600' : 'ds.gray_900'}>{drepId}</Typography>
            <CopyIconButton onClick={handleCopy} disabled={isDisabled}>
              <Icon.Copy />
            </CopyIconButton>
          </RightPart>
        </ItemRow>

        <ItemRow alignCenter>
          <LeftPart>
            <Typography color={isDisabled ? 'ds.gray_600' : 'ds.gray_700'}>{strings.drepStatus}</Typography>
          </LeftPart>

          <RightPart>
            <StatusBadge variant={statusVariant}>
              <Typography variant="body2" color="ds.gray_min">
                {isDisabled ? 'Paused' : 'Active'}
              </Typography>
            </StatusBadge>
          </RightPart>
        </ItemRow>

        {isDelegated && (
          <ItemRow>
            <LeftPart>
              <Typography color={isDisabled ? 'ds.gray_600' : 'ds.gray_700'}>{delegatedAmountLabel}</Typography>
            </LeftPart>

            <RightPart>
              <Typography color={isDisabled ? 'ds.gray_600' : 'ds.gray_900'}>{delegatedAmountValue}</Typography>
            </RightPart>
          </ItemRow>
        )}
      </ItemsGroup>

      <CtaSet>
        {/* @ts-ignore */}
        <PrimaryButton variant="primary" disabledVisual={isDisabled} disabled={isDisabled} onClick={handleDelegateClick}>
          {primaryButtonLabel}
        </PrimaryButton>

        <Stack direction="row" justifyContent="center" alignItems="flex-start" width="100%">
          <Link
            onClick={event => event.stopPropagation()}
            href={YOROI_VOTING_RECORD_LINK}
            rel="noopener"
            target="_blank"
            underline="hover"
            sx={{ cursor: 'pointer' }}
          >
            <Typography variant="body1">{strings.yoroiVotingRecord}</Typography>
          </Link>
        </Stack>
      </CtaSet>
    </Root>
  );
};

const Root = styled(Box, {
  shouldForwardProp: prop => prop !== 'state',
})<{ state: GovernanceStatusState }>(({ state, theme }: any) => {
  const base: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '16px',
    gap: '16px',
    width: '612px',
    boxSizing: 'border-box',
    borderRadius: '8px',
  };

  if (state === 'disabled') {
    return {
      ...base,
      background: theme.palette.ds.gray_100,
    };
  }

  if (state === 'delegated') {
    return {
      ...base,
      backgroundImage: theme.palette.ds.bg_gradient_2,
    };
  }

  if (state === 'hover') {
    return {
      ...base,
      backgroundImage: theme.palette.ds.bg_gradient_2,
    };
  }

  // idle
  return {
    ...base,
    backgroundImage: theme.palette.ds.bg_gradient_1,
  };
});

const TitleRow = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '0px',
  gap: '12px',
  width: '580px',
  height: '48px',
}));

const Avatar = styled(Box)<{ state: GovernanceStatusState }>(({ state, theme }: any) => ({
  width: '48px',
  height: '48px',
  borderRadius: '1200px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  background: state === 'disabled' ? theme.palette.ds.gray_600 : theme.palette.ds.primary_500,
}));

const ItemsGroup = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: '0px',
  gap: '8px',
  width: '580px',
}));

const ItemRow = styled(Box)<{ alignCenter?: boolean }>(({ alignCenter }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: alignCenter ? 'center' : 'flex-start',
  padding: '0px',
  gap: '16px',
  width: '100%',
  height: alignCenter ? '30px' : '24px',
}));

const LeftPart = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  padding: '0px',
  gap: '4px',
  height: '24px',
}));

const RightPart = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  padding: '0px',
  gap: '4px',
  height: '24px',
  flexShrink: 0,
}));

const CopyIconButton = styled(IconButton)(() => ({
  width: '24px',
  height: '24px',
  padding: '0px',
}));

const StatusBadge = styled(Box)<{ variant: 'active' | 'delegated' | 'disabled' }>(({ variant, theme }: any) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  padding: '4px 8px',
  gap: '2px',
  width: '58px',
  height: '30px',
  borderRadius: '1200px',
  background:
    variant === 'active'
      ? theme.palette.ds.secondary_600
      : variant === 'delegated'
        ? theme.palette.ds.gray_600
        : theme.palette.ds.gray_400,
}));

const CtaSet = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: '0px',
  gap: '8px',
  width: '580px',
  height: '72px',
}));

const PrimaryButton = styled(Button)<{ disabledVisual?: boolean }>(({ disabledVisual, theme }: any) => ({
  background: disabledVisual ? theme.palette.ds.gray_600 : theme.palette.ds.primary_500,
  width: '100%',
  '&:hover': {
    background: disabledVisual ? theme.palette.ds.gray_600 : theme.palette.ds.primary_500,
    opacity: disabledVisual ? 1 : 0.9,
  },
}));
