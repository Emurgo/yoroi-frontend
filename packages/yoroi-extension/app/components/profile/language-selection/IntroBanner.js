// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import { ReactComponent as YoroiRevampLogo } from '../../../assets/images/yoroi-logo-revamp-blue.inline.svg';
import {
  ReactComponent as YoroiRevampNightlyLogo
} from '../../../assets/images/yoroi-logo-revamp-nightly-blue.inline.svg';
import { Box, Typography } from '@mui/material';
import globalMessages from '../../../i18n/global-messages';

type Props = {|
  +isNightly: boolean,
|};

@observer
export default class IntroBanner extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  getRevampLogo: void => string = () => {
    if (this.props.isNightly) return YoroiRevampNightlyLogo;
    return YoroiRevampLogo;
  };

  render(): Node {
    const { intl } = this.context;
    const RevampLogo = this.getRevampLogo();
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          mt: '24px',
        }}
      >
        <Box mb="24px">
          <RevampLogo/>
        </Box>

        <Box textAlign="center">
          <Typography component="div" variant="h1" fontWeight={500} color="primary.600" mb="8px">
            {intl.formatMessage(globalMessages.yoroi)}
          </Typography>
          <Typography component="div" variant="body1" fontWeight={500} color="primary.600">
            {intl.formatMessage(globalMessages.yoroiIntro)}
          </Typography>
        </Box>
      </Box>
    );
  }
}
