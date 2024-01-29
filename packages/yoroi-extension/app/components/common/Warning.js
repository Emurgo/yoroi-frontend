// @flow
import { Box, Typography } from '@mui/material';
import type { Node } from 'react';
import { ReactComponent as InfoWarningIcon } from '../../assets/images/info-warning.inline.svg';
import { FormattedMessage } from 'react-intl';
import globalMessages from '../../i18n/global-messages';

type Props = {|
  children?: Node,
|};

export default function Warning({ children }: Props): Node {
  return (
    <Box
      sx={{
        p: '12px 15px 16px 16px',
        width: '100%',
        backgroundColor: theme => theme.palette.yellow[100],
        borderRadius: '8px',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '8px' }}>
        <InfoWarningIcon />
        <Typography component="div"
          variant="body1"
          fontWeight={500}
          color={theme => theme.palette.yellow[500]}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FormattedMessage {...globalMessages.attentionTitle} />
        </Typography>
      </Box>

      {children}
    </Box>
  );
}

Warning.defaultProps = {
  children: undefined,
};
