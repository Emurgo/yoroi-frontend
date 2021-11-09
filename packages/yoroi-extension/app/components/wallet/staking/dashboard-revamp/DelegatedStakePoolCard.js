// @flow
import type { ComponentType, Node } from 'react';
import { Box, styled } from '@mui/system';
import { Button, Typography } from '@mui/material';
import { toSvg } from 'jdenticon';
import { injectIntl } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import { HelperTooltip } from './StakePool/StakePool';

type Props = {|
  avatar: string,
  roa30d: string,
  id: number,
|};
type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

function DelegatedStakePoolCard({
  id,
  avatar = 'https://static.adapools.org/pool_logo/7f6c103302f96390d478a170fe80938b76fccd8a23490e3b6ddebcf7.png',
  roa30d = ' 5.08%',
  intl,
}: Props & Intl): Node {
  const avatarSource = toSvg(id, 36, { padding: 0 });
  const avatarGenerated = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSource)}`;

  return (
    <Box>
      <AvatarWrapper>
        {avatar ? (
          <AvatarImg src={avatar} alt="stake pool logo" />
        ) : (
          <AvatarImg src={avatarGenerated} alt="stake pool logo" />
        )}
      </AvatarWrapper>
      <Box>
        <Typography variant="body1" color="--yoroi-palette-gray-600">
          {intl.formatMessage(globalMessages.roa30d)}
          <Typography as="span" color="--yoroi-palette-gray-900">
            {roa30d}
          </Typography>
        </Typography>
        <HelperTooltip message={intl.formatMessage(globalMessages.roaHelperMessage)} />
      </Box>
      <Button color="secondary">{intl.formatMessage(globalMessages.undelegateLabel)}</Button>
    </Box>
  );
}
export default (injectIntl(observer(DelegatedStakePoolCard)): ComponentType<Props>);

export const AvatarWrapper: any = styled(Box)({
  width: '40px',
  height: '40px',
  minWidth: '40px',
  marginRight: '12px',
  borderRadius: '20px',
  overflow: 'hidden',
});
export const AvatarImg: any = styled('img')({
  width: '100%',
  background: 'white',
  objectFit: 'scale-down',
});
