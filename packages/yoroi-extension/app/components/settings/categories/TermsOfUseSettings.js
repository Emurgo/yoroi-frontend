// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import TermsOfUseText from '../../profile/terms-of-use/TermsOfUseText';
import { Box } from '@mui/material';
import { withLayout } from '../../../styles/context/layout';
import type { InjectedLayoutProps } from '../../../styles/context/layout';

type Props = {|
  +localizedTermsOfUse: string,
|};

@observer
class TermsOfUseSettings extends Component<Props & InjectedLayoutProps> {
  render(): Node {
    const { localizedTermsOfUse, isRevampLayout } = this.props;
    return (
      <Box
        sx={
          isRevampLayout && {
            maxWidth: '612px',
            mx: 'auto',
          }
        }
      >
        <TermsOfUseText localizedTermsOfUse={localizedTermsOfUse} />
      </Box>
    );
  }
}

export default (withLayout(TermsOfUseSettings): ComponentType<Props>);
