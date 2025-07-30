import { Box, Typography, Checkbox, FormControlLabel } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useIntl, defineMessages } from 'react-intl';
import { useState } from 'react';
import Terms from './Terms';
import { ReactComponent as ErrorTriangleIcon } from '../../../../assets/images/revamp/error.triangle.svg';
import { ClaimInfo1 } from './ClaimInfo';

const messages = defineMessages({
  agree: {
    id: 'airdrop.agree',
    defaultMessage: '!!!By checking this box I confirm that I have read and understood the Glacier Drop terms and conditions for this claim.',
  },
  claim: {
    id: 'airdrop.claim',
    defaultMessage: '!!!claim allocation',
  },
  trezorTitle: {
    id: 'airdrop.trezorTitle',
    defaultMessage: '!!!Trezor not supported',
  },
  trezorText: {
    id: 'airdrop.trezorText',
    defaultMessage: '!!!Claiming is currently unavailable for Trezor users. Please use a different wallet to proceed.',
  },
});

interface Props {
  alloc: string,
  isTrezor: boolean,
  destAddrBech32: string,
  isClaimDialog: boolean,
  showClaimDialog: () => void,
}

export default function ClaimContent(props: Props) {
  const { alloc, isTrezor, destAddrBech32, isClaimDialog, showClaimDialog } = props;
  const [isTermsAgreed, setTermsAgreed] = useState<boolean>(false);

  const intl = useIntl();
  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'row', flexGrow: 1}}>
        <Box
          sx={{
            marginLeft: 'auto',
            marginRight: 'auto',
            width: '612px',
          }}
        >
          <ClaimInfo1 destAddrBech32={destAddrBech32} alloc={alloc} isTrezor={isTrezor}/>
          {!isTrezor ? (
            <>
              <Terms />
              <FormControlLabel
                label={intl.formatMessage(messages.agree)}
                control={
                  <Checkbox
                    checked={isTermsAgreed}
                    onChange={()=>{ setTermsAgreed(!isTermsAgreed); }}
                    sx={{ marginRight: '8px' }}
                  />
                }
                sx={{
                  marginTop: '24px',
                  color: 'ds.text_gray_medium',
                }}
              />
            </>
          ) : ( // if trezor
            <Box
              sx={{
                borderRadius: '8px',
                bgcolor: 'ds.sys_magenta_100',
                padding: '24px',
                marginTop: '24px',
              }}
            >
              <Box>
                {/*  @ts-ignore */}
                <Box as="span" sx={{ verticalAlign: 'middle' }}>
                  <ErrorTriangleIcon/>
                </Box>
                {/*  @ts-ignore */}
                <Typography
                  sx={{ verticalAlign: 'middle' }}
                  as="span" variant="body1"
                  fontWeight={500}
                  color="ds.sys_magenta_500"
                >
                  {intl.formatMessage(messages.trezorTitle)}
                </Typography>
              </Box>
              <Typography variant="body1" color="ds.text_gray_medium">
                {intl.formatMessage(messages.trezorText)}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      {!isTrezor && (
        <Box sx={{ height: '96px', display: 'flex' }}>
          <LoadingButton
            //  @ts-ignore
            variant="primary"
            sx={{ margin: 'auto' }}
            disabled={!isTermsAgreed}
            loading={isClaimDialog}
            onClick={showClaimDialog}
          >
            {intl.formatMessage(messages.claim)}
          </LoadingButton>
        </Box>
      )}
    </>
  );
}
