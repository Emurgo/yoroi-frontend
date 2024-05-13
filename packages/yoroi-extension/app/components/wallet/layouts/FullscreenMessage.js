// @flow
import type { Node, ComponentType } from 'react';
import { Component } from 'react';
import styles from './FullscreenMessage.scss';
import VerticallyCenteredLayout from '../../layout/VerticallyCenteredLayout';
import FullscreenLayout from '../../layout/FullscreenLayout';
import { observer } from 'mobx-react';
import { withLayout } from '../../../styles/context/layout';
import type { InjectedLayoutProps } from '../../../styles/context/layout';
import { Box, Stack, Typography } from '@mui/material';

type Props = {|
  +title: string | Node,
  +subtitle: string | Node,
  +image?: Node,
|};

@observer
class FullscreenMessage extends Component<Props & InjectedLayoutProps> {
  static defaultProps: {| image: void |} = {
    image: undefined,
  };

  render(): Node {
    const { title, subtitle, image, renderLayoutComponent } = this.props;
    const classicLayout = (
      <FullscreenLayout bottomPadding={57}>
        <VerticallyCenteredLayout>
          <div className={styles.component}>
            <div className={styles.title}>{title}</div>
            <br />
            <div className={styles.subtitle}>{subtitle}</div>
          </div>
        </VerticallyCenteredLayout>
      </FullscreenLayout>
    );

    const revampLayout = (
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

    return renderLayoutComponent({
      CLASSIC: classicLayout,
      REVAMP: revampLayout,
    });
  }
}

export default (withLayout(FullscreenMessage): ComponentType<Props>);
