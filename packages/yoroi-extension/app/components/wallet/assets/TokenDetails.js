// @flow
import type { Node, ComponentType } from 'react';
import { Box, styled } from '@mui/system';
import { Avatar, Collapse, Grid, IconButton, Typography } from '@mui/material';
import globalMessages from '../../../i18n/global-messages';
import { injectIntl } from 'react-intl';
import NoAssetLogo from '../../../assets/images/assets-page/asset-no.inline.svg';
import { useState } from 'react';
import ArrowDownSVG from '../../../assets/images/expand-arrow-grey.inline.svg';
import moment from 'moment';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { assetsMessage } from './AssetsList';

type Props = {|
  tokenInfo: void | {|
    policyId: string,
    lastUpdatedAt: any,
    ticker: string,
    type: string,
    name: string,
    id: string,
    amount: string,
  |},
  tokensCount: number,
|};

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};
function TokenDetails({ tokenInfo, tokensCount, intl }: Props & Intl): Node {
  const [expanded, setExpanded] = useState(true);
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  if (tokenInfo == null) return null;
  return (
    <Box>
      <Box
        borderBottom="1px solid var(--yoroi-palette-gray-200)"
        padding="16px 24px"
        backgroundColor="var(--yoroi-palette-common-white)"
      >
        <Typography variant="h5" color="var(--yoroi-palette-gray-600)">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          {intl.formatMessage(globalMessages.tokens)} ({tokensCount}) ->{' '}
          <Typography as="span" variant="h5" color="var(--yoroi-palette-gray-900)" ml="4px">
            {tokenInfo.name}
          </Typography>
        </Typography>
      </Box>
      <Box sx={{ maxWidth: '562px', margin: '0 auto', py: '24px', paddingTop: '57px' }}>
        <Box
          display="flex"
          alignItems="center"
          borderBottom="1px solid var(--yoroi-palette-gray-50)"
          py="20px"
        >
          <Avatar variant="round" sx={{ background: 'white', marginRight: '18px' }}>
            <NoAssetLogo />
          </Avatar>
          <Typography variant="h5" color="var(--yoroi-palette-gray-900)">
            {tokenInfo.name}
          </Typography>
        </Box>
        <Box borderBottom="1px solid var(--yoroi-palette-gray-50)" py="32px">
          <Typography variant="body1" color="var(--yoroi-palette-gray-600)">
            {intl.formatMessage(assetsMessage.quantity)}
          </Typography>
          <Typography variant="h3" fontWeight="500" color="var(--yoroi-palette-gray-900)" mt="6px">
            {tokenInfo.amount}
          </Typography>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          mt="26px"
          py="20px"
          borderBottom="1px solid var(--yoroi-palette-gray-50)"
        >
          <Typography variant="h5" color="var(--yoroi-palette-gray-900)">
            Details
          </Typography>
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ArrowDownSVG />
          </ExpandMore>
        </Box>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Grid
            container
            paddingTop="32px"
            paddingBottom="24px"
            borderBottom="1px solid var(--yoroi-palette-gray-50)"
          >
            <Grid item xs={4}>
              <LabelWithValue label="Ticker" value={tokenInfo.ticker} />
            </Grid>
            <Grid item xs={4}>
              <LabelWithValue
                label="Created"
                value={tokenInfo.lastUpdatedAt ? moment(tokenInfo.lastUpdatedAt).format('LL') : '-'}
              />
            </Grid>
            <Grid item xs={4}>
              <LabelWithValue label="Details on" value={tokenInfo.type} />
            </Grid>
          </Grid>
          <Box marginTop="22px">
            <LabelWithValue label="Identifier" value={tokenInfo.id} />
          </Box>
          <Box marginTop="22px">
            <LabelWithValue label="Policy ID" value={tokenInfo.policyId} />
          </Box>
          {/* TODO: add description */}
          {/* <Box marginTop="22px"> */}
          {/*  <LabelWithValue label="Description" value={'lorem ips'} /> */}
          {/* </Box> */}
        </Collapse>
      </Box>
    </Box>
  );
}

export default (injectIntl(TokenDetails): ComponentType<Props>);

const ExpandMore = styled(props => {
  // eslint-disable-next-line no-unused-vars
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

function LabelWithValue({ label, value }: {| label: string, value: string |}): Node {
  return (
    <Box>
      <Typography color="var(--yoroi-palette-gray-600)">{label}</Typography>
      <Typography color="var(--yoroi-palette-gray-900)">{value}</Typography>
    </Box>
  );
}
