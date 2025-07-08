// @flow
import { Box, Skeleton, styled } from '@mui/material';
import { Component } from 'react';
import type { Node } from 'react';
import { ReactComponent as TokenDefaultLight } from '../../../../assets/images/assets-page/token-default-logo.inline.svg';
import { checkNFTImage } from '../../../../utils/wallet';

type Props = {|
  name: string,
  image: string | null,
  width: number | string,
  height: number | string,
|};

type State = {|
  loading: boolean,
  error: boolean,
|};

const IconWrapper = styled(Box)(({ theme }) => ({
  '& svg': {
    '& path:nth-child(1)': {
      fill: theme.palette.ds.bg_color_contrast_min,
    },
    '& path:nth-child(2)': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));

export default class TokenImage extends Component<Props, State> {
  state: State = {
    loading: true,
    error: false,
  };

  componentDidMount() {
    const { image } = this.props;
    if (image === null) return;
    const imageUrl = `data:image/png;base64,${image}`;
    checkNFTImage(
      imageUrl,
      () => {
        this.setState({ loading: false, error: false });
      },
      () => {
        this.setState({ loading: false, error: true });
      }
    );
  }

  render(): Node {
    const { image, name, width, height } = this.props;
    const { loading, error } = this.state;
    if (image === null || error)
      return (
        <IconWrapper>
          <TokenDefaultLight />
        </IconWrapper>
      );
    const imageUrl = `data:image/png;base64,${image}`;

    return loading ? (
      <Skeleton
        width={width}
        height={height}
        variant="rectangular"
        animation="wave"
        sx={{
          backgroundColor: 'var(--yoroi-palette-gray-50)',
          borderRadius: '4px',
        }}
      />
    ) : (
      <img width={width} src={imageUrl} alt={name} loading="lazy" style={{ borderRadius: '4px'}} />
    );
  }
}
