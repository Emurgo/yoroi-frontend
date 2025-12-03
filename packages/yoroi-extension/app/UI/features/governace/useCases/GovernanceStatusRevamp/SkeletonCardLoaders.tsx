import { Box, Skeleton, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard: any = styled(Stack)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '0px',
  gap: '24px',
  width: '612px',
  margin: '0 auto',
  marginTop: '24px',
}));

const CardsRow = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  padding: '0px',
  gap: '24px',
}));

export const StatusSkeletonScreen = () => {
  return (
    <StyledCard>
      <Stack direction={'column'} alignItems="center">
        <Skeleton width={'200px'} variant="text" height="26px" />
        <Skeleton width={'400px'} variant="text" height="26px" />
        <Skeleton width={'300px'} variant="text" height="26px" />
      </Stack>
      <Stack direction={'column'} alignItems="center" gap={16}>
        <Skeleton
          animation="wave"
          variant="rounded"
          width={612}
          height={294}
          sx={{ marginBottom: '22px', backgroundColor: 'ds.gray_100' }}
        />
        <Skeleton
          animation="wave"
          variant="rounded"
          width={612}
          height={82}
          sx={{ marginBottom: '12px', backgroundColor: 'ds.gray_100' }}
        />
      </Stack>
    </StyledCard>
  );
};

export const OptionsSkeletonScreen = () => {
  return (
    <CardsRow>
      {[...Array(4)].map((_, idx) => (
        <Skeleton key={idx} animation="wave" variant="rounded" width={294} height={320}>
          <Stack direction="column">
            <Stack direction="row" spacing={2}>
              <Skeleton variant="rounded" height={48} width={48} />
              <Skeleton variant="text" height={26} width={200} />
            </Stack>

            <Skeleton variant="text" height={96} width={260} />

            <Skeleton variant="rounded" height={40} width={260} />
          </Stack>
        </Skeleton>
      ))}
    </CardsRow>
  );
};
