// @flow
import type { Node } from 'react';
import { Checkbox, FormControlLabel, Typography } from '@mui/material';

import { ReactComponent as OutlineIcon } from '../../assets/images/forms/checkbox-outline.inline.svg';
import { ReactComponent as CheckedIcon } from '../../assets/images/forms/checkbox-checked.inline.svg';
import { Box } from '@mui/system';
import ReactMarkdown from 'react-markdown';

type Props = {|
  label: string | Node,
  labelProps?: Object,
  sx?: Object,
  labelSx?: Object,
  descriptionSx?: Object,
  description?: ?string,
  checked: boolean,
  disabled?: boolean,
  onChange: () => void,
  id?: string,
|};
function CheckboxLabel({
  label,
  disabled,
  labelProps,
  description,
  sx,
  labelSx,
  descriptionSx,
  id,
  ...checkboxProps
}: Props): Node {
  return (
    <FormControlLabel
      control={
        <Checkbox
          disabled={disabled}
          icon={<OutlineIcon />}
          checkedIcon={<CheckedIcon />}
          {...checkboxProps}
          // $FlowIgnore
          id={id + '-checkbox'}
        />
      }
      label={
        <Box
          sx={{
            margin: 0,
            'p + p': {
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              ...(descriptionSx !== null && descriptionSx),
            },
            strong: { fontWeight: 500 },
          }}
        >
          <Typography component="div"
            marginBottom={description !== null ? '8px' : 0}
            sx={{
              color: 'var(--yoroi-comp-checkbox-text)',
              fontWeight: 300,
              ...(labelSx !== null && labelSx),
            }}
          >
            {label}
          </Typography>
          {Boolean(description) && <ReactMarkdown source={description} escapeHtml={false} />}
        </Box>
      }
      sx={{
        alignItems: description === null ? 'center' : 'flex-start',
        margin: 0,
        '& .MuiFormControlLabel-label': {
          flex: 1,
        },
        ...(sx !== null && sx),
      }}
      {...labelProps}
    />
  );
}

export default CheckboxLabel;

CheckboxLabel.defaultProps = {
  labelProps: null,
  sx: null,
  labelSx: null,
  descriptionSx: null,
  disabled: false,
  description: null,
  id: 'somewhere',
};
