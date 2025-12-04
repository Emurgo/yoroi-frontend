import React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Box, Typography, IconButton, Link, Stack } from '@mui/material';
import { CopyButton, Icon } from '../../../../components';
import { useStrings } from '../../common/hooks/useStrings';
import { LoadingButton } from '@mui/lab';
import {
  DREP_ALWAYS_ABSTAIN,
  DREP_ALWAYS_NO_CONFIDENCE,
  GOVERNANCE_STATUS,
  GovernanceStatusState,
  YOROI_DREP_ID,
  YOROI_DREP_ID_TESTNET,
  YOROI_VOTING_RECORD_LINK,
} from '../../common/constants';
import { truncateFormatter } from '../../../../common/helpers/formatters';
import { useIsGovernanceAllowed } from '../../common/hooks/useIsGovernanceAllowed';
import { useGovernance } from '../../module/GovernanceContextProvider';

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
  const { isTestnet } = useGovernance();
  const strings = useStrings();
  const theme: any = useTheme();

  const yoroiDrepId = isTestnet ? YOROI_DREP_ID_TESTNET : YOROI_DREP_ID;
  const drepID = governanceStatus?.drep ? governanceStatus?.drep : yoroiDrepId;
  const isDelegationToYoroiDrep = isDelegated && drepID === yoroiDrepId;
  const isDelegationToOtherDrep = isDelegated && drepID !== yoroiDrepId;
  const isAbstain = governanceStatus?.drep === null && governanceStatus?.status === DREP_ALWAYS_ABSTAIN;
  const isNoConfidence = governanceStatus?.drep === null && governanceStatus?.status === DREP_ALWAYS_NO_CONFIDENCE;
  const primaryButtonLabel = forModal ? strings.delegateLabel : isDelegated ? strings.changeToDrep : strings.delegateLabel;
  const showDrepStatus = isDelegationToOtherDrep || isDelegationToYoroiDrep || !isParticipating;
  const showDrepId = isDelegationToOtherDrep || isDelegationToYoroiDrep;
  const showDelegatingLabel = isParticipating;
  const showDelegateToOtherDrepButton = isAbstain || isNoConfidence;
  const showDelegateToYoroiDrepButton = forModal || (governanceStatus?.status === GOVERNANCE_STATUS.IDLE && !isDelegated);
  const showVotingRecordLink = !forModal && !isAbstain && !isNoConfidence && !isDelegationToOtherDrep;

  const handleDelegateClick = () => {
    if (isDisabled) return;
    onDelegateClick?.();
  };

  const handleCardInfo = () => {
    if (isDelegationToYoroiDrep) {
      return {
        icon: <Icon.YoroiLogo width={24} height={24} fill={theme.palette.ds.gray_min} />,
        title: isTestnet ? strings.yoroiTestnetDRep : strings.yoroiDRep,
        description: strings.yoroiDRepInfo,
      };
    }
    if (isDelegationToOtherDrep) {
      return {
        icon: <Icon.VotingDrep width={24} height={24} fill={theme.palette.ds.gray_max} />,
        title: strings.otherDReps,
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
      icon: <Icon.YoroiLogo width={24} height={24} fill={theme.palette.ds.gray_min} />,
      title: isTestnet ? strings.yoroiTestnetDRep : strings.yoroiDRep,
      description: strings.yoroiDRepInfo,
    };
  };

  return (
    <Root state={state} forModal={forModal} isAbstain={isAbstain} isNoConfidence={isNoConfidence}>
      <TitleRow>
        <Avatar state={state} isDelegationToYoroiDrep={isDelegationToYoroiDrep} isParticipating={isParticipating}>
          {handleCardInfo().icon}
        </Avatar>

        <Typography maxWidth={'600px'} variant={forModal ? 'body1' : 'h5'} color={isDisabled ? 'ds.gray_600' : 'ds.gray_900'}>
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
        {showDelegateToYoroiDrepButton && (
          <LoadingButton
            fullWidth
            loading={btnLoading}
            /* @ts-ignore */
            variant="primary"
            disabledVisual={isDisabled}
            disabled={isDisabled}
            onClick={handleDelegateClick}
          >
            {primaryButtonLabel}
          </LoadingButton>
        )}
        {showVotingRecordLink && (
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

const Avatar = styled(Box)<{ state: GovernanceStatusState; isDelegationToYoroiDrep: boolean; isParticipating: boolean }>(
  ({ isDelegationToYoroiDrep, theme, isParticipating }: any) => ({
    width: '48px',
    height: '48px',
    borderRadius: '1200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    background: !isParticipating || isDelegationToYoroiDrep ? theme.palette.ds.primary_500 : theme.palette.ds.secondary_200,
  })
);

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
