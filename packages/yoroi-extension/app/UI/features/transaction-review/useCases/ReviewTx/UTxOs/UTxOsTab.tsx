import { Divider, Stack, Typography } from '@mui/material';
import { Portfolio } from '@yoroi/types';
import BigNumber from 'bignumber.js';
import React from 'react';
import { Collapsible, CopyButton, Icons, IconWrapper } from '../../../../../components';
import { useStrings } from '../../../common/hooks/useStrings';
import { TokenItem } from '../../../common/TokenItem'; // Adjust this path as necessary
import { useTxReviewModal } from '../../../module/ReviewTxProvider';

// TODO Define the type for an individual asset
interface Asset {
  tokenInfo: { id: string; name: string; symbol: string }; // Replace/add properties based on actual structure
  label: string;
  isPrimary: boolean;
}

// TODO Define the type for an individual input
interface InputData {
  address: string;
  txHash: string;
  txIndex: number;
  assets: Asset[];
}

interface OutputsProps {
  outputs: InputData[];
}
interface InputsProps {
  inputs: InputData[];
}

interface InputProps {
  input: InputData;
}
interface OutputProps {
  output: InputData;
}

export const UTxOsTab: any = ({ tx }) => {
  const { primaryTokenInfo } = useTxReviewModal();

  return (
    <Stack direction="column" sx={{ padding: '24px 0 24px 24px', marginBottom: '100px' }}>
      <Inputs inputs={tx.inputs} />
      <FeeDisplay fee={tx.fee.quantity} primaryTokenInfo={primaryTokenInfo} />
      <Outputs outputs={tx.outputs} />
    </Stack>
  );
};

export const Inputs: React.FC<InputsProps> = ({ inputs }) => {
  const strings = useStrings();
  return (
    <Stack>
      <Collapsible
        expanded={true}
        title={
          <Typography fontWeight="500" variant="h5">
            {strings.inputsLabel} ({inputs.length})
          </Typography>
        }
        content={
          <Stack gap="8px">
            {inputs.map(input => (
              <Input key={`${input.address}-${input.txHash}-${input.txIndex}`} input={input} />
            ))}
          </Stack>
        }
      />
    </Stack>
  );
};

const Outputs: React.FC<OutputsProps> = ({ outputs }) => {
  const strings = useStrings();
  return (
    <Stack>
      <Collapsible
        expanded={true}
        title={
          <Typography fontWeight="500" variant="h5">
            {strings.outputsLabel} ({outputs.length})
          </Typography>
        }
        content={
          <Stack gap="8px">
            {outputs.map((output, index) => (
              <Output key={`${output.address}-${index}`} output={output} />
            ))}
          </Stack>
        }
      />
    </Stack>
  );
};

const Input: React.FC<InputProps> = ({ input }: any) => {
  const strings = useStrings();

  const renderAssets = () => {
    if (!input.assets.length) return null;
    return input.assets.map(asset => (
      <TokenItem
        key={asset.tokenInfo.id}
        tokenInfo={asset.tokenInfo}
        quantity={asset.quantity}
        isPrimary={asset.tokenInfo.nature === Portfolio.Token.Nature.Primary}
      />
    ));
  };

  return (
    <Stack direction="column" gap="8px" mt="16px">
      <Stack direction="row" alignItems="center" gap="8px">
        <IconWrapper color="ds.primary_500" icon={Icons.Indicator} />
        <Typography fontWeight="500" variant="h5" color="ds.text_gray_medium">
          {strings.yourAddressLabel}
        </Typography>
      </Stack>

      <Stack direction="row" gap="8px" alignItems="flex-start" width="100%" display="flex">
        <Typography sx={{ wordWrap: 'break-word', flex: '1 1 0' }} variant="body1" color="ds.text_gray_medium" minWidth="0">
          {input.address}
        </Typography>
        <CopyButton textToCopy={input.address} />
      </Stack>

      <Stack direction="row" alignItems="flex-start" width="100%" display="flex" gap="8px">
        <Typography sx={{ wordWrap: 'break-word', flex: '1 1 0' }} variant="body1" color="ds.text_gray_medium" minWidth="0">
          {input.txHash}
        </Typography>

        <Stack display="flex" flexDirection="row" gap="8px">
          <Typography variant="body1" fontWeight={500}>
            {`#${input.txIndex}`}
          </Typography>
          <CopyButton textToCopy={input.txHash} />
        </Stack>

      </Stack>

      {input.assets.length > 0 && (
        <Stack direction="row" gap="8px" justifyContent="flex-end" flexWrap="wrap">
          {renderAssets()}
        </Stack>
      )}
    </Stack>
  );
};

const Output: React.FC<OutputProps> = ({ output }: any) => {
  const isOwnAdddress = output.ownAddress;
  const renderAssets = () => {
    if (!output.assets.length) return null;

    return output.assets
      .filter(a => a !== null)
      .map(asset => (
        <TokenItem
          key={asset.tokenInfo.id}
          tokenInfo={asset?.tokenInfo}
          quantity={asset?.quantity}
          isSent={false}
          isPrimary={asset.tokenInfo.nature === Portfolio.Token.Nature.Primary}
        />
      ));
  };

  return (
    <Stack direction="column" gap="8px" mt="16px">
      <Stack direction="row" alignItems="center" gap="8px">
        <IconWrapper color="ds.static_green" icon={Icons.Indicator} />
        <Typography fontWeight="500" variant="h5">
          {isOwnAdddress ? 'Your Address' : 'Foreign address'}
        </Typography>
      </Stack>

      <Stack direction="row" gap="8px" alignItems="flex-start" width="100%" display="flex">
        <Typography sx={{ wordWrap: 'break-word', flex: '1 1 0' }} variant="body1" minWidth="0">
          {output.address}
        </Typography>
        <CopyButton textToCopy={output.address} />
      </Stack>

      {output.assets.length > 0 && (
        <Stack direction="row" gap="8px" justifyContent="flex-end" flexWrap="wrap">
          {renderAssets()}
        </Stack>
      )}
    </Stack>
  );
};

const FeeDisplay = ({ fee, primaryTokenInfo }) => {
  const strings = useStrings();
  return (
    <Stack direction="column" my="24px">
      <Divider />
      <Stack direction="row" justifyContent="space-between" my="24px">
        <Typography variant="body1" fontWeight="500">
          {strings.feeLabel}
        </Typography>
        <Typography variant="body1">{`-${new BigNumber(fee).shiftedBy(-primaryTokenInfo.decimals).toString()} ${
          primaryTokenInfo.name
        }`}</Typography>
      </Stack>
      <Divider />
    </Stack>
  );
};