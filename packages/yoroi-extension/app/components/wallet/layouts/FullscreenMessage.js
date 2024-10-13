// @flow
import type { Node } from 'react';
import { Component } from 'react';
import VerticallyCenteredLayout from '../../layout/VerticallyCenteredLayout';
import FullscreenLayout from '../../layout/FullscreenLayout';
import { observer } from 'mobx-react';
import { Box, Stack, Typography } from '@mui/material';

type Props = {|
  +title: string | Node,
  +subtitle: string | Node,
  +image?: Node,
|};

@observer
export default class FullscreenMessage extends Component<Props> {
  static defaultProps: {| image: void |} = {
    image: undefined,
  };

  render(): Node {
    const { title, subtitle, image } = this.props;
    return (
      <FullscreenLayout bottomPadding={57}>
        <VerticallyCenteredLayout>
          <Stack
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            sx={{
              '& a': {
                color: 'primary.500',
              },
            }}
          >
            {image && <Box mb="32px">{image}</Box>}
            <Typography component="div" variant="h5" mb="8px" fontWeight={500}>
              {title}
            </Typography>
            <Typography component="div" variant="body1" color="grayscale.600" maxWidth="480px">
              {subtitle}
            </Typography>
          </Stack>
        </VerticallyCenteredLayout>
      </FullscreenLayout>
    );
  }
}
