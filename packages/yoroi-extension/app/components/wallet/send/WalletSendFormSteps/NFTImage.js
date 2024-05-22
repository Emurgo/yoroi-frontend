// @flow
import { Skeleton } from '@mui/material';
import { Component } from 'react';
import { ReactComponent as DefaultNFT } from '../../../../assets/images/nft-no.inline.svg';
import { checkNFTImage } from '../../../../utils/wallet';
import type { Node } from 'react';
import { urlResolveForIpfsAndCorsproxy } from '../../../../coreUtils';

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
export default class NFTImage extends Component<Props, State> {
  state: State = {
    loading: true,
    error: false,
  };

  componentDidMount() {
    const { image } = this.props;
    if (image === null) return;
    const imageUrl = urlResolveForIpfsAndCorsproxy(image);
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
    if (image === null || error) return <DefaultNFT />;
    const imageUrl = urlResolveForIpfsAndCorsproxy(image);

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
      <img width={width} src={imageUrl} alt={name} loading="lazy" />
    );
  }
}
