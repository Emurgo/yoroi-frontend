import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { CopyButton } from '../../../../../components';
import { useStrings } from '../../../common/hooks/useStrings';

export const MetadataTab = ({ hash, metadata }) => {
  const strings = useStrings();
  return (
    <Stack m="24px" mr="0">
      <Stack direction="row" gap="16px" maxWidth="450px" mb="24px">
        <Typography variant="body1" color="ds.gray_600">
          {strings.wallet}
        </Typography>
        <Typography variant="body1" color="ds.text_gray_medium" sx={{ wordWrap: 'break-word' }} maxWidth="450px">
          {hash}
        </Typography>
      </Stack>

      <Stack p="16px" sx={{ backgroundColor: 'ds.bg_color_contrast_min', borderRadius: '8px' }} width="100%">
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb="8px">
          <Typography variant="body1" color="ds.text_gray_medium" fontWeight={500}>
            {strings.metadata}
          </Typography>
          <CopyButton textToCopy={JSON.stringify(metadata, null, 2)} />
        </Stack>

        <Box
          sx={{
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            padding: '8px',
            borderRadius: '4px',
          }}
        >
          <Typography variant="body1" component="pre">
            {metadata ? JSON.stringify(metadata, null, 2) : strings.missingMetadata}
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
};
