import { Typography } from '@mui/material';
import { useIntl, defineMessages } from 'react-intl';

const messages = defineMessages({
  terms: {
    id: 'airdrop.terms',
    defaultMessage: '!!!Terms & Conditions',
  },
});

export default function Terms() {
  const intl = useIntl();
  return (<>
    <Typography variant="body1" color="ds.text_gray_min" sx={{ marginTop: '32px', marginBottom: '16px' }}>
      {intl.formatMessage(messages.terms)}
    </Typography>
    <Typography variant="body1">
      <Typography fontWeight={500}>1. Acceptance of Terms</Typography>

      <p>By participating in the Midnight Glacier Airdrop ("Airdrop"), you ("Participant") agree to be bound by these Terms of Use ("Terms"). If you do not agree with these Terms, do not participate in the Airdrop.</p>

       <p>&nbsp;</p>
       <Typography fontWeight={500}>2. Eligibility</Typography>

       <p>2.1 Age Requirement: Participants must be at least 18 years old or the age of majority in their jurisdiction, whichever is higher.</p>

       <p>2.2 Jurisdiction: The Airdrop is not available to residents or citizens of countries where participation in cryptocurrency activities is restricted or illegal. It is your responsibility that you comply with your local laws.</p>
       <p>2.3 Verification: Participants may be required to undergo identity</p>

       <p>&nbsp;</p>
       <Typography fontWeight={500}>3. Heading</Typography>

       <p>3.1 Age Requirement: Participants must be at least 18 years old or the age of majority in their jurisdiction, whichever is higher.</p>
    </Typography>
  </>);
}
