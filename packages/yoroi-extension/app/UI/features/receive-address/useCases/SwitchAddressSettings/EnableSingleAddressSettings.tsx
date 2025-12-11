import { Box, FormControlLabel } from '@mui/material';
import { useStrings } from '../../common/hooks/useStrings';
import { RevampSwitch } from '../../../../../components/widgets/Switch';
import { InfoTooltip } from '../../../../../components/widgets/InfoTooltip';

type Props = {
  isSingleAddress: boolean;
  updateSingleAddressMode: (mode: boolean) => void;
};

export default function EnableSingleAddressSettings({ isSingleAddress, updateSingleAddressMode }: Props) {
  const strings = useStrings();

  const toggle = async (event): Promise<void> => {
    updateSingleAddressMode(event.target.checked);
  };

  return (
    <Box>
      <FormControlLabel
        label={strings.enableSettingsTitle}
        control={
          <Box ml="8px" sx={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <Box mt="2px" mr="8px">
              <InfoTooltip content={strings.enableSettingsDescription} />
            </Box>
            <RevampSwitch checked={isSingleAddress} onChange={toggle} />
          </Box>
        }
        labelPlacement="start"
        sx={{ marginLeft: '0px', marginBottom: '40px' }}
      />
    </Box>
  );
}
