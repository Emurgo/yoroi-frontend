import { Divider, Stack, Typography } from '@mui/material';
import React from 'react';
import { Collapsible, CopyButton, Icon } from '../../../../../components';
import { useStrings } from '../../../common/hooks/useStrings';
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

export const UTxOsTab: any = ({ tx }) => {
  return (
    <Stack direction="column" sx={{ padding: '24px', direction: 'collumn' }}>
      <Inputs inputs={tx.inputs} />
      <FeeDisplay fee={tx.fee.quantity} />
      <Outputs outputs={tx.outputs} />
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
  console.log('outputs', outputs);
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
      <TokenItem key={asset.tokenInfo.id} tokenInfo={asset.tokenInfo} quantity={asset.quantity} />
    ));
  };

  return (
    <Stack direction="column" gap="8px" mt="16px">
      <Stack direction="row" alignItems="center" gap="8px">
        <Icon.Indicator />
        <Typography fontWeight="500" variant="h5" color="ds.text_gray_medium">
          Your Address
        </Typography>
      </Stack>

      <Stack direction="row" gap="8px" alignItems="flex-start">
        <Typography sx={{ wordWrap: 'break-word' }} variant="body1" color="ds.text_gray_medium" maxWidth="450px">
          {input.address}
        </Typography>
        <CopyButton textToCopy={input.address} strings={strings} />
      </Stack>

      <Stack direction="row" gap="8px" alignItems="flex-start">
        <Stack direction="row" gap="8px" alignItems="flex-start">
          <Typography sx={{ wordWrap: 'break-word' }} variant="body1" color="ds.text_gray_medium" maxWidth="420px">
            {input.txHash}
          </Typography>
          <Typography sx={{}} variant="body1" fontWeight={500}>
            {`#${input.txIndex}`}
          </Typography>
        </Stack>
        <CopyButton textToCopy={input.txHash} strings={strings} />
      </Stack>

      {input.assets.length > 0 && (
        <Stack direction="row" gap="8px" justifyContent="flex-end">
          {renderAssets()}
        </Stack>
      )}
    </Stack>
  );
};

const Output: React.FC<OutputProps> = ({ output }: any) => {
  const strings = useStrings();
  const isOwnAdddress = output.ownAddress;
  const renderAssets = () => {
    if (!output.assets.length) return null;

    return output.assets.map(asset => (
      <TokenItem key={asset.tokenInfo.id} tokenInfo={asset.tokenInfo} quantity={asset.quantity} isSent={false} />
    ));
  };

  return (
    <Stack direction="column" gap="8px" mt="16px">
      <Stack direction="row" alignItems="center" gap="8px">
        <Icon.Indicator />
        <Typography fontWeight="500" variant="h5">
          {isOwnAdddress ? 'Your Address' : 'Foreign address'}
        </Typography>
      </Stack>

      <Stack direction="row" gap="8px" alignItems="flex-start">
        <Typography sx={{ wordWrap: 'break-word' }} variant="body1" maxWidth="450px">
          {output.ownAddress}
        </Typography>
        <CopyButton textToCopy={output.ownAddress} strings={strings} />
      </Stack>

      {output.assets.length > 0 && (
        <Stack direction="row" gap="8px" justifyContent="flex-end">
          {renderAssets()}
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
