// @flow
import GeneralPageLayout from '../../layout/GeneralPageLayout';
import { Box } from '@mui/material';
import { Typography } from '@mui/material';

type Props = {|
  stores: any,
  actions: any,
  children?: React$Node,
|};

const GouvernancePage = ({ stores, actions, children }: Props): any => {
  return (
    <GeneralPageLayout stores={stores} actions={actions}>
      <Box>
        <Typography>Gouvernace page content</Typography>
      </Box>
    </GeneralPageLayout>
  );
};

export default GouvernancePage;
