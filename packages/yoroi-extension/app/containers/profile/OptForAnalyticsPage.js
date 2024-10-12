// @flow
import type { Node } from 'react';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import { Box } from '@mui/material';
import IntroBanner from '../../components/profile/language-selection/IntroBanner';
import environment from '../../environment';
import OptForAnalyticsForm from '../../components/profile/terms-of-use/OptForAnalyticsForm';

@observer
export default class OptForAnalyticsPage extends Component<StoresAndActionsProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    return (
      <Box height="100vh" paddingBottom="24px" sx={{ overflowY: 'auto' }}>
        <IntroBanner isNightly={environment.isNightly()} />
        <OptForAnalyticsForm
          onOpt={this.props.stores.profile.onOptForAnalytics}
          variant="startup"
          isOptedIn={false}
        />
      </Box>
    );
  }
}
