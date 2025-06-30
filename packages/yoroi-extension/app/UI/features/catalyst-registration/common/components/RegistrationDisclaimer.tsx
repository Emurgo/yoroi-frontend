import { BaseBanner } from '../../../../components/Banners/BaseBanner';
import { useStrings } from '../hooks/useStrings';
import { Stack, Typography } from '@mui/material';
import { IconWrapper, Icons } from '../../../../components';
// import { useCatalystRegistration } from '../../module/CatalystRegistrationContextProvider';

export default function RegistrationDisclaimer({ onClose }: { onClose: () => void }) {
  // const { isDelegated = false } = useCatalystRegistration();
  const isDelegated = true;
  const strings = useStrings();
  return (
    <BaseBanner
      onClose={onClose}
      title={
        <Stack component="span" direction="row" alignItems="center" gap="8px">
          <IconWrapper icon={Icons.ExclamationCircle} />
          <Typography component="div" variant="body1" fontWeight={500} color="ds.gray_900">
            {strings.disclaimerTitle}
          </Typography>
        </Stack>
      }
      description={isDelegated ? strings.keepDelegated : strings.notDelegated}
    />
  );
}
