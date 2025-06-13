import { useState } from 'react';
import { Nft } from '../types';
import { Button, Typography } from '@mui/material';
import { IconWrapper, Icons } from '../../../../components';
import { useStrings } from '../hooks/useStrings';

export default function NftMetadata({ nftInfo }: { nftInfo: Nft | null }) {
  const [isCopied, setIsCopied] = useState(false);
  const strings = useStrings();

  if (!nftInfo) return null;

  if (!nftInfo.metadata?.assetMintMetadata) {
    return <Typography variant="body2">Metadata is missing</Typography>;
  }

  const mintMetadata = nftInfo.metadata?.assetMintMetadata[0];

  const handleCopy = () => {
    setIsCopied(true);
    navigator.clipboard.writeText(JSON.stringify(mintMetadata, null, 2));
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  return (
    <div>
      <Button
        variant="text"
        onClick={handleCopy}
        endIcon={<IconWrapper color="ds.el_gray_medium" icon={isCopied ? Icons.Copied : Icons.Copy} />}
        id="nftDetails:metadata-copy-button"
      >
        <Typography color="ds.el_gray_medium" variant="body2" lineHeight="22px">
          {strings.copyMetadata}
        </Typography>
      </Button>
      <Typography component="pre" variant="body2" lineHeight="22px" id="nftDetails:metadata-info-text">
        {JSON.stringify(mintMetadata, null, 2)}
      </Typography>
    </div>
  );
}
