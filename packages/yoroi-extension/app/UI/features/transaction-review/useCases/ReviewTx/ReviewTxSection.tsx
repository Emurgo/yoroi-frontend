import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Box, Divider } from '@mui/material';
import Menu from '../../../portfolio/common/components/Menu';
import { useFormattedMetadata } from '../../common/hooks/useFormatMetadata';
import { useFormattedTx } from '../../common/hooks/useFormattedTx';
import { useTxBody } from '../../common/hooks/usetxBody';
import { useTxReviewModal } from '../../module/ReviewTxProvider';
import { MetadataTab } from './Metadata/MetadataTab';
import { OverviewTab } from './Overview/OverviewTab';
import { ReferenceInputsTab } from './ReferenceInputs/ReferenceInputsTab';
import { UTxOsTab } from './UTxOs/UTxOsTab';

const TabContent = styled(Box)({
  flex: 1,
  overflow: 'scroll',
  height: '80vh',
});

export interface SubMenuOption {
  label: string;
  route: string;
  showTab?: boolean;
}

export const ReviewTxSection = () => {
  const theme = useTheme();
  const { unsignedTx, cborTx, receiverCustomTitle } = useTxReviewModal();

  const txBody: any = useTxBody({ cbor: cborTx, unsignedTx });
  const formatedTxJsonBody = cborTx ? txBody : txBody?.body;
  const formattedTx = useFormattedTx(formatedTxJsonBody);
  const formattedMetadata = useFormattedMetadata({ txBody: formatedTxJsonBody, unsignedTx: txBody, cbor: null });

  const subMenuOptions: SubMenuOption[] = [
    {
      label: 'Overview',
      route: 'overview',
      showTab: true,
    },
    {
      label: 'UTxOs',
      route: 'UTxOs',
      showTab: true,
    },
    {
      label: 'Metadata',
      route: 'metadata',
      showTab: formattedMetadata !== undefined,
    },
    {
      label: 'Reference inputs',
      route: 'referenceInputs',
      showTab: formattedTx.referenceInputs.length > 0,
    },
  ];
  const [selectedTab, setSelectedTab] = React.useState(subMenuOptions[0]?.route);

  const isActiveItem = (route: string) => {
    if (route === selectedTab) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <Box sx={{ position: 'relative', height: '100vh' }}>
      <Box sx={{ backgroundColor: 'ds.bg_color_max', marginX: theme.spacing(24) }}>
        <Menu options={subMenuOptions} onItemClick={(route: string) => setSelectedTab(route)} isActiveItem={isActiveItem} />
        <Divider />
      </Box>
      {selectedTab === subMenuOptions[0]?.route && subMenuOptions[0]?.showTab ? (
        <TabContent>
          <OverviewTab receiverCustomTitle={receiverCustomTitle} tx={formattedTx} />
        </TabContent>
      ) : null}
      {selectedTab === subMenuOptions[1]?.route && subMenuOptions[1]?.showTab ? (
        <TabContent>
          <UTxOsTab tx={formattedTx} />
        </TabContent>
      ) : null}
      {selectedTab === subMenuOptions[2]?.route && subMenuOptions[2]?.showTab ? (
        <TabContent>
          <MetadataTab hash={formattedMetadata?.hash ?? null} metadata={formattedMetadata?.metadata ?? null} />
        </TabContent>
      ) : null}
      {selectedTab === subMenuOptions[3]?.route && subMenuOptions[3]?.showTab ? (
        <TabContent>
          <ReferenceInputsTab referenceInputs={formattedTx.referenceInputs} />
        </TabContent>
      ) : null}
    </Box>
  );
};
