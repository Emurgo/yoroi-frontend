import { useReceive } from '../../module/ReceiveContextProvider';
import { Box, Typography, styled } from '@mui/material';
import ExplorableHashContainer from '../../../../../containers/widgets/ExplorableHashContainer';
import CopyableAddress from '../../../../../components/widgets/CopyableAddress';
import QrCodeWrapper from '../../../../../components/widgets/QrCodeWrapper';
import RawHash from '../../../../../components/widgets/hashWrappers/RawHash';
import { useStrings } from '../../common/hooks/useStrings';

const QrCodeBackground = styled(Box)(({ theme }: any) => ({
  background: theme.palette.ds.bg_gradient_1,
}));

export default function SingleAddressMode() {
  const strings = useStrings();
  const { isAddressUsed, walletAddress, selectedExplorerForNetwork } = useReceive();

  const locationId = 'wallet:receive:infoPanel:header';

  return (
    <Box>
      <Typography color="ds.text_gray_medium" mb="24px" variant="body1" fontWeight={500}>
        {strings.walletAddressLabel}
      </Typography>

      <Box display="flex" alignItems="start" justifyContent="center" mb="30px" pb="30px" gap="24px" position="relative">
        <Box display="flex" justifyContent="center" alignItems="center">
          <QrCodeBackground p="16px" borderRadius="16px" height="min-content">
            <Box
              alignItems="flex-start"
              display="flex"
              mx="auto"
              sx={{
                '& canvas': {
                  border: '16px solid',
                  borderRadius: '8px',
                  borderColor: 'common.white',
                  boxSizing: 'content-box',
                  bgcolor: 'common.white',
                },
              }}
            >
              <QrCodeWrapper value={walletAddress} size={153} id={locationId + '-addressQrCode-image'} />
            </Box>
          </QrCodeBackground>
        </Box>
        <Box width="100%">
          <Box mb="8px">
            <CopyableAddress
              id={locationId}
              darkVariant
              sx={{
                justifyContent: 'flex-start',
                alignItems: 'start',
                bgcolor: 'transparent',
                px: '0px',
                pt: '0px',
              }}
              hash={walletAddress}
              elementId=""
              onCopyAddress={() => {}}
              notification={null}
              placementTooltip="bottom-start"
            >
              <ExplorableHashContainer
                selectedExplorer={selectedExplorerForNetwork}
                hash={walletAddress}
                light={isAddressUsed}
                linkType="address"
              >
                <RawHash light={isAddressUsed}>
                  <Typography component="div" variant="body1" color="ds.text_gray_medium">
                    {walletAddress}
                  </Typography>
                </RawHash>
              </ExplorableHashContainer>
            </CopyableAddress>
          </Box>

          <Typography component="div" mb="24px" variant="body2" lineHeight="22px" color="ds.text_gray_low">
            {strings.walletReceiveInstructions}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
