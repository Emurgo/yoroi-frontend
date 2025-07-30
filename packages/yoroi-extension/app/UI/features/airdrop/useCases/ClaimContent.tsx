import { Box, Typography, Checkbox, FormControlLabel, Divider, Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useIntl, defineMessages } from 'react-intl';
import { useState, useRef, useEffect } from 'react';
import Terms from './Terms';
import { ClaimInfo1 } from './ClaimInfo';
import { Icons, IconWrapper } from '../../../components';

const messages = defineMessages({
  agree: {
    id: 'airdrop.agree',
    defaultMessage:
      '!!!By checking this box I confirm that I have read and understood the Glacier Drop terms and conditions for this claim.',
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
  alloc: string;
  isTrezor: boolean;
  destAddrBech32: string;
  isClaimDialog: boolean;
  showClaimDialog: () => void;
}

export default function ClaimContent(props: Props) {
  const { alloc, isTrezor, destAddrBech32, isClaimDialog, showClaimDialog } = props;
  const [isTermsAgreed, setTermsAgreed] = useState<boolean>(false);
  const [hasOverflow, setHasOverflow] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const intl = useIntl();

  useEffect(() => {
    const checkOverflow = () => {
      if (contentRef.current) {
        const { scrollHeight, clientHeight } = contentRef.current;
        setHasOverflow(scrollHeight > clientHeight);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);

    return () => {
      window.removeEventListener('resize', checkOverflow);
    };
  }, []);

  return (
    <>
      <Box
        ref={contentRef}
        sx={{ display: 'flex', flexDirection: 'row', flexGrow: 1, overflowY: 'scroll', margin: 0, padding: 0 }}
      >
        <Box
          sx={{
            marginLeft: 'auto',
            marginRight: 'auto',
            width: '612px',
          }}
        >
          <ClaimInfo1 destAddrBech32={destAddrBech32} alloc={alloc} isTrezor={isTrezor} />
          {!isTrezor ? (
            <>
              <Terms />
              <FormControlLabel
                label={intl.formatMessage(messages.agree)}
                control={
                  <Checkbox
                    checked={isTermsAgreed}
                    onChange={() => {
                      setTermsAgreed(!isTermsAgreed);
                    }}
                    sx={{ marginRight: '8px' }}
                  />
                }
                sx={{
                  marginTop: '24px',
                  color: 'ds.text_gray_medium',
                }}
              />
            </>
          ) : (
            // if trezor
            <Box
              sx={{
                borderRadius: '8px',
                bgcolor: 'ds.sys_magenta_100',
                padding: '24px',
                marginTop: '24px',
              }}
            >
              <Stack direction="row" gap="8px">
                {/*  @ts-ignore */}
                <Box as="span" sx={{ verticalAlign: 'middle' }}>
                  <IconWrapper color="ds.sys_magenta_500" icon={Icons.ErrorTriangle} />
                </Box>
                {/*  @ts-ignore */}
                <Typography
                  sx={{ verticalAlign: 'middle' }}
                  as="span"
                  variant="body1"
                  fontWeight={500}
                  color="ds.sys_magenta_500"
                >
                  {intl.formatMessage(messages.trezorTitle)}
                </Typography>
              </Stack>
              <Typography variant="body1" color="ds.text_gray_medium">
                {intl.formatMessage(messages.trezorText)}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      {!isTrezor && (
        <Stack sx={{ height: '96px', display: 'flex' }}>
          {hasOverflow && <Divider />}
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
        </Stack>
      )}
    </>
  );
}
