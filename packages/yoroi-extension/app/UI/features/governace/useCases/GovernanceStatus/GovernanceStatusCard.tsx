import React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import { CopyButton, Icon } from '../../../../components';
import { useStrings } from '../../common/hooks/useStrings';
import { LoadingButton } from '@mui/lab';
import { GOVERNANCE_STATUS, GovernanceStatusState } from '../../common/constants';
import { truncateFormatter } from '../../../../common/helpers/formatters';
import { useIsGovernanceAllowed } from '../../common/hooks/useIsGovernanceAllowed';
import { useGovernanceDelegationStatus } from '../../common/hooks/useGovernanceDelegationStatus';

interface GovernanceStatusCardProps {
  state: GovernanceStatusState;
  onDelegateClick?: () => void;
  btnLoading?: boolean;
  forModal?: boolean;
  governanceStatus?: any;
  openDelegateModalForCustomDrep?: () => void;
  pending?: boolean;
}

export const GovernanceStatusCard: React.FC<GovernanceStatusCardProps> = ({
  state,
  governanceStatus,
  onDelegateClick,
  btnLoading,
  forModal = false,
  openDelegateModalForCustomDrep,
  pending = false,
}) => {
  const isDisabled = state === GOVERNANCE_STATUS.DISABLED || pending;
  const isDelegated = state === GOVERNANCE_STATUS.DELEGATED;
  const { isParticipating } = useIsGovernanceAllowed();
  const strings = useStrings();
  const theme: any = useTheme();

  const { isAbstain, isNoConfidence, isDelegationToDrep, drepID } = useGovernanceDelegationStatus({
    governanceStatus,
    isDelegated,
  });
  const primaryButtonLabel = forModal ? strings.delegateLabel : isDelegated ? strings.changeToDrep : strings.delegateLabel;
  const showDrepStatus = isDelegationToDrep || !isParticipating;
  const showDrepId = isDelegationToDrep;
  const showDelegatingLabel = isParticipating && !forModal;
  const showDelegateToOtherDrepButton = isAbstain || isNoConfidence;
  const showDelegateButton = !isParticipating || forModal || (state === GOVERNANCE_STATUS.IDLE && !isDelegated);

  const handleDelegateClick = () => {
    if (isDisabled) return;
    onDelegateClick?.();
  };

  const handleCardInfo = () => {
    if (isDelegationToDrep) {
      return {
        icon: <Icon.VotingDrep width={24} height={24} fill={theme.palette.ds.gray_max} />,
        title: strings.delegateToDRep,
        description: strings.designatedSomeoneElse,
      };
    }
    if (isAbstain) {
      return {
        icon: <Icon.VotingAbstain width={24} height={24} fill={theme.palette.ds.gray_max} />,
        title: strings.abstain,
        description: strings.abstainInfo,
      };
    }
    if (isNoConfidence) {
      return {
        icon: <Icon.VotingNoConfidence width={24} height={24} fill={theme.palette.ds.gray_max} />,
        title: strings.noConfidence,
        description: strings.noConfidenceInfo,
      };
    }
    return {
      icon: <Icon.VotingDrep width={24} height={24} fill={theme.palette.ds.gray_max} />,
      title: strings.delegateToDRep,
      description: strings.identifyDrep,
    };
  };

  return (
    <Root
      state={state}
      forModal={forModal}
      isAbstain={isAbstain}
      isNoConfidence={isNoConfidence}
      id="governance-delegationStatus-button"
    >
      <TitleRow>
        <Avatar
          forModal={forModal}
          isParticipating={isParticipating}
        >
          {handleCardInfo().icon}
        </Avatar>

        <Typography
          maxWidth={'600px'}
          fontWeight={500}
          variant={forModal ? 'body1' : 'h5'}
          color={isDisabled ? 'ds.gray_600' : 'ds.gray_900'}
        >
          {handleCardInfo().title}
        </Typography>
      </TitleRow>
      <Typography variant="body1" color={isDisabled ? 'ds.gray_600' : 'ds.gray_900'}>
        {handleCardInfo().description}
      </Typography>

      <ItemsGroup>
        {showDrepId && (
          <ItemRow>
            <LeftPart>
              <Typography color={isDisabled ? 'ds.gray_600' : 'ds.gray_700'}>ID</Typography>
            </LeftPart>

            <RightPart>
              <Typography color={isDisabled ? 'ds.gray_600' : 'ds.gray_900'}>
                {forModal ? truncateFormatter(drepID, 15) : drepID}
              </Typography>
              <CopyButton textToCopy={drepID} />
            </RightPart>
          </ItemRow>
        )}

        {showDrepStatus && (
          <ItemRow alignCenter>
            <LeftPart>
              <Typography color={isDisabled ? 'ds.gray_600' : 'ds.gray_700'}>{strings.drepStatus}</Typography>
            </LeftPart>

            <RightPart>
              <StatusBadge variant={state}>
                <Typography variant="body2" color="ds.gray_min">
                  {isDisabled ? 'Paused' : 'Active'}
                </Typography>
              </StatusBadge>
            </RightPart>
          </ItemRow>
        )}
        {showDelegatingLabel && (
          <ItemRow alignCenter>
            <LeftPart>
              <Typography color={isDisabled ? 'ds.gray_600' : 'ds.gray_700'}>{strings.delegationStatus}</Typography>
            </LeftPart>

            <RightPart>
              <Typography variant="body2" color="ds.text_gray_medium">
                {strings.delegatingLabel}
              </Typography>
            </RightPart>
          </ItemRow>
        )}
      </ItemsGroup>
      <CtaSet>
        {showDelegateToOtherDrepButton && (
          <LoadingButton
            fullWidth
            loading={btnLoading}
            /* @ts-ignore */
            variant="secondary"
            disabled={isDisabled}
            onClick={openDelegateModalForCustomDrep}
          >
            {strings.changeToDrep}
          </LoadingButton>
        )}
        {showDelegateButton && (
          <LoadingButton
            fullWidth
            loading={btnLoading}
            /* @ts-ignore */
            variant={forModal ? 'secondary' : 'primary'}
            disabledVisual={isDisabled}
            disabled={isDisabled}
            onClick={handleDelegateClick}
          >
            {primaryButtonLabel}
          </LoadingButton>
        )}
      </CtaSet>
    </Root>
  );
};

