import { Box, Typography, Button, Stack, Link, IconButton } from '@mui/material';
import { styled } from '@mui/system';
import { useStrings } from '../../common/hooks/useStrings';
import { GOVERNANCE_STATUS, GovernanceStatusState } from '../../common/constants';
import { LoadingButton } from '@mui/lab';
import { Icon } from '../../../../components';
import { truncateFormatter } from '../../../../common/helpers/formatters';

interface ActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  variant: 'primary' | 'outlined';
  icon?: React.ReactNode;
  onAction: () => void;
  onViewDetails?: () => void;
  status: GovernanceStatusState;
  drepId: string | null;
  isDelegated: boolean;
  pending?: boolean;
}

export const DrepOptionsCard: React.FC<ActionCardProps> = ({
  title,
  description,
  buttonText,
  variant,
  icon,
  onAction,
  onViewDetails,
  status,
  drepId,
  isDelegated,
  pending = false,
}) => {
  const strings = useStrings();

  return (
    <ActionCardContainer variant={variant} status={status} isCardDelegated={isDelegated} pending={pending}>
      <CardWrapper>
        <CardTitleRow>
          <CardIcon variant={variant} isDelegated={isDelegated}>
            {icon}
          </CardIcon>
          <Typography variant="h5">{title}</Typography>
        </CardTitleRow>

        <Typography variant="body1">{description}</Typography>
        {GOVERNANCE_STATUS.DELEGATED === status && drepId && isDelegated && <DelegatedInfo drepId={drepId} status={status} />}
        {isDelegated && <DelegatingLabel />}
      </CardWrapper>

      <CTASet>
        {variant === 'primary' ? (
          <Stack direction="column" spacing={12} width="100%">
            {(status === GOVERNANCE_STATUS.DELEGATED || drepId === null) && !isDelegated && (
              // @ts-ignore
              <LoadingButton variant="primary" onClick={onAction} fullWidth height="40px">
                {buttonText}
              </LoadingButton>
            )}

            {onViewDetails && (
              <Link
                textAlign="center"
                onClick={e => {
                  e.stopPropagation();
                  onViewDetails();
                }}
                rel="noopener"
                underline="hover"
                sx={{ cursor: 'pointer' }}
              >
                {strings.yoroiVotingRecord}
              </Link>
            )}
          </Stack>
        ) : (
          // @ts-ignore
          <Button height="40px" variant="secondary" onClick={onAction} fullWidth sx={{ padding: '13px 10px !important' }}>
            {buttonText}
          </Button>
        )}
      </CTASet>
    </ActionCardContainer>
  );
};

const DelegatedInfo = ({ drepId, status }) => {
  const strings = useStrings();

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(drepId || '');
    } catch {
      // no-op
    }
  };
  return (
    <ItemsGroup>
      <ItemRow>
        <LeftPart>
          <Typography color="ds.text_gray_low" variant="body2">
            ID
          </Typography>
        </LeftPart>

        <RightPart>
          <Typography color="ds.text_gray_medium" variant="body2">
            {truncateFormatter(drepId, 15)}
          </Typography>
          <CopyIconButton onClick={handleCopy}>
            <Icon.Copy />
          </CopyIconButton>
        </RightPart>
      </ItemRow>

      <ItemRow>
        <LeftPart>
          <Typography color="ds.text_gray_low" variant="body2">
            {strings.drepStatus}
          </Typography>
        </LeftPart>

        <RightPart>
          <StatusBadge variant={status}>
            <Typography variant="body2" color="ds.gray_min">
              {'Active'}
            </Typography>
          </StatusBadge>
        </RightPart>
      </ItemRow>
    </ItemsGroup>
  );
};

const DelegatingLabel = () => {
  const strings = useStrings();

  return (
    <ItemsGroup>
      <ItemRow>
        <LeftPart>
          <Typography color="ds.text_gray_low" variant="body2">
            {strings.delegationStatus}
          </Typography>
        </LeftPart>

        <RightPart>
          <Typography color="ds.text_gray_medium" variant="body2">
            {strings.delegatingLabel}
          </Typography>
        </RightPart>
      </ItemRow>
    </ItemsGroup>
  );
};

type ActionCardVariant = 'primary' | 'outlined';

interface ActionCardContainerProps {
  variant: ActionCardVariant;
  status: GovernanceStatusState;
  isCardDelegated?: boolean;
  pending?: boolean;
}

export const ActionCardContainer = styled(Box, {
  shouldForwardProp: prop => prop !== 'variant' && prop !== 'status' && prop !== 'isCardDelegated' && prop !== 'pending',
})<ActionCardContainerProps>(({ pending, theme, variant, status, isCardDelegated }: any) => {
  const base: React.CSSProperties = {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '16px',
    gap: variant === 'primary' ? '16px' : '12px',
    width: '294px',
    height: '320px',
    borderRadius: '8px',
    flex: 'none',
    alignSelf: 'stretch',
    flexGrow: 1,
    cursor: status === 'disabled' ? 'default' : 'pointer',
    opacity: status === 'disabled' ? 0.6 : 1,
  };

  if (status === 'disabled' || pending) {
    return {
      ...base,
      background: theme.palette.ds.gray_100,
      border: `1px solid ${theme.palette.ds.gray_200}`,
      pointerEvents: 'none',
    };
  }
  if (isCardDelegated) {
    return {
      ...base,
      background: theme.palette.ds.bg_gradient_2,
    };
  }

  if (isCardDelegated && variant === 'primary') {
    return {
      ...base,
      background: theme.palette.ds.bg_gradient_2,
    };
  }
  if (variant === 'primary') {
    return {
      ...base,
      backgroundImage: theme.palette.ds.bg_gradient_1,
      '&:hover': {
        backgroundImage: theme.palette.ds.bg_gradient_2,
      },
    };
  }

  return {
    ...base,
    background: theme.palette.ds.bg_color_max,
    border: `1px solid ${theme.palette.ds.gray_200}`,
    '&:hover': {
      borderColor: theme.palette.ds.el_gray_min,
    },
  };
});

const CardWrapper = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: '0px',
  gap: '8px',
  margin: '0 auto',
  width: '262px',
  height: 'auto',
  flex: 'none',
  order: 0,
  alignSelf: 'stretch',
  flexGrow: 0,
}));

const CardTitleRow = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '0px',
  gap: '12px',
  width: '262px',
  flex: 'none',
  order: 0,
  alignSelf: 'stretch',
  flexGrow: 0,
}));

const CardIcon = styled(Box, {
  shouldForwardProp: prop => prop !== 'variant' && prop !== 'isDelegated',
})<{ variant: 'primary' | 'outlined'; isDelegated?: boolean }>(({ variant, isDelegated, theme }: any) => ({
  width: '48px',
  height: '48px',
  background:
    variant === 'primary'
      ? theme.palette.ds.primary_500
      : isDelegated
        ? theme.palette.ds.secondary_200
        : theme.palette.ds.gray_100,
  borderRadius: '1200px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ItemsGroup = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: '0px',
  gap: '12px',
  width: '100%',
}));

const ItemRow = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0px',
  gap: '24px',
  width: '100%',
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
    variant === 'active' || variant === 'delegated'
      ? theme.palette.ds.secondary_600
      : variant === 'disabled'
        ? theme.palette.ds.gray_600
        : theme.palette.ds.gray_400,
}));

const CTASet = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
}));
