// @flow
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { Button, Stack } from '@mui/material';

type Props = {|
  actions: Array<{|
    type: 'primary' | 'secondary',
    label: string,
    disabled: boolean,
    onClick(): void,
  |}>,
|};

function StepController(props: Props): Node {
  const { actions } = props;

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      mt="14px"
      py="24px"
      gap="24px"
    >
      {actions.map(({ type, label, disabled, onClick }) => (
        <Button
          variant={type === 'primary' ? 'rv-primary' : 'outlined'}
          disableRipple={false}
          onClick={onClick}
          disabled={disabled}
          sx={{
            width: '144px',
            height: '40px',
            minWidth: 'unset',
            minHeight: 'unset',
            fontSize: '14px',
            lineHeight: '15px',
          }}
        >
          {label}
        </Button>
      ))}
    </Stack>
  );
}

export default (observer(StepController): ComponentType<Props>);
