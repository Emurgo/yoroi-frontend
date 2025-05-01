// @flow
import { Box } from '@mui/system';
import { observer } from 'mobx-react';
import type { Node } from 'react';
import { Component } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { IntlContext } from 'react-intl';
import ThemeToggler from '../../themeToggler';

type Props = {|
|};

@observer
export default class ThemeSettingsBlock extends Component<Props> {
  static contextType:any = IntlContext;
  render(): Node {
    const intl = this.context;
    return (
      <Box
        sx={{
          borderTop: false,
          pb: '20px',
          mt: '10px',
          py: false,
        }}
      >
        <Box sx={{ mt: '20px' }}>
          <ThemeToggler intl={intl}/>
        </Box>
      </Box>
    );
  }
}
