import { Skeleton, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard: any = styled(Stack)(({ theme, smallCard }: any) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: smallCard ? '298px' : '612px',
  borderRadius: '8px',
  padding: '16px',
  border: `2px solid ${theme.palette.ds?.primary_100}`,
}));
export const VotingSkeletonCard = ({ smallCard, title }: { smallCard?: boolean; title: string }) => {
  const skeletonCardName = title
    .split(' ')
    .map((w, index) => (index === 0 ? w.charAt(0).toLowerCase() : w.charAt(0).toUpperCase()) + w.slice(1))
    .join('');
  return (
    <StyledCard smallCard={smallCard} id={`governance-${skeletonCardName}Skeleton-component`}>
      <Skeleton
        animation="wave"
        variant="rounded"
        width={137}
        height={48}
        sx={{ marginBottom: '22px', backgroundColor: 'ds.gray_100' }}
      />
      <Skeleton
        animation="wave"
        variant="rounded"
        width={288}
        height={22}
        sx={{ marginBottom: '12px', backgroundColor: 'ds.gray_100' }}
      />
      {/* <Skeleton animation="wave" variant="rounded" width={262} height={88} sx={{ backgroundColor: 'ds.gray_100' }} /> */}
    </StyledCard>
  );
};
