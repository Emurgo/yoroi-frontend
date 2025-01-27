import Typography from '@mui/material/Typography';
import * as React from 'react';

import { Box, Divider, Stack, styled } from '@mui/material';
import WalletAccountIcon from '../../../../../../components/topbar/WalletAccountIcon';
import { truncateAddressShort } from '../../../../../../utils/formatters';
import { Collapsible, Icon } from '../../../../../components';
import CopyableText from '../../../../../components/CopyableText';
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

export const OverviewTab = ({ receiverCustomTitle, tx }) => {
  const { currentWalletDetails, changeModalView } = useTxReviewModal();
  const { selected, selectedWalletName } = currentWalletDetails;

  const notOwnedOutputs = React.useMemo(() => tx.outputs.filter(output => !output.ownAddress), [tx.outputs]);
  const ownedOutputs = React.useMemo(() => tx.outputs.filter(output => output.ownAddress), [tx.outputs]);

  const { plate } = selected;

  const currentWalletIcon = <WalletAccountIcon iconSeed={plate.ImagePart} saturationFactor={0} size={8} scalePx={4} />;

  const waletInfoDsiplay = (
    <Stack direction="row" alignItems="center" gap="8px">
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
        <InfoInline label="Fee" value={`${tx.fee.quantity} ADA`} />
      </Stack>

      <Divider sx={{ margin: '24px 0px' }} />

      <MyWalletSection tx={tx} notOwnedOutputs={notOwnedOutputs} ownedOutputs={ownedOutputs} />

      <Divider sx={{ margin: '24px 0px' }} />
      <OperationsSection />
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

const MyWalletSection = ({ notOwnedOutputs, ownedOutputs, tx }) => {
  // console.log('notOwnedOutputs', ownedOutputs, notOwnedOutputs);
  return (
    <Box>
      <Collapsible
        expanded={true}
        title="Your Wallet"
        content={
          <Stack gap="12px">
            <CopyableText value="stake1u9g90x2xqtp4chel0gadzjvjfentxmhskj9k2094zaqe6sqws75rv">
              <Typography>{truncateAddressShort('stake1u9g90x2xqtp4chel0gadzjvjfentxmhskj9k2094zaqe6sqws75rv')}</Typography>
            </CopyableText>
            <MyWalletTokens />
          </Stack>
        }
      />
    </Box>
  );
};
const OperationsSection = () => {
  return (
    <Box>
      <Collapsible
        expanded={true}
        title="Operations"
        content={
          <Stack gap="12px">
            <Typography>Select no confidance</Typography>
          </Stack>
        }
      />
    </Box>
  );
};

const MyWalletTokens = () => {
  return (
    <Stack direction="row" sx={{ display: 'flex', flexWrap: 'wrap' }} gap="8px">
      <Stack direction="row" alignItems="center" gap="32px">
        <Stack direction="row" alignItems="center" gap="4px">
          <IconWrapper>
            <Icon.Send />
          </IconWrapper>
          <Typography fontWeight="500">Send</Typography>
        </Stack>
        <Box sx={{ padding: '4px 12px', backgroundColor: 'ds.primary_500', borderRadius: '8px' }}>
          <Typography color="ds.white_static">-0.22323232 ADA</Typography>
        </Box>
      </Stack>
      {['-10 Token 1', '-50 Token 2', '-100 Token 3', '-1 NFT 1', "-10 Token 1'"].map(item => (
        <TokenItem label={item} isPrimaryToken={false} />
      ))}
    </Stack>
  );
};
