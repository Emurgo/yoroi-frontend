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
          id="governance-delegationStatusSkeleton-component"
        />
        <Skeleton
          animation="wave"
          variant="rounded"
          width={612}
          height={82}
          sx={{ marginBottom: '12px', backgroundColor: 'ds.gray_100' }}
          id="governance-otherOptionsSkeleton-component"
        />
      </Stack>
    </StyledCard>
  );
};

export const OptionsSkeletonScreen = () => {
  return (
    <CardsRow>
      {[...Array(4)].map((_, idx) => (
        <Stack
          width={294}
          height={320}
          key={idx}
          sx={{ border: '1px solid', borderColor: 'ds.gray_200', borderRadius: '8px', padding: '16px', boxSizing: 'border-box' }}
        >
          <Stack direction="column" justifyContent={'space-between'} height={'100%'}>
            <Stack direction={'column'}>
              <Stack direction="row" spacing={2} alignItems={'center'}>
                <Skeleton variant="circular" height={48} width={48} />
                <Skeleton variant="text" height={26} width={200} />
              </Stack>

              <Skeleton variant="text" height={146} width={260} />
            </Stack>

            <Skeleton variant="rounded" height={40} width={260} />
          </Stack>
        </Stack>
      ))}
    </CardsRow>
  );
};
