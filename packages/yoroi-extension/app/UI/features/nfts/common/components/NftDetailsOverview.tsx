import React from 'react';
import { Box, Stack, Typography, Link } from '@mui/material';
import { useStrings } from '../hooks/useStrings';
import { NetworkUrl, Nft } from '../types';
import { displayAddrTruncated } from '../../../../utils/common';
import { useMediaQuery } from '@mui/material';
import CopyableText from '../../../../components/CopyableText';

const nftOverviewPathId = 'nftDetails:overview';

type NftDetailsOverviewProps = {
  nftInfo: Nft | null;
  networkUrl: NetworkUrl | null;
};

export default function NftDetailsOverview({ nftInfo, networkUrl }: NftDetailsOverviewProps) {
  const strings = useStrings();
  const below1400 = useMediaQuery('(max-width:1400px)');
  const below1250 = useMediaQuery('(max-width:1250px)');

  if (!nftInfo) return null;

  const truncate = below1250 ? 'short' : below1400 ? 'long' : 'none';

  return (
    <Stack spacing={24}>
      <LabelWithValue
        label={strings.description}
        value={nftInfo.description || '-'}
        pathId={`${nftOverviewPathId}-description-text`}
      />
      <LabelWithValue label={strings.author} value={nftInfo.author || '-'} pathId={`${nftOverviewPathId}-author-text`} />
      <LabelWithValue
        label={strings.fingerprint}
        value={<CopyableText value={nftInfo.id}>{displayAddrTruncated(nftInfo.id, truncate)}</CopyableText>}
        pathId={`${nftOverviewPathId}-fingerprint-component`}
      />
      <LabelWithValue
        label={strings.policyId}
        value={<CopyableText value={nftInfo.policyId}>{displayAddrTruncated(nftInfo.policyId, truncate)}</CopyableText>}
        pathId={`${nftOverviewPathId}-policyId-component`}
      />

      {networkUrl && (
        <LabelWithValue
          label={strings.detailsOn}
          value={
            <Link
              target="_blank"
              href={`${networkUrl.cardanoScan}/${nftInfo.policyId}${nftInfo.assetName}`}
              rel="noopener noreferrer"
              sx={{ textDecoration: 'none' }}
            >
              {strings.cardanoScan}
            </Link>
          }
          pathId={`${nftOverviewPathId}-explorer-link`}
        />
      )}
    </Stack>
  );
}

type LabelWithValueProps = {
  label: string;
  value: string | React.ReactNode;
  pathId: string;
};

function LabelWithValue({ label, value, pathId }: LabelWithValueProps): React.ReactNode {
  return (
    <Box>
      <Typography component="div" color="ds.el_gray_low">
        {label}
      </Typography>
      <Typography component="div" color="ds.el_gray_medium" display="flex" alignItems="center" justifyContent="flex-start" id={pathId}>
        {value}
      </Typography>
    </Box>
  );
}
