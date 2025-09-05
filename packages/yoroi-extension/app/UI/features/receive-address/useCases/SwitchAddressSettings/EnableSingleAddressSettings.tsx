import { Box, FormControlLabel } from '@mui/material';
import { useStrings } from '../../common/hooks/useStrings';
import { RevampSwitch } from '../../../../../components/widgets/Switch';
import { InfoTooltip } from '../../../../../components/widgets/InfoTooltip';
import { useEffect, useState } from 'react';
import LocalStorageApi from '../../../../../api/localStorage/index';

export default function EnableSingleAddressSettings() {
  const strings = useStrings();
  const [isEnabled, setIsEnabled] = useState(true);
  const localStorageApi = new LocalStorageApi();

  useEffect(() => {
    const fetchMode = async () => {
      const mode = await localStorageApi.getSingleAddressMode();
      if (mode === 'true' || mode === undefined) {
        setIsEnabled(true);
      } else {
        setIsEnabled(false);
      }
    };
    fetchMode();
  }, [isEnabled]);

  const toggle = async (event): Promise<void> => {
    setIsEnabled(event.target.checked);
    await localStorageApi.setSingleAddressMode(String(event.target.checked));
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
