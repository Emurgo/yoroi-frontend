// @flow
import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import { Box } from '@mui/material';
import IntroBanner from '../../components/profile/language-selection/IntroBanner';
import environment from '../../environment';
import OptForAnalyticsForm from '../../components/profile/terms-of-use/OptForAnalyticsForm';
import type { StoresProps } from '../../stores';

@observer
export default class OptForAnalyticsPage extends Component<StoresProps> {
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
