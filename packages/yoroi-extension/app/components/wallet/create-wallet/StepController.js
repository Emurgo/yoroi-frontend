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
      {actions.map(({ type, label, disabled, onClick }, idx) => {
        const isPrimary = type === 'primary';
        return (
          <Button
            // <TODO:CHECK_LINT>
            // eslint-disable-next-line react/no-array-index-key
            key={idx}
            variant={isPrimary ? 'contained' : 'outlined'}
            color="primary"
            disableRipple={false}
            onClick={onClick}
            disabled={disabled}
            style={{ width: '144px', height: '48px' }}
            id={type + 'Button'}
          >
            {label}
          </Button>
        );
      })}
    </Stack>
  );
}

export default (observer(StepController): ComponentType<Props>);
