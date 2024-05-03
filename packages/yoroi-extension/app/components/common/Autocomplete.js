/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-array-index-key */
// @flow
import { useRef, useState } from 'react';
import type { Node } from 'react';
import { useCombobox, useMultipleSelection } from 'downshift';
import { Input, Box, InputLabel, FormControl, FormHelperText, Chip, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import { slice } from 'lodash';
import { ReactComponent as SuccessIcon } from '../../assets/images/forms/done.inline.svg';
import { ReactComponent as ErrorIcon } from '../../assets/images/forms/error.inline.svg';
import { ReactComponent as CloseIcon } from '../../assets/images/close-chip.inline.svg';

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
  const [inputValue, setInputValue] = useState<?string>('');
  const inputRef = useRef();
  const isInputPresent = (inputValue?.length ?? 0) > 0;
  const filteredList = isInputPresent
    ? options.filter(w => w.toLowerCase().startsWith(inputValue?.toLowerCase() ?? ''))
    : options;
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
    closeMenu,
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
          if (inputValue.length === 0) {
            closeMenu();
          }
          setInputValue(inputValue);
          break;
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
        case useCombobox.stateChangeTypes.InputBlur:
          // $FlowFixMe[invalid-compare]
          if (selectedItem && value.length < maxSelections) {
            setInputValue('');
            addSelectedItem(selectedItem);
            closeMenu();
            inputRef.current?.focus();
          }
          break;
        default:
          break;
      }
    },
  });
  const theme = useTheme();
  return (
    <FormControl
      error={Boolean(error)}
      // $FlowFixMe[invalid-compare]
      disabled={disabled === true || value.length >= maxSelections}
    >
      <InputLabel
        {...(value.length || theme.name === 'classic' ? { shrink: true } : {})}
        htmlFor={id ?? 'autocomplete-combobox'}
        {...getLabelProps()}
        sx={{ backgroundColor: 'var(--yoroi-palette-common-white)', padding: '0px 6px' }}
      >
        {label}
      </InputLabel>
      <InputWrapper
        onClick={() => {
          if (!isOpen) {
            inputRef.current?.focus();
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
      <FormHelperText id={id ?? 'autocomplete-combobox'}>{error}</FormHelperText>

      <ULList
        component="ul"
        {...getMenuProps()}
        sx={{
          boxShadow: isOpen ? '0 3px 7px 0 rgba(74,74,74,0.16)' : 'unset',
        }}
      >
        {isOpen && !sliceArrayItems.length ? (
          <Box
            sx={{
              padding: '14px 20px',
              bgcolor: 'ds.gray_cmin',
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
                    backgroundColor: highlightedIndex === index ? 'ds.gray_c50' : 'ds.gray_cmin',
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
    </FormControl>
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
  background: 'var(--yoroi-palette-common-white)',
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

const InputWrapper = styled(Box)(
  ({ theme, error, isOpen }) => `
  width: 100%;
  border: ${isOpen ? '2px' : '1px'} solid ${
    error
      ? 'var(--yoroi-comp-input-error)'
      : isOpen
      ? 'var(--yoroi-comp-input-text-focus)'
      : theme.name === 'classic'
      ? '#c7ced6'
      : 'var(--yoroi-comp-input-border)'
  };
  border-radius: ${theme.name === 'classic' ? '0' : '8px'};
  background-color: ${theme.name === 'classic' ? '#f4f4f6' : 'var(--yoroi-palette-common-white)'};
  min-height: ${theme.name === 'classic' ? '73px' : '140px'};
  align-content: baseline;
  display: inline-flex;
  padding: 10px;
  padding-right: 40px;
  padding-left: 5px;
  flex-wrap: wrap;
  position: relative;
  cursor: text;
  & input {
    background-color: transparent;
    color: ${theme.name === 'classic' ? 'var(--yoroi-comp-input-border)' : '#000000d9'};
    font-size: 1rem;
    padding: 4px 6px;
    letter-spacing: 0;
  }
`
);
