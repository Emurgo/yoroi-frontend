// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import TermsOfUseText from '../../profile/terms-of-use/TermsOfUseText';
import { Box } from '@mui/material';

type Props = {|
  +localizedTermsOfUse: string,
|};

@observer
export default class TermsOfUseSettings extends Component<Props> {
  render(): Node {
    const { localizedTermsOfUse } = this.props;
    return (
      <Box
        sx={{
          maxWidth: '612px',
          mx: 'auto',
        }}
      >
        <TermsOfUseText localizedTermsOfUse={localizedTermsOfUse} />
      </Box>
    );
  }
}
