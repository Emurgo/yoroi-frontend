import { useCallback } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useLocation } from 'react-router';

import { useFormattedMetadata } from '../../common/hooks/useFormatMetadata';
import { useFormattedTx } from '../../common/hooks/useFormattedTx';
import { useTxBody } from '../../common/hooks/usetxBody';
import { useTxReviewModal } from '../../module/ReviewTxProvider';

import { MetadataTab } from './Metadata/MetadataTab';
import { OverviewTab } from './Overview/OverviewTab';
import { ReferenceInputsTab } from './ReferenceInputs/ReferenceInputsTab';
import { UTxOsTab } from './UTxOs/UTxOsTab';
import { TabItem, Tabs } from '../../../../components/tabs/Tabs';

const ScrollBox = styled(Box)({
  flex: 1,
  height: '80vh',
});

const pathId = 'reviewTx';

export const ReviewTxSection = () => {
  const { unsignedTx, cborTx, receiverCustomTitle } = useTxReviewModal();

  const txBody: any = useTxBody({ cbor: cborTx, unsignedTx });
  const formattedTx = useFormattedTx(cborTx ? txBody : txBody?.body);
  const formattedMetadata = useFormattedMetadata({
    txBody: cborTx ? txBody : txBody?.body,
    unsignedTx: txBody,
    cbor: null,
  });

  const location = useLocation();
  const tabSearchParam = new URLSearchParams(location.search).get('tab') || 'overview';

  const getTabs = useCallback((): TabItem[] => {
    const tabs: TabItem[] = [
      {
        id: 'overview',
        label: 'Overview',
        content: (
          <ScrollBox>
            <OverviewTab receiverCustomTitle={receiverCustomTitle} tx={formattedTx} />
          </ScrollBox>
        ),
      },
      {
        id: 'UTxOs',
        label: 'UTxOs',
        content: (
          <ScrollBox>
            <UTxOsTab tx={formattedTx} />
          </ScrollBox>
        ),
      },
    ];

    if (formattedMetadata) {
      tabs.push({
        id: 'metadata',
        label: 'Metadata',
        content: (
          <ScrollBox>
            <MetadataTab hash={formattedMetadata.hash ?? null} metadata={formattedMetadata.metadata ?? null} />
          </ScrollBox>
        ),
      });
    }

    if (formattedTx.referenceInputs.length > 0) {
      tabs.push({
        id: 'referenceInputs',
        label: 'Reference inputs',
        content: (
          <ScrollBox>
            <ReferenceInputsTab referenceInputs={formattedTx.referenceInputs} />
          </ScrollBox>
        ),
      });
    }

    return tabs;
  }, [formattedTx, formattedMetadata, receiverCustomTitle]);

  return (
    <Box sx={{ position: 'relative', height: '100vh' }}>
      <Tabs
        initialTabId={tabSearchParam}
        tabs={getTabs()}
        pathId={pathId}
        headerSx={{ mx: '24px' }}
        contentSx={{ padding: 0 }}
      />
    </Box>
  );
};
