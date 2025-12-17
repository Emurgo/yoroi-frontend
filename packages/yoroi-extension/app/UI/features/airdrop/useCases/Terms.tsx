import { Typography } from '@mui/material';
import { useStrings } from '../common/hooks/useStrings';

export default function Terms() {
  const strings = useStrings();
  return (
    <>
      <Typography variant="body1" color="ds.text_gray_min" sx={{ marginTop: '32px', marginBottom: '16px' }}>
        {strings.terms}
      </Typography>
      <Typography variant="body1">
        <Typography fontWeight={500}>{strings.header1}</Typography>

        <p>{strings.section1_1}</p>

        <p>&nbsp;</p>
        <Typography fontWeight={500}>{strings.header2}</Typography>

        <p>{strings.section2_1}</p>

        <p>{strings.section2_2}</p>
        <p>{strings.section2_3}</p>
      </Typography>
    </>
  );
}
