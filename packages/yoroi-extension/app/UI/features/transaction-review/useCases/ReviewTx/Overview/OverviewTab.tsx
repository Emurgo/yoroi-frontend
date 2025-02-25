import Typography from '@mui/material/Typography';
import * as React from 'react';

import { Box, Divider, Stack, styled } from '@mui/material';
import { Portfolio } from '@yoroi/types';
import BigNumber from 'bignumber.js';
import WalletAccountIcon from '../../../../../../components/topbar/WalletAccountIcon';
import { truncateAddress, truncateLongName } from '../../../../../../utils/formatters';
import { Collapsible, Icon } from '../../../../../components';
import CopyableText from '../../../../../components/CopyableText';
import { Quantities } from '../../../../../utils/quantities';
import { useWarningSection } from '../../../common/hooks/useWarningSection';
import { useOperations } from '../../../common/operations';
import { useTxReviewModal } from '../../../module/ReviewTxProvider';

export interface SubMenuOption {
  label: string;
  route: string;
}

const IconWrapper = styled(Box)(({ theme }: any) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_primary_medium,
    },
  },
}));

export const OverviewTab = ({ receiverCustomTitle = null, tx }) => {
  const {
    currentWalletDetails,
    changeModalView,
    stakingAddress,
    operations,
    extraOverviewDetails,
    isStakeRegistered,
    stakeKeyDeposit,
    primaryTokenInfo,
  } = useTxReviewModal();
  const { selected, selectedWalletName } = currentWalletDetails;
  const notOwnedOutputs = React.useMemo(() => tx.outputs.filter(output => !output.ownAddress), [tx.outputs]);
  // const ownedOutputs = React.useMemo(() => tx.outputs.filter(output => output.ownAddress), [tx.outputs]);

  const operationsCerts = useOperations(tx.certificates, isStakeRegistered, stakeKeyDeposit, primaryTokenInfo, operations);

  console.log('operationsCerts', { operationsCerts, operations });

  const warningComp = useWarningSection(operations);

  const { plate } = selected;
  const currentWalletIcon = <WalletAccountIcon iconSeed={plate.ImagePart} saturationFactor={0} size={8} scalePx={4} />;

  const waletInfoDisplay = (
    <Stack
      direction="row"
      alignItems="center"
      gap="8px"
      sx={{
        '& canvas': {
          borderRadius: '4px',
        },
      }}
    >
      {currentWalletIcon}
      <Box
        component="button"
        onClick={() => {
          changeModalView({ modalView: 'walletInfo', title: 'Wallet Details' });
        }}
      >
        <Typography variant="body1" color="ds.text_primary_medium" fontWeight={500}>{`${truncateLongName(
          selectedWalletName,
          33
        )} | ${plate.TextPart}`}</Typography>
      </Box>
    </Stack>
  );

  return (
    <Stack sx={{ padding: '24px' }}>
      {warningComp ? warningComp : <></>}
      <Stack direction="column" gap="8px" mt={warningComp ? '24px' : '0px'}>
        <InfoInline label="Wallet" value={waletInfoDisplay} />
        {/* <InfoInline label="Connected to" value="dapp" /> */}
        <InfoInline
          label="Fee"
          value={`-${new BigNumber(tx.fee.rawQuantity).shiftedBy(-primaryTokenInfo.decimals)} ${primaryTokenInfo.name}`}
        />
      </Stack>

      <Divider sx={{ margin: '24px 0px' }} />

      <MyWalletSection tx={tx} stakingAddress={stakingAddress} notOwnedOutputs={notOwnedOutputs} operationFee={operationsCerts} />

      {receiverCustomTitle !== null && <ExternalPartySection receiverCustomTitle={receiverCustomTitle} />}

      {extraOverviewDetails && <WalletExtraDetails extraDetails={extraOverviewDetails} />}

      {(operationsCerts?.components.length > 0 || operations?.components.length > 0) && (
        <OperationsSection operations={operationsCerts?.components.length > 0 ? operationsCerts : operations} />
      )}
    </Stack>
  );
};

