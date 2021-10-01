/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-array-index-key */
// @flow
import { useRef, useState } from 'react';
import type { Node } from 'react';
import { useCombobox, useMultipleSelection } from 'downshift';
import { Input, Box, InputLabel, FormControl, FormHelperText, Chip, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import { slice } from 'lodash';
import SuccessIcon from '../../assets/images/forms/done.inline.svg';
import ErrorIcon from '../../assets/images/forms/error.inline.svg';
import CloseIcon from '../../assets/images/close-chip.inline.svg';

type Props = {|
  +options: Array<string>,
  +maxSelections?: number,
  +done?: boolean,
  +disabled?: boolean,
  +error?: boolean,
  +maxVisibleOptions?: number,
  +noResultsMessage?: string,
  +id: string,
  +placeholder: string,
  +label: string,
  +onChange: (Array<string>) => void,
  +value: Array<string>,
  +autoFocus?: boolean,
  +type: string,
  +name: string,
  +chipProps?: Object,
|};

function Autocomplete({
  options,
  maxSelections,
  done,
  error = null,
  maxVisibleOptions = 10,
  noResultsMessage,
  label,
  disabled,
  id,
  onChange,
  value,
  autoFocus,
  type,
  name,
  placeholder,
  chipProps,
}: Props): Node {
  const [inputValue, setInputValue] = useState<string>('');
  const inputRef = useRef();
  const filteredList = options.filter(
    item => !inputValue || item.toLowerCase().includes(inputValue.toLowerCase())
  );
  const sliceArrayItems = slice(filteredList, 0, maxVisibleOptions);

  const {
    getSelectedItemProps,
    getDropdownProps,
    addSelectedItem,
    removeSelectedItem,
  } = useMultipleSelection({
    onSelectedItemsChange: ({ selectedItems }) => {
      onChange(selectedItems);
    },
  });

  const {
    isOpen,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
    openMenu,
  } = useCombobox({
    inputValue,
    defaultHighlightedIndex: 0,
    selectedItem: null,
    items: filteredList,
    stateReducer: (state, actionAndChanges) => {
      const { changes, type: actionType } = actionAndChanges;
      switch (actionType) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
        case useCombobox.stateChangeTypes.InputChange:
          return {
            ...changes,
            isOpen: true,
          };
        default:
          return changes;
      }
    },
    // eslint-disable-next-line no-shadow
    onStateChange: ({ inputValue, type, selectedItem }) => {
      switch (type) {
        case useCombobox.stateChangeTypes.InputChange:
          setInputValue(inputValue);
          break;
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
        case useCombobox.stateChangeTypes.InputBlur:
          // $FlowFixMe[invalid-compare]
          if (selectedItem && value.length < maxSelections) {
            setInputValue('');
            addSelectedItem(selectedItem);
          }
          break;
        default:
          break;
      }
    },
  });
  const theme = useTheme();
  return (
    <StyledFormControl
      error={Boolean(error)}
      // $FlowFixMe[invalid-compare]
      disabled={disabled === true || value.length >= maxSelections}
      fullWidth
    >
      <InputLabel
        sx={{ padding: '0 6px', background: 'white' }}
        {...(value.length || theme.name === 'classic' ? { shrink: true } : {})}
        htmlFor={id ?? 'autocomplete-combobox'}
        {...getLabelProps()}
      >
        {label}
      </InputLabel>
      <InputWrapper
        onClick={() => {
          if (!isOpen) {
            inputRef.current?.focus();
            openMenu();
          }
        }}
        error={error}
        isOpen={isOpen}
      >
        {value.map((selectedItem, index) => (
          <Chip
            variant="autocomplete"
            key={`selected-item-${index}`}
            label={selectedItem}
            onDelete={() => {
              removeSelectedItem(selectedItem);
            }}
            deleteIcon={<CloseIcon />}
            {...chipProps}
            {...getSelectedItemProps({ selectedItem, index })}
          />
        ))}
        <Box {...getComboboxProps()}>
          <Input
            color="input"
            // $FlowFixMe[invalid-compare]
            placeholder={value.length >= maxSelections ? '' : placeholder}
            // $FlowFixMe[invalid-compare]
            disabled={value.length >= maxSelections}
            disableUnderline
            fullWidth
            autoFocus={autoFocus}
            error={Boolean(error)}
            id={id ?? 'autocomplete-combobox'}
            {...getInputProps({
              inputRef,
              type,
              name,
              autoFocus,
              ...getDropdownProps(),
            })}
          />
        </Box>
        <CheckWrapper>
          {done === true ? <SuccessIcon /> : null}
          {Boolean(error) === true ? <ErrorIcon /> : null}
        </CheckWrapper>
      </InputWrapper>
      <FormHelperText sx={{ position: 'absolute', bottom: 0 }} id={id ?? 'autocomplete-combobox'}>
        {error}
      </FormHelperText>

      <ULList
        component="ul"
        {...getMenuProps()}
        sx={{
          border: isOpen ? '1px solid hsl(214deg 16% 81%)' : 'none',
        }}
      >
        {isOpen && !sliceArrayItems.length ? (
          <Box
            sx={{
              padding: '14px 20px',
              bgcolor: 'white',
            }}
          >
            {noResultsMessage}
          </Box>
        ) : null}
        {isOpen && sliceArrayItems.length
          ? sliceArrayItems.map((item, index) => {
              return (
                <Box
                  key={`${item}${index}`}
                  sx={{
                    padding: '14px 20px',
                    backgroundColor: highlightedIndex === index ? 'hsl(204 20% 95%)' : 'white',
                    cursor: 'pointer',
                  }}
                  {...getItemProps({
                    item,
                    index,
                  })}
                >
                  {item}
                </Box>
              );
            })
          : null}
      </ULList>
    </StyledFormControl>
  );
}
export default Autocomplete;

