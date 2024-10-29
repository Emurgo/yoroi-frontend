// @flow
import { Box } from '@mui/system';
import { observer } from 'mobx-react';
import type { Node } from 'react';
import { Component } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import environment from '../../../../environment';
import ThemeToggler from '../../themeToggler';

type Props = {|
|};

@observer
export default class ThemeSettingsBlock extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    return (
      <Box
        sx={{
          borderTop: false,
          pb: '20px',
          mt: '10px',
          py: false,
        }}
      >
        {environment.isDev() && (
          <Box sx={{ mt: '20px' }}>
            <ThemeToggler intl={intl} />
          </Box>
        )}
      </Box>
    );
  }
}