const InfoInline = ({ label, value }) => {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body1" color="ds.text_gray_low">
        {label}
      </Typography>
      <Typography variant="body1" color="ds.text_gray_medium">
        {value}
      </Typography>
    </Stack>
  );
};

const MyWalletSection = ({ tx, stakingAddress, notOwnedOutputs, operationFee }) => {
  return (
    <Box>
      <Collapsible
        expanded={true}
        title="Your Wallet"
        content={
          <Stack gap="12px">
            <CopyableText value={stakingAddress}>
              <Typography>{truncateAddress(stakingAddress)}</Typography>
            </CopyableText>
            <MyWalletTokens tx={tx} notOwnedOutputs={notOwnedOutputs} operationFee={operationFee} />
          </Stack>
        }
      />
    </Box>
  );
};

const ExternalPartySection = ({ receiverCustomTitle }) => {
  return (
    <Stack mt="16px" direction="row" alignItems="center" justifyContent="space-between">
      <Typography variant="body1" fontWeight={500} color="ds.text_gray_medium">
        To:
      </Typography>
      {receiverCustomTitle}
    </Stack>
  );
};

const OperationsSection = ({ operations }) => {
  const componentsNotDuplicated = operations?.components
    .filter(component => !component.duplicated)
    .map(({ component }) => component);

  return (
    <Box>
      <Divider sx={{ margin: '24px 0px' }} />

      <Collapsible
        expanded={true}
        title="Operations"
        content={
          <Box>
            {[...componentsNotDuplicated].map((operation, index) => {
              if (index === 0) return operation;

              return <>{operation}</>;
            })}
          </Box>
        }
      />
    </Box>
  );
};

const MyWalletTokens = ({ tx, notOwnedOutputs, operationFee }) => {
  const { primaryTokenInfo } = useTxReviewModal();
  const totalPrimaryTokenSent = React.useMemo(
    () =>
      notOwnedOutputs
        .flatMap(output => output.assets.filter(asset => asset.tokenInfo.nature === Portfolio.Token.Nature.Primary))
        .reduce((previous, current) => Quantities.sum([previous, current.quantity]), Quantities.zero),
    [notOwnedOutputs]
  );
  console.log('operationFeeoperationFeeoperationFeeoperationFee', operationFee);
  const totalPrimaryTokenSpent = React.useMemo(
    () => Quantities.sum([totalPrimaryTokenSent, tx.fee.quantity, operationFee.totalFee]),
    [totalPrimaryTokenSent, tx.fee.quantity, operationFee]
  );

  const formatedFee = new BigNumber(totalPrimaryTokenSpent).shiftedBy(-primaryTokenInfo.decimals).toString();

  return (
    <Stack direction="row" sx={{ display: 'flex', flexWrap: 'wrap' }} gap="8px">
      <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
        <Stack direction="row" alignItems="center" gap="4px">
          <IconWrapper>
            <Icon.Send />
          </IconWrapper>
          <Typography fontWeight="500">Send</Typography>
        </Stack>
        <Box sx={{ padding: '4px 12px', backgroundColor: 'ds.primary_500', borderRadius: '8px' }}>
          <Typography color="ds.white_static">
            {formatedFee} {primaryTokenInfo.name}
          </Typography>
        </Box>
      </Stack>

      {/* {notPrimaryTokenSent.length > 0 && notPrimaryTokenSent.map(item => <TokenItem label={item} isPrimaryToken={false} />)} */}
    </Stack>
  );
};

const WalletExtraDetails = ({ extraDetails }) => {
  return (
    <Box component="button" width="100%" mt="24px" onClick={extraDetails.onClick}>
      <Typography fontWeight="500" color="ds.text_primary_medium" textAlign="right">
        {extraDetails.title}
      </Typography>
    </Box>
  );
};
