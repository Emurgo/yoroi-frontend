import Typography from '@mui/material/Typography';
import * as React from 'react';

import { Box, Divider, Stack, styled } from '@mui/material';
import WalletAccountIcon from '../../../../../../components/topbar/WalletAccountIcon';
import { truncateAddress } from '../../../../../../utils/formatters';
import { Collapsible, Icon } from '../../../../../components';
import CopyableText from '../../../../../components/CopyableText';
import { useOperations } from '../../../common/operations';
import { TokenItem } from '../../../common/TokenItem';
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
  const { currentWalletDetails, changeModalView, stakingAddress, operationFee } = useTxReviewModal();
  const { selected, selectedWalletName } = currentWalletDetails;

  const notOwnedOutputs = React.useMemo(() => tx.outputs.filter(output => !output.ownAddress), [tx.outputs]);
  const ownedOutputs = React.useMemo(() => tx.outputs.filter(output => output.ownAddress), [tx.outputs]);
  const operations = useOperations(tx.certificates);

  const { plate } = selected;

  const currentWalletIcon = <WalletAccountIcon iconSeed={plate.ImagePart} saturationFactor={0} size={8} scalePx={4} />;

  const waletInfoDsiplay = (
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
        <Typography
          variant="body1"
          color="ds.text_primary_medium"
          fontWeight={500}
        >{`${selectedWalletName} | ${plate.TextPart}`}</Typography>
      </Box>
    </Stack>
  );

  return (
    <Stack sx={{ padding: '24px' }}>
      <Stack direction="column" gap="8px">
        <InfoInline label="Wallet" value={waletInfoDsiplay} />
        {/* <InfoInline label="Connected to" value="dapp" /> */}
        <InfoInline label="Fee" value={`-${tx.fee.quantity / 1000000} ADA`} />
      </Stack>

      <Divider sx={{ margin: '24px 0px' }} />

      <MyWalletSection
        tx={tx}
        notOwnedOutputs={notOwnedOutputs}
        ownedOutputs={ownedOutputs}
        stakingAddress={stakingAddress}
        operationFee={operationFee}
      />

      {receiverCustomTitle !== null && (
        <ExternalPartySection receiverCustomTitle={receiverCustomTitle} output={notOwnedOutputs[0]} />
      )}

      <OperationsSection operations={operations} />
    </Stack>
  );
};

const InfoInline = ({ label, value }) => {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body1" color="ds.text_gray_low">
        {label}
      </Typography>
      <Typography variant="body1" color="ds.text_gray_medium">
        {value}
      </Typography>
    </Stack>
  );
};

const MyWalletSection = ({ notOwnedOutputs, ownedOutputs, tx, stakingAddress, operationFee }) => {
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
            <MyWalletTokens notOwnedOutputs={notOwnedOutputs} ownedOutputs={ownedOutputs} operationFee={operationFee} />
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
  const componentsNotDuplicated = operations.components
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

const MyWalletTokens = ({ notOwnedOutputs, ownedOutputs, operationFee }) => {
  // const totalPrimaryTokenSpent = '-4.33434 ADA';
  const notPrimaryTokenSent = [];
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
          <Typography color="ds.white_static">{operationFee?.total}</Typography>
        </Box>
      </Stack>

      {notPrimaryTokenSent.length > 0 && notPrimaryTokenSent.map(item => <TokenItem label={item} isPrimaryToken={false} />)}
    </Stack>
  );
};