Autocomplete.defaultProps = {
  maxSelections: 10,
  done: false,
  disabled: false,
  error: false,
  autoFocus: false,
  maxVisibleOptions: 10,
  noResultsMessage: '',
  chipProps: null,
};

const StyledFormControl = styled(FormControl)({
  marginTop: '10px',
  marginBottom: '10px',
  paddingBottom: '24px',
  '& .MuiInputLabel-root': {
    '&.MuiInputLabel-shrink ': {
      color: '#2a2b32',
    },
    '&.Mui-error': {
      color: 'red',
    },
  },
});

const CheckWrapper = styled(Box)({
  display: 'flex',
  minWidth: '35px',
  position: 'absolute',
  right: 0,
  top: '50%',
  transform: 'translateY(-50%)',
});

const ULList = styled(Box)({
  width: '100%',
  background: 'hsl(240deg 9% 96%)',
  margin: 0,
  borderTop: 0,
  position: 'absolute',
  zIndex: 1000,
  left: 0,
  top: '100%',
  maxHeight: '30rem',
  overflowY: 'auto',
  overflowX: 'hidden',
  outline: '0',
  transition: 'opacity .1s ease',
  borderRadius: 0,
});

const InputWrapper = styled('div')(
  ({ theme, error, isOpen }) => `
  width: 100%;
  border: 1px solid ${
    error
      ? 'hsl(354deg 79% 61%)'
      : isOpen
      ? 'hsl(237deg 37% 11%)'
      : theme.name === 'classic'
      ? 'hsl(214 16% 81%)'
      : 'var(--mui-input-border-color)'
  };
  border-radius: ${theme.name === 'classic' ? '0' : '8px'};
  background-color: ${theme.name === 'classic' ? 'hsl(240 9% 96%)' : 'white'};
  min-height: ${theme.name === 'classic' ? '73px' : '140px'};
  align-content: baseline;
  display: inline-flex;
  padding: 10px;
  padding-right: 40px;
  padding-left: 5px;
  flex-wrap: wrap;
  position: relative;

  & input {
    background-color: transparent;
    color: ${theme.name === 'classic' ? 'hsl(237 37% 11%)' : 'rgba(0,0,0,.85)'};
    color: hsl(225deg 4% 30%);
    font-weight: 300;
    font-size: 0.9rem;
    padding: 4px 6px;
    letter-spacing: 0;
  }
`
);
