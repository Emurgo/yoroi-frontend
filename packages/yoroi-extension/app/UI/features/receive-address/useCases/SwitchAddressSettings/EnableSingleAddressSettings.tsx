import { Box, FormControlLabel } from '@mui/material';
import { useStrings } from '../../common/hooks/useStrings';
import { RevampSwitch } from '../../../../../components/widgets/Switch';
import { InfoTooltip } from '../../../../../components/widgets/InfoTooltip';
import { useState } from 'react';

export default function EnableSingleAddressSettings() {
  const [isEnabled, setIsEnabled] = useState(true);

  const strings = useStrings();

  const toggle = (value) => {
    console.log("toggle", value);
    setIsEnabled(!isEnabled);
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
            <RevampSwitch checked={isEnabled} onChange={toggle} />
          </Box>
        }
        labelPlacement="start"
        sx={{ marginLeft: '0px', marginBottom: '40px' }}
      />
    </Box>
  );
}
