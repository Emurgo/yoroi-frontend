import { Typography } from '@mui/material';
import { useIntl, defineMessages } from 'react-intl';

const messages = defineMessages({
  terms: {
    id: 'airdrop.terms',
    defaultMessage: '!!!Terms & Conditions',
  },
  header1: {
    id: 'airdrop.terms.header1',
    defaultMessage: '!!!1. Acceptance of Terms',
  },
  section1_1: {
    id: 'airdrop.terms.section1_1',
    defaultMessage: '!!!By participating in the Midnight Glacier Airdrop ("Airdrop"), you ("Participant") agree to be bound by these Terms of Use ("Terms"). If you do not agree with these Terms, do not participate in the Airdrop.',
  },
  header2: {
    id: 'airdrop.terms.header2',
    defaultMessage: '!!!2. Eligibility',
  },
  section2_1: {
    id: 'airdrop.terms.section2_1',
    defaultMessage: '!!!2.1 Age Requirement: Participants must be at least 18 years old or the age of majority in their jurisdiction, whichever is higher.',
  },
  section2_2: {
    id: 'airdrop.terms.section2_2',
    defaultMessage: '!!!2.2 Jurisdiction: The Airdrop is not available to residents or citizens of countries where participation in cryptocurrency activities is restricted or illegal. It is your responsibility that you comply with your local laws.',
  },
  section2_3: {
    id: 'airdrop.terms.section2_3',
    defaultMessage: '!!!2.3 Verification: Participants may be required to undergo identity',
  },
});

export default function Terms() {
  const intl = useIntl();
  return (<>
    <Typography variant="body1" color="ds.text_gray_min" sx={{ marginTop: '32px', marginBottom: '16px' }}>
      {intl.formatMessage(messages.terms)}
    </Typography>
    <Typography variant="body1">
      <Typography fontWeight={500}>{intl.formatMessage(messages.header1)}</Typography>

      <p>{intl.formatMessage(messages.section1_1)}</p>

       <p>&nbsp;</p>
       <Typography fontWeight={500}>{intl.formatMessage(messages.header2)}</Typography>

       <p>{intl.formatMessage(messages.section2_1)}</p>

       <p>{intl.formatMessage(messages.section2_2)}</p>
       <p>{intl.formatMessage(messages.section2_3)}</p>
    </Typography>
  </>);
}
