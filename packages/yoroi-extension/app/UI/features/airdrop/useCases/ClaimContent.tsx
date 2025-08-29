import { Box, Checkbox, FormControlLabel, Divider, Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useIntl, defineMessages } from 'react-intl';
import { useState, useRef, useEffect } from 'react';
import Terms from './Terms';
import { ClaimInfo1 } from './ClaimInfo';

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
});

interface Props {
  alloc: string;
  destAddrBech32: string;
  isClaimDialog: boolean;
  showClaimDialog: () => void;
}

export default function ClaimContent(props: Readonly<Props>) {
  const { alloc, destAddrBech32, isClaimDialog, showClaimDialog } = props;
  const [isTermsAgreed, setIsTermsAgreed] = useState<boolean>(false);
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
          <ClaimInfo1 destAddrBech32={destAddrBech32} alloc={alloc} />
          <Terms />
          <FormControlLabel
            label={intl.formatMessage(messages.agree)}
            control={
              <Checkbox
                checked={isTermsAgreed}
                onChange={() => {
                  setIsTermsAgreed(!isTermsAgreed);
                }}
                sx={{ marginRight: '8px' }}
              />
            }
            sx={{
              marginTop: '24px',
              color: 'ds.text_gray_medium',
            }}
          />
        </Box>
      </Box>

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
    </>
  );
}
