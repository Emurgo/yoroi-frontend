// features/governace/useCases/GovernanceStatusRevamp/GovernanceStatusCard.tsx
import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, Button, IconButton, Link, Stack } from '@mui/material';
import { Icon } from '../../../../components';

export type GovernanceStatusState = 'idle' | 'hover' | 'delegated' | 'disabled';

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
  votingPowerLabel = 'Voting Power',
  delegatedAmountLabel = 'Delegated Amount',
  delegatedAmountValue,
  onDelegateClick,
  onDetailsClick,
}) => {
  const isDisabled = state === 'disabled';
  const isDelegated = state === 'delegated';

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

  const handleDetailsClick = () => {
    onDetailsClick?.();
  };

  const statusVariant: 'active' | 'delegated' | 'disabled' =
    state === 'delegated' ? 'delegated' : state === 'disabled' ? 'disabled' : 'active';

  const primaryButtonLabel = isDelegated ? 'CHANGE DELEGATION' : 'DELEGATE';

  return (
    <Root state={state}>
      {/* title with avatar */}
      <TitleRow>
        <Avatar state={state}>
          <Icon.YoroiLogo fill="white" />
        </Avatar>

        <Typography variant="h5" color={isDisabled ? 'ds.gray_600' : 'ds.gray_900'}>
          Yoroi DRep
        </Typography>
      </TitleRow>

      {/* description */}
      <Typography variant="body1" color={isDisabled ? 'ds.gray_600' : 'ds.gray_900'}>
        Support the Commercial and Technical adoption of the Cardano roadmap. Please note Yoroi is part of the EMURGO Group.{' '}
      </Typography>

      {/* group of items */}
      <ItemsGroup>
        {/* Item: ID */}
        <ItemRow>
          <LeftPart>
            <Label disabledColor={isDisabled}>ID</Label>
          </LeftPart>

          <RightPart>
            <Value disabledColor={isDisabled}>{drepId}</Value>
            <CopyIconButton onClick={handleCopy} disabled={isDisabled}>
              <Icon.Copy />
            </CopyIconButton>
          </RightPart>
        </ItemRow>

        <ItemRow alignCenter>
          <LeftPart>
            <Label disabledColor={isDisabled}>DRep Status</Label>
          </LeftPart>

          <RightPart>
            <StatusBadge variant={statusVariant}>
              <BadgeText>{isDisabled ? 'Paused' : 'Active'}</BadgeText>
            </StatusBadge>
          </RightPart>
        </ItemRow>

        {/* Item: delegated amount (only shown in delegated) */}
        {isDelegated && (
          <ItemRow>
            <LeftPart>
              <Label disabledColor={isDisabled}>{delegatedAmountLabel}</Label>
            </LeftPart>

            <RightPart>
              <Value disabledColor={isDisabled}>{delegatedAmountValue}</Value>
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
          <Link onClick={handleDetailsClick}>
            <Typography variant="body1">See Yoroi’s voting records</Typography>
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

const Avatar = styled(Box)<{ state: GovernanceStatusState }>(({ state }) => ({
  width: '48px',
  height: '48px',
  borderRadius: '1200px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  background: state === 'disabled' ? '#6B7384' : '#4B6DDE',
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

const Label = styled(Typography)<{ disabledColor?: boolean }>(({ disabledColor }) => ({
  fontFamily: 'Rubik',
  fontStyle: 'normal',
  fontWeight: 400,
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'right',
  color: disabledColor ? '#6B7384' : '#6B7384',
}));

const Value = styled(Typography)<{ disabledColor?: boolean }>(({ disabledColor }) => ({
  fontFamily: 'Rubik',
  fontStyle: 'normal',
  fontWeight: 400,
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'right',
  color: disabledColor ? '#6B7384' : '#242838',
  maxWidth: '505px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

const CopyIconButton = styled(IconButton)(() => ({
  width: '24px',
  height: '24px',
  padding: '0px',
}));

const StatusBadge = styled(Box)<{ variant: 'active' | 'delegated' | 'disabled' }>(({ variant }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  padding: '4px 8px',
  gap: '2px',
  width: '58px',
  height: '30px',
  borderRadius: '1200px',
  background: variant === 'active' ? '#08C29D' : variant === 'delegated' ? '#6B7384' : '#6B7384',
}));

const BadgeText = styled(Typography)(() => ({
  width: '42px',
  height: '22px',
  fontFamily: 'Rubik',
  fontStyle: 'normal',
  fontWeight: 400,
  fontSize: '14px',
  lineHeight: '22px',
  color: '#FFFFFF',
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

const PrimaryButton = styled(Button)<{ disabledVisual?: boolean }>(({ disabledVisual }) => ({
  background: disabledVisual ? '#6B7384' : '#4B6DDE',
  width: '100%',
  '&:hover': {
    background: disabledVisual ? '#6B7384' : '#4B6DDE',
    opacity: disabledVisual ? 1 : 0.9,
  },
}));
