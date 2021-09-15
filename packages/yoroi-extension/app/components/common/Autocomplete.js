/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-array-index-key */
// @flow
import { useState } from 'react';
import type { Node } from 'react';
import { useCombobox, useMultipleSelection } from 'downshift';
import { IconButton, Input, Box, InputLabel, FormControl, FormHelperText } from '@mui/material';
import { styled } from '@mui/system';
import { slice } from 'lodash';
import SuccessIcon from '../../assets/images/forms/done.inline.svg';
import ErrorIcon from '../../assets/images/forms/error.inline.svg';

type Props = {|
  +options: Array<any>,
  +maxSelections: number,
  +done: boolean,
  +disabled: boolean,
  +error: ?boolean,
  +maxVisibleOptions: number,
  +noResultsMessage: string,
  +id: string,
  +placeholder: string,
  +label: string,
  +preselectedOptions: Array<any>,
  +onChange: () => void,
  +value: Array<any>,
|};

export default function Autocomplete({
  options,
  maxSelections,
  done,
  error = null,
  maxVisibleOptions = 10,
  noResultsMessage,
  label,
  disabled,
  id,
  // onChange,
  // value: selectedItems,
  placeholder,
}: Props): Node {
  const [inputValue, setInputValue] = useState<string>('');

  const filteredList = options.filter(
    item => !inputValue || item.toLowerCase().includes(inputValue.toLowerCase())
  );
  const sliceArrayItems = slice(filteredList, 0, maxVisibleOptions);

  const {
    getSelectedItemProps,
    getDropdownProps,
    addSelectedItem,
    removeSelectedItem,
    selectedItems,
  } = useMultipleSelection();

  const {
    isOpen,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
    toggleMenu,
  } = useCombobox({
    inputValue,
    defaultHighlightedIndex: 0,
    selectedItem: null,
    items: filteredList,
    stateReducer: (state, actionAndChanges) => {
      const { changes, type } = actionAndChanges;
      switch (type) {
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
          if (selectedItem && selectedItems.length < maxSelections) {
            setInputValue('');
            addSelectedItem(selectedItem);
          }
          break;
        default:
          break;
      }
    },
  });

  return (
    <StyledFormControl variant="outlined" error={Boolean(error)} disabled={disabled} fullWidth>
      <StyledInputLabel htmlFor={id ?? 'autocomplete-combobox'} shrink {...getLabelProps()}>
        {label}
      </StyledInputLabel>
      <InputWrapper onClick={toggleMenu} error={error} isOpen={isOpen}>
        {selectedItems.map((selectedItem, index) => (
          <Tag key={`selected-item-${index}`} {...getSelectedItemProps({ selectedItem, index })}>
            <span>{selectedItem}</span>
            <IconButton
              color="inherit"
              onClick={() => {
                removeSelectedItem(selectedItem);
              }}
            >
              ×
            </IconButton>
          </Tag>
        ))}
        <Box sx={{ flex: 1 }} {...getComboboxProps()}>
          <Input
            placeholder={selectedItems.length >= maxSelections ? '' : placeholder}
            disabled={selectedItems.length >= maxSelections}
            disableUnderline
            fullWidth
            error={Boolean(error)}
            id={id ?? 'autocomplete-combobox'}
            {...getInputProps(getDropdownProps({ preventKeyAction: isOpen }))}
          />
        </Box>
        <Box display="flex" alignItems="center">
          {done === true ? <SuccessIcon /> : null}
          {Boolean(error) === true ? <ErrorIcon /> : null}
        </Box>
      </InputWrapper>
      <FormHelperText sx={{ marginLeft: 0 }} id={id ?? 'autocomplete-combobox'}>
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

const StyledFormControl = styled(FormControl)({
  marginTop: '23px',
  paddingBottom: '12px',
  color: 'hsl(237 37% 11%)',
});

const StyledInputLabel = styled(InputLabel)({
  color: 'hsl(237 37% 11%)',
  marginTop: '-26px',
  letterSpacing: '1.12px',
  fontWeight: 500,
  fontSize: '1rem',
  transform: 'translate(0) scale(1)',
});

const Tag = styled(Box)({
  borderRadius: '2px',
  margin: '5px 3px 0 3px',
  padding: '3px 0 3px 6px',
  background: 'hsl(9deg 46% 73%)',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  color: 'hsl(210deg 25% 98%)',
  fontSize: '0.9rem',
  fontWeight: 300,
  span: {
    marginLeft: '2px',
  },
  button: {
    fontSize: '0.875rem',
    '&:hover': {
      background: 'none',
    },
  },
});

const ULList = styled(Box)({
  width: '100%',
  background: 'hsl(240deg 9% 96%)',
  margin: 0,
  borderTop: 0,
  position: 'absolute',
  zIndex: 1000,
  left: 0,
  top: '87%',
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
      : '#d9d9d9'
  };
  background-color: ${theme.name === 'classic' ? 'hsl(240 9% 96%)' : '#fff'};
  border-radius: 0;
  min-height: 73px;
  display: inline-flex;
  padding: 0 10px 10px 2px;
  flex-wrap: wrap;

  & input {
    background-color: transparent;
    color: ${theme.name === 'classic' ? 'hsl(237 37% 11%)' : 'rgba(0,0,0,.85)'};
    height: 30px;
    color: hsl(225deg 4% 30%);
    font-weight: 300;
    font-size: 0.9rem;
    padding: 4px 6px;
    letter-spacing: 0;
    border: 0;
    margin: 0;
    outline: 0;
  }
`
);
