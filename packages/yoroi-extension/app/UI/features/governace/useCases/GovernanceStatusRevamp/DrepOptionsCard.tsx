import { Box, Typography, Button, Stack, Link } from '@mui/material';
import { styled } from '@mui/system';
import { useStrings } from '../../common/useStrings';
import { YOROI_VOTING_RECORD_LINK } from '../../common/constants';

interface ActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  variant: 'primary' | 'outlined';
  icon?: React.ReactNode;
  onAction: () => void;
  onViewDetails?: () => void;
}

export const DrepOptionsCard: React.FC<ActionCardProps> = ({
  title,
  description,
  buttonText,
  variant,
  icon,
  onAction,
  onViewDetails,
  key,
}) => {
  const strings = useStrings();
  return (
    <ActionCardContainer variant={variant}>
      <CardWrapper>
        <CardTitleRow>
          <CardIcon variant={variant}>{icon}</CardIcon>
          <Typography variant="h5">{title}</Typography>
        </CardTitleRow>

        <Typography variant="body1">{description}</Typography>
      </CardWrapper>

      <CTASet>
        {variant === 'primary' ? (
          <Stack direction="column" spacing={12} width="100%">
            {/* @ts-ignore */}
            <Button variant="primary" onClick={onAction} fullWidth>
              {buttonText}
            </Button>
            {onViewDetails && (
              <Link
                textAlign="center"
                onClick={e => {
                  e.stopPropagation();
                  onViewDetails();
                }}
                href={YOROI_VOTING_RECORD_LINK}
                rel="noopener"
                target="_blank"
                underline="hover"
                sx={{ cursor: 'pointer' }}
              >
                {strings.yoroiVotingRecord}
              </Link>
            )}
          </Stack>
        ) : (
          // @ts-ignore
          <Button variant="secondary" onClick={onAction} fullWidth>
            {buttonText}
          </Button>
        )}
      </CTASet>
    </ActionCardContainer>
  );
};

const ActionCardContainer = styled(Box, {
  shouldForwardProp: prop => prop !== 'variant',
})<{ variant: 'primary' | 'outlined' }>(({ theme, variant }) => ({
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: '16px',
  gap: variant === 'primary' ? '16px' : '12px',

  width: '294px',
  height: '320px',

  background: variant === 'primary' ? theme.palette.ds.bg_gradient_2 : theme.palette.ds.bg_color_max,
  border: variant === 'outlined' ? `1px solid ${theme.palette.ds.gray_200}` : 'none',
  borderRadius: '8px',

  flex: 'none',
  alignSelf: 'stretch',
  flexGrow: 1,
}));

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
  height: '48px',
  flex: 'none',
  order: 0,
  alignSelf: 'stretch',
  flexGrow: 0,
}));

const CardIcon = styled(Box, {
  shouldForwardProp: prop => prop !== 'variant',
})<{ variant: 'primary' | 'outlined' }>(({ variant, theme }: any) => ({
  width: '48px',
  height: '48px',
  background: variant === 'primary' ? theme.palette.ds.primary_500 : theme.palette.ds.gray_100,
  borderRadius: '1200px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  flex: 'none',
  order: 0,
  flexGrow: 0,
}));

const CTASet = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
}));