const Root = styled(Box, {
  shouldForwardProp: prop => prop !== 'state' && prop !== 'forModal' && prop !== 'isAbstain' && prop !== 'isNoConfidence',
})<{ state: GovernanceStatusState; forModal: boolean; isAbstain: boolean; isNoConfidence: boolean }>(({
  state,
  forModal,
  theme,
  isAbstain,
  isNoConfidence,
}: any) => {
  const base: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '16px',
    gap: '16px',
    width: forModal ? '100%' : '612px',
    boxSizing: 'border-box',
    borderRadius: '8px',
  };

  if (isAbstain || isNoConfidence) {
    return {
      ...base,
      backgroundImage: theme.palette.ds.bg_gradient_2,
    };
  }

  if (forModal) {
    return {
      ...base,
      background: theme.palette.ds.bg_color_max,
      border: `1px solid ${theme.palette.ds.gray_200}`,
    };
  }

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

  // idle
  return {
    ...base,
    backgroundImage: theme.palette.ds.bg_gradient_1,
    '&:hover': {
      backgroundImage: theme.palette.ds.bg_gradient_2,
    },
  };
});

const TitleRow = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '0px',
  gap: '12px',
  width: '100%',
  height: '48px',
}));

const Avatar = styled(Box)<{
  forModal: boolean;
  isParticipating: boolean;
}>(({ forModal, theme, isParticipating }: any) => ({
  width: forModal ? '24px' : '48px',
  height: forModal ? '24px' : '48px',
  borderRadius: '1200px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  background: !isParticipating ? theme.palette.ds.primary_500 : theme.palette.ds.secondary_200,
}));

const ItemsGroup = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: '0px',
  gap: '8px',
  width: '100%',
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

const StatusBadge = styled(Box)<{ variant: GovernanceStatusState }>(({ variant, theme }: any) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  padding: '4px 8px',
  gap: '2px',
  width: '58px',
  height: '30px',
  borderRadius: '1200px',
  background:
    variant === GOVERNANCE_STATUS.IDLE || variant === GOVERNANCE_STATUS.DELEGATED
      ? theme.palette.ds.secondary_600
      : variant === GOVERNANCE_STATUS.DISABLED
        ? theme.palette.ds.gray_600
        : theme.palette.ds.gray_400,
}));

const CtaSet = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: '0px',
  gap: '8px',
  width: '100%',
  height: 'auto',
}));
