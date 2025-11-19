import { useCallback, useEffect, useRef } from 'react';
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
import { getTransactionAnalyticsPropertiesFromRaw } from '../../common/utils';
import { captureEvent } from '../../../../../../posthog';

const ScrollBox = styled(Box)({
  flex: 1,
  height: '80vh',
});

const pathId = 'reviewTx';

export const ReviewTxSection = () => {
  const { unsignedTx, cborTx, receiverCustomTitle, operations } = useTxReviewModal();
  const hasSentAnalyticsRef = useRef<string | null>(null);

  const txBody: any = useTxBody({ cbor: cborTx, unsignedTx });
  const formattedTx = useFormattedTx(cborTx ? txBody : txBody?.body);
  const formattedMetadata = useFormattedMetadata({
    txBody: cborTx ? txBody : txBody?.body,
    unsignedTx: unsignedTx,
    cbor: cborTx,
  });
  const location = useLocation();
  const tabSearchParam = new URLSearchParams(location.search).get('tab') || 'overview';

  useEffect(() => {
    // Only send analytics when transaction data is available
    const hasTransactionData = cborTx != null || unsignedTx != null;
    // Checking that formattedTx has actual data
    const isFormattedTxReady = formattedTx && (formattedTx.inputs?.length > 0 || formattedTx.outputs?.length > 0);

    // Create a unique identifier based on transaction data presence to prevent duplicate events
    const transactionKey = hasTransactionData ? (cborTx ? 'has-cbor' : 'has-unsigned') : null;

    // Only send analytics if we have valid data and haven't already sent for this transaction session
    if (hasTransactionData && isFormattedTxReady && transactionKey && hasSentAnalyticsRef.current !== transactionKey) {
      const analyticsParams = getTransactionAnalyticsPropertiesFromRaw(formattedTx, operations?.kind, operations?.aggregator);
      captureEvent('Transaction Review Modal Viewed', analyticsParams);
      hasSentAnalyticsRef.current = transactionKey;
    }

    // Reset the ref when transaction data is cleared (modal closing)
    if (!hasTransactionData && hasSentAnalyticsRef.current !== null) {
      hasSentAnalyticsRef.current = null;
    }
  }, [cborTx, unsignedTx, formattedTx]);

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
      <Tabs initialTabId={tabSearchParam} tabs={getTabs()} pathId={pathId} headerSx={{ mx: '24px' }} contentSx={{ padding: 0 }} />
    </Box>
  );
};
