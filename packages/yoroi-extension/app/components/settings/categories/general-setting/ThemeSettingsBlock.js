// @flow
import { Box } from '@mui/system';
import { observer } from 'mobx-react';
import type { Node } from 'react';
import { Component } from 'react';
import ThemeToggler from '../../themeToggler';

type Props = {|
|};

@observer
export default class ThemeSettingsBlock extends Component<Props> {
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
          <ThemeToggler/>
        </Box>
      </Box>
    );
  }
}
