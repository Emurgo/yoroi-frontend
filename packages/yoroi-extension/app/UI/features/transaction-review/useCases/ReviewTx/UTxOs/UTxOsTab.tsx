import { Divider, Stack, Typography } from '@mui/material';
import React from 'react';
import { Collapsible, CopyButton, Icon } from '../../../../../components';
import { useStrings } from '../../../common/hooks/useStrings';
import { mockReviewTX } from '../../../common/mockData'; // Adjust this path as necessary
import { TokenItem } from '../../../common/TokenItem'; // Adjust this path as necessary

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

export const UTxOsTab: React.FC = () => {
  return (
    <Stack direction="column" sx={{ padding: '24px' }}>
      <Inputs inputs={mockReviewTX.inputs} />
      <FeeDisplay fee={mockReviewTX.fee.label} />
      <Outputs outputs={mockReviewTX.outputs} />
    </Stack>
  );
};

export const Inputs: React.FC<InputsProps> = ({ inputs }) => {
  return (
    <Stack>
      <Collapsible
        expanded={true}
        title={
          <Typography fontWeight="500" variant="h5">
            Inputs ({inputs.length})
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
  return (
    <Stack>
      <Collapsible
        expanded={true}
        title={
          <Typography fontWeight="500" variant="h5">
            Outputs ({outputs.length})
          </Typography>
        }
        content={
          <Stack gap="8px">
            {outputs.map(output => (
              <Output key={`${output.address}-${output.txHash}-${output.txIndex}`} output={output} />
            ))}
          </Stack>
        }
      />
    </Stack>
  );
};

const Input: React.FC<InputProps> = ({ input }) => {
  const strings = useStrings();

  console.log('INPUT', strings);

  const renderAssets = () => {
    if (!input.assets.length) return null;

    return input.assets.map(asset => (
      <TokenItem
        key={asset.tokenInfo.id} // Ensure this is a unique identifier
        tokenInfo={asset.tokenInfo}
        label={asset.label}
        isPrimaryToken={asset.isPrimary}
      />
    ));
  };

  return (
    <Stack direction="column" gap="8px" mt="16px">
      <Stack direction="row" alignItems="center" gap="8px">
        <Icon.Indicator />
        <Typography fontWeight="500" variant="h5">
          Your Address
        </Typography>
      </Stack>

      <Stack direction="row" gap="8px" alignItems="flex-start">
        <Typography sx={{ wordWrap: 'break-word', maxWidth: '450px' }} variant="body1">
          {input.address}
        </Typography>
        <CopyButton textToCopy={input.address} strings={strings} />
      </Stack>

      {input.assets.length > 0 && (
        <Stack direction="row" gap="8px" justifyContent="flex-end">
          {renderAssets()}
        </Stack>
      )}

      <Stack direction="row" gap="8px" alignItems="flex-end">
        <Typography sx={{ wordWrap: 'break-word', maxWidth: '450px' }} variant="body1">
          {input.txHash} {`#${input.txIndex}`}
        </Typography>
      </Stack>
    </Stack>
  );
};

const Output: React.FC<OutputProps> = ({ output }) => {
  const renderAssets = () => {
    if (!output.assets.length) return null;

    return output.assets.map(asset => (
      <TokenItem
        key={asset.tokenInfo.id} // Ensure this is a unique identifier
        tokenInfo={asset.tokenInfo}
        label={asset.label}
        isPrimaryToken={asset.isPrimary}
        isSent={false}
      />
    ));
  };

  return (
    <Stack direction="column" gap="8px" mt="16px">
      <Stack direction="row" alignItems="center" gap="8px">
        <Icon.Indicator />
        <Typography fontWeight="500" variant="h5">
          Your Address
        </Typography>
      </Stack>

      <Stack direction="row" gap="8px" alignItems="flex-start">
        <Typography sx={{ wordWrap: 'break-word', maxWidth: '450px' }} variant="body1">
          {output.address}
        </Typography>
        <CopyButton textToCopy={output.address} />
      </Stack>

      {output.assets.length > 0 && (
        <Stack direction="row" gap="8px" justifyContent="flex-end">
          {renderAssets()}
        </Stack>
      )}

      {output?.txIndex && (
        <Stack direction="row" gap="8px" alignItems="flex-end">
          <Typography sx={{ wordWrap: 'break-word', maxWidth: '450px' }} variant="body1">
            {output.txHash} {`#${output.txIndex}`}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};

const FeeDisplay = ({ fee }) => {
  return (
    <Stack direction="column" my="24px">
      <Divider />
      <Stack direction="row" justifyContent="space-between" my="24px">
        <Typography variant="body1" fontWeight="500">
          Fee
        </Typography>
        <Typography variant="body1">{`-${fee}`}</Typography>
      </Stack>
      <Divider />
    </Stack>
  );
};
