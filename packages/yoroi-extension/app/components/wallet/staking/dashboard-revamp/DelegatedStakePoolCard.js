// @flow
import type { ComponentType, Node } from 'react';
import { Box, styled } from '@mui/system';
import { Button, Typography } from '@mui/material';
import { toSvg } from 'jdenticon';
import { injectIntl } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import { HelperTooltip, SocialMediaStakePool } from './StakePool/StakePool';
import type { PoolData } from '../../../../containers/wallet/staking/SeizaFetcher';

type Props = {|
  delegatedPool: PoolData,
  +undelegate: void | (void => Promise<void>),
|};

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

function DelegatedStakePoolCard({ delegatedPool, undelegate, intl }: Props & Intl): Node {
  const { id, name, ticker, avatar, roa, socialLinks, websiteUrl } = delegatedPool || {};
  const avatarSource = toSvg(id, 36, { padding: 0 });
  const avatarGenerated = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSource)}`;

  return (
    <Wrapper>
      <AvatarWrapper>
        {avatar != null ? (
          <AvatarImg src={avatar} alt="stake pool logo" />
        ) : (
          <AvatarImg src={avatarGenerated} alt="stake pool logo" />
        )}
      </AvatarWrapper>
      <Box width="180px" overflow="hidden" paddingLeft="4px">
        <Typography color="var(--yoroi-palette-gray-900)" variant="body1" mb="3px">
          [{ticker}] {name}
        </Typography>
        <SocialMediaStakePool
          color="var(--yoroi-palette-gray-600)"
          websiteUrl={websiteUrl}
          socialLinks={socialLinks}
        />
      </Box>
      <Box display="flex" alignItems="center" flex="1">
        {roa !== undefined && (
          <>
            <Typography variant="body1" color="var(--yoroi-palette-gray-600)">
              {intl.formatMessage(globalMessages.roa30d)}
              <Typography ml="8px" as="span" color="var(--yoroi-palette-gray-900)">
                {roa}
              </Typography>
            </Typography>
            <HelperTooltip message={intl.formatMessage(globalMessages.roaHelperMessage)} />
          </>
        )}
      </Box>
      {undelegate && (
        <UndelegateButton color="secondary" onClick={undelegate}>
          {intl.formatMessage(globalMessages.undelegateLabel)}
        </UndelegateButton>
      )}
    </Wrapper>
  );
}
export default (injectIntl(observer(DelegatedStakePoolCard)): ComponentType<Props>);

const Wrapper: any = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
});
const AvatarWrapper: any = styled(Box)({
  width: '40px',
  height: '40px',
  minWidth: '40px',
  marginRight: '12px',
  borderRadius: '20px',
  overflow: 'hidden',
});
const AvatarImg: any = styled('img')({
  width: '100%',
  background: 'white',
  objectFit: 'scale-down',
});
const UndelegateButton: any = styled(Button)({
  minWidth: 'auto',
  width: 'unset',
  marginLeft: 'auto',
});
