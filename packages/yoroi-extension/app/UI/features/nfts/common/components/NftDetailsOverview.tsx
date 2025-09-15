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
  const descriptionPathTestID = `${nftOverviewPathId}:description`;
  const authorPathTestID = `${nftOverviewPathId}:author`;
  const fingerprintPathTestId = `${nftOverviewPathId}:fingerprint`;
  const policyIdPathTestId = `${nftOverviewPathId}:policyId`;
  const linkPathTestId = `${nftOverviewPathId}:explorerLink`;

  return (
    <Stack spacing={24}>
      <LabelWithValue
        label={strings.description}
        value={nftInfo.description || '-'}
        pathId={descriptionPathTestID}
      />
      <LabelWithValue label={strings.author} value={nftInfo.author || '-'} pathId={authorPathTestID} />
      <LabelWithValue
        label={strings.fingerprint}
        value={<CopyableText value={nftInfo.id} pathTestId={fingerprintPathTestId}>{displayAddrTruncated(nftInfo.id, truncate)}</CopyableText>}
        pathId={fingerprintPathTestId}
      />
      <LabelWithValue
        label={strings.policyId}
        value={<CopyableText value={nftInfo.policyId} pathTestId={policyIdPathTestId}>{displayAddrTruncated(nftInfo.policyId, truncate)}</CopyableText>}
        pathId={policyIdPathTestId}
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
          pathId={linkPathTestId}
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
      <Typography component="div" color="ds.el_gray_low" id={`${pathId}-label-text`}>
        {label}
      </Typography>
      <Typography
        component="div"
        color="ds.el_gray_medium"
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        id={`${pathId}-value-component`}
      >
        {value}
      </Typography>
    </Box>
  );
}
