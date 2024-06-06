// @flow
import React from 'react';
import { Stack, Box, Typography, Link, Button } from '@mui/material';
import { Skeleton } from '../../../../components/Skeleton';
import { CopyButton } from '../../../../components/buttons/CopyButton';
import { useTheme } from '@mui/material/styles';
import tokenPng from '../../common/assets/images/token.png';
import { useStrings } from '../../common/useStrings';

const TokenDetailOverview = ({ tokenInfo, isLoading, isAda }) => {
  const theme = useTheme();
  const strings = useStrings();

  return (
    <Stack direction="column" spacing={theme.spacing(2)}>
      <Stack direction="row" alignItems="center" spacing={theme.spacing(1)}>
        {isLoading ? (
          <Skeleton width="32px" height="32px" />
        ) : (
          <Box
            width="32px"
            height="32px"
            sx={{
              backgroundColor: theme.palette.ds.gray_c300,
              borderRadius: `${theme.shape.borderRadius}px`,
            }}
            component="img"
            src={tokenPng}
          ></Box>
        )}
        {isLoading ? (
          <Skeleton width="53px" height="16px" />
        ) : (
          <Typography fontWeight="500" color="ds.gray_c900">
            {tokenInfo.name}
          </Typography>
        )}
      </Stack>

      <Stack direction="column" spacing={theme.spacing(0.5)}>
        {isLoading ? (
          <Skeleton width="53px" height="16px" />
        ) : (
          <Typography fontWeight="500" color="ds.gray_c900">
            {strings.description}
          </Typography>
        )}
        {isLoading ? (
          <>
            <Skeleton height="20px" width="full" />
            <Skeleton height="20px" width="full" />
            <Skeleton height="20px" width="127px" />
          </>
        ) : (
          <Typography color="ds.gray_c600">{tokenInfo.overview.description}</Typography>
        )}
      </Stack>

      <Stack direction="column" spacing={theme.spacing(0.5)}>
        {isLoading ? (
          <Skeleton width="53px" height="16px" />
        ) : (
          <Typography fontWeight="500" color="ds.gray_c900">
            {strings.website}
          </Typography>
        )}
        {isLoading ? (
          <Skeleton width="127px" height="20px" />
        ) : (
          <Link href={tokenInfo.overview.website} target="_blank" rel="noopener noreferrer" style={{ width: 'fit-content' }}>
            cardano.org
          </Link>
        )}
      </Stack>

      {isAda ? null : (
        <>
          <Stack direction="column" spacing={theme.spacing(0.5)}>
            {isLoading ? (
              <Skeleton width="84px" height="20px" />
            ) : (
              <Typography fontWeight="500" color="ds.gray_c900">
                {strings.policyId}
              </Typography>
            )}

            <Stack direction="row" alignItems="flex-start" spacing={theme.spacing(2)}>
              {isLoading ? (
                <Box flex={1}>
                  <Skeleton height="20px" width="full" />
                  <Skeleton height="16px" width="53px" sx={{ marginTop: '5px' }} />
                </Box>
              ) : (
                <Typography color="ds.gray_c600" sx={{ wordBreak: 'break-word' }}>
                  {tokenInfo.overview.policyId}
                </Typography>
              )}
              <CopyButton disabled={isLoading} textToCopy={`${tokenInfo.overview.policyId}`} />
            </Stack>
          </Stack>

          <Stack direction="column" spacing={theme.spacing(0.5)}>
            {isLoading ? (
              <Skeleton width="84px" height="20px" />
            ) : (
              <Typography fontWeight="500" color="ds.gray_c900">
                {strings.fingerprint}
              </Typography>
            )}

            <Stack direction="row" alignItems="flex-start" spacing={theme.spacing(2)}>
              {isLoading ? (
                <Box flex={1}>
                  <Skeleton height="20px" width="full" />
                  <Skeleton height="16px" width="53px" sx={{ marginTop: '5px' }} />
                </Box>
              ) : (
                <Typography color="ds.gray_c600" sx={{ wordBreak: 'break-word' }}>
                  {tokenInfo.overview.fingerprint}
                </Typography>
              )}
              <CopyButton disabled={isLoading} textToCopy={`${tokenInfo.overview.fingerprint}`} />
            </Stack>
          </Stack>
        </>
      )}

      <Stack direction="column" spacing={theme.spacing(0.5)}>
        {isLoading ? (
          <Skeleton width="53px" height="16px" />
        ) : (
          <Typography fontWeight="500" color="ds.gray_c900">
            {strings.detailsOn}
          </Typography>
        )}
        <Stack direction="row" alignItems="center" spacing={theme.spacing(2)}>
          {isLoading ? (
            <Skeleton width="127px" height="20px" />
          ) : (
            <Link href={tokenInfo.overview.detailOn} target="_blank" rel="noopener noreferrer">
              Cardanoscan
            </Link>
          )}
          {isLoading ? (
            <Skeleton width="60px" height="20px" />
          ) : (
            <Link href={tokenInfo.overview.detailOn} target="_blank" rel="noopener noreferrer">
              Adaex
            </Link>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default TokenDetailOverview;
