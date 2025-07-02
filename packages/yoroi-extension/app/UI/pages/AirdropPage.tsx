import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../../containers/banners/BannerContainer';
import SidebarContainer from '../../containers/SidebarContainer';
import NavBarContainerRevamp from '../../containers/NavBarContainerRevamp';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import { useIntl, defineMessages } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import { Box, Stack, Typography, Checkbox, FormControlLabel, Button } from '@mui/material';

const messages = defineMessages({
  size: {
    id: 'airdrop.size',
    defaultMessage: '!!!Your allocation size',
  },
  destinationAddress: {
    id: 'airdrop.destinationAddress',
    defaultMessage: '!!!Your destination address',
  },
  terms: {
    id: 'airdrop.terms',
    defaultMessage: '!!!Terms & Conditions',
  },
  agree: {
    id: 'airdrop.agree',
    defaultMessage: '!!!By checking this box I confirm that I have read and understood the Glacier Drop terms and conditions for this claim.',
  },
  claim: {
    id: 'airdrop.claim',
    defaultMessage: '!!!claim allocation',
  },
  noAllocTitle: {
    id: 'aidrop.noAllocTitle',
    defaultMessage: '!!!No eligible addresses found in your wallet',
  },
  noAllocText: {
    id: 'aidrop.noAllocText',
    defaultMessage: '!!!None of the addresses provided are eligible for an allocation',
  },
});

interface Props {
  stores: {}
}

export default function AirdropPage({ stores }: Props) {
  const intl = useIntl();

  let content;
  content = (<>
    <Box sx={{ display: 'flex', flexDirection: 'row', flexGrow: 1}}>
      <Box
        sx={{
          marginLeft: 'auto',
          marginRight: 'auto',
          width: '612px',
        }}
      >
        <Box
          sx={{
            borderRadius: '8px',
            bgcolor: 'ds.bg_color_contrast_min',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px'}}>
            <Typography variant="body2" color="ds.text_gray_low">
              {intl.formatMessage(messages.size)}
            </Typography>
            <Typography variant="h1xl">
              0 NIGHT
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px'}}>
            <Typography variant="body2" color="ds.text_gray_low">
              {intl.formatMessage(messages.destinationAddress)}
            </Typography>
            <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
              addr1q9es0m23htwehpcjjtqzyltkhj44lrdnpqcpfuhpthrcjy7v9j033m6ss9sg67yxptvrp5p5h7lhxvsurzwnyuskk7cqe778gt
            </Typography>
          </Box>
        </Box>
        <Typography variant="body1" color="ds.text_gray_min">
          {intl.formatMessage(messages.terms)}
        </Typography>
        <Typography variant="body1">
          <Typography fontWeight={500}>1. Acceptance of Terms</Typography>

          <p>By participating in the [Project Name] Airdrop ("Airdrop"), you ("Participant") agree to be bound by these Terms of Use ("Terms"). If you do not agree with these Terms, do not participate in the Airdrop.</p>

           <Typography fontWeight={500}>2. Eligibility</Typography>

           <p>2.1 Age Requirement: Participants must be at least 18 years old or the age of majority in their jurisdiction, whichever is higher.</p>

           <p>2.2 Jurisdiction: The Airdrop is not available to residents or citizens of countries where participation in cryptocurrency activities is restricted or illegal. It is your responsibility that you comply with your local laws.</p>
           <p>2.3 Verification: Participants may be required to undergo identity</p>

           <Typography fontWeight={500}>3. Heading</Typography>

           <p>3.1 Age Requirement: Participants must be at least 18 years old or the age of majority in their jurisdiction, whichever is higher.</p>
        </Typography>
        <FormControlLabel
          label={intl.formatMessage(messages.agree)}
          control={
            <Checkbox
              checked={true}
              onChange={()=>{}}
              sx={{ marginRight: '8px' }}
            />
          }
          sx={{
            margin: '0px',
            color: 'ds.text_gray_medium',
          }}
        />
      </Box>
    </Box>
    <Box sx={{ height: '96px', display: 'flex' }}>
      <Button
        variant="primary"
        sx={{ margin: 'auto' }}
      >
        {intl.formatMessage(messages.claim)}
      </Button>
    </Box>
  </>);

  content = (
    <Box
      sx={{
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '612px',
        borderRadius: '8px',
        bgcolor: 'ds.bg_color_contrast_min',
        padding: '24px',
      }}
    >
      <Typography variant="h1xl">
        {intl.formatMessage(messages.noAllocTitle)}
      </Typography>
      <Typography variant="body1">
        {intl.formatMessage(messages.noAllocTitle)}
      </Typography>
      <Typography variant="body1">
        <a href="">
          {intl.formatMessage(globalMessages.learnMore)}
        </a>
      </Typography>
    </Box>
  );

  return (
    <TopBarLayout
      banner={<BannerContainer stores={stores}/>}
      sidebar={<SidebarContainer stores={stores}/>}
      navbar={
        <NavBarContainerRevamp
          stores={stores}
          title={<NavBarTitle title={intl.formatMessage(globalMessages.airdrop)}/>}
        />
      }
      showInContainer
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {content}
      </Box>
    </TopBarLayout>
  );
}
