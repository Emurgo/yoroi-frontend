/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-array-index-key */
// @flow
import { useRef, useState } from 'react';
import type { Node } from 'react';
import { useCombobox } from 'downshift';
import { Input, Box, InputLabel, FormControl, FormHelperText, Chip, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import { slice } from 'lodash';
import { ReactComponent as CloseIcon } from '../../../assets/images/close-chip.inline.svg';

type Props = {|
  +options: Array<string>,
  +done?: boolean,
  +disabled?: boolean,
  +error?: boolean,
  +maxVisibleOptions?: number,
  +noResultsMessage?: string,
  +id: string,
  +placeholder: string,
  +label: string,
  +onChange: string => void,
  +value: string,
  +autoFocus?: boolean,
  +type: string,
  +name: string,
  +chipProps?: Object,
  +inputRef?:
    | typeof undefined
    | (<T>(
        initialValue: T
      ) => {|
        current: T,
      |}),
|};

function Autocomplete({
  options,
  done,
  error = null,
  maxVisibleOptions = 5,
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
  inputRef = null,
}: Props): Node {
  const [inputValue, setInputValue] = useState<?string>(value);
  const isInputPresent = (inputValue?.length ?? 0) > 0;
  const filteredList = isInputPresent
    ? options.filter(w => w.toLowerCase().startsWith(inputValue?.toLowerCase() ?? ''))
    : options;
  const sliceArrayItems = slice(filteredList, 0, maxVisibleOptions);

  const {
    isOpen,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
    closeMenu,
    selectItem,
  } = useCombobox({
    inputValue,
    defaultHighlightedIndex: 0,
    selectedItem: '',
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
          if (inputValue.length === 0) closeMenu();
          setInputValue(inputValue);
          onChange(inputValue);
          break;
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
        case useCombobox.stateChangeTypes.InputBlur:
          if (selectedItem && Boolean(inputValue)) {
            onChange(inputValue);
            setInputValue(inputValue);
            closeMenu();
          }
          break;
        default:
          break;
      }
    },
  });

  return (
    <SFormControl error={Boolean(error)}>
      <InputWrapper onClick={() => !isOpen} error={error} isOpen={isOpen}>
        <Box {...getComboboxProps()}>
          <Input
            placeholder={placeholder}
            disableUnderline
            fullWidth
            autoFocus={autoFocus}
            error={Boolean(error)}
            id={id ?? 'autocomplete-combobox'}
            ref={inputRef}
            value={value}
            onChange={onChange}
            {...getInputProps({ type, name, autoFocus })}
          />
        </Box>
      </InputWrapper>

      <ULList
        component="ul"
        {...getMenuProps()}
        sx={{ boxShadow: isOpen ? '0 3px 7px 0 rgba(74,74,74,0.16)' : 'unset' }}
      >
        {isOpen && (
          <>
            {sliceArrayItems.length === 0 ? (
              <Box sx={{ padding: '14px 20px', bgcolor: 'var(--yoroi-palette-common-white)' }}>
                {noResultsMessage}
              </Box>
            ) : (
              sliceArrayItems.map((item, index) => {
                return (
                  <Box
                    key={`${item}${index}`}
                    sx={{
                      padding: '14px 20px',
                      backgroundColor:
                        highlightedIndex === index
                          ? 'var(--yoroi-palette-gray-50)'
                          : 'var(--yoroi-palette-common-white)',
                      cursor: 'pointer',
                    }}
                    {...getItemProps({ item, index })}
                  >
                    {item}
                  </Box>
                );
              })
            )}
          </>
        )}
      </ULList>
    </SFormControl>
  );
}

export default Autocomplete;

Autocomplete.defaultProps = {
  done: false,
  disabled: false,
  error: false,
  autoFocus: false,
  maxVisibleOptions: 5,
  noResultsMessage: '',
  chipProps: null,
};

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
  background-color: var(--yoroi-palette-common-white);
  height: 40px;
  align-content: baseline;
  display: inline-flex;
  flex-wrap: wrap;
  position: relative;
  cursor: text;
  margin-bottom: 0;
  border-radius: 8px;

  & input {
    background-color: transparent;
    color: var(--yoroi-palette-primary-200);
    font-size: 1rem;
    padding: 8px;
    letter-spacing: 0;
    text-align: center;
    border: 2px solid ${error ? 'var(--yoroi-comp-input-error)' : '#7892E8'};
    border-radius: 8px;
    height: 40px;
    box-sizing: border-box;

    &:focus {
      border-color: var(--yoroi-palette-primary-200);
    }

    &:not([value=""]):not(:focus) {
      border-color: transparent;
      background: linear-gradient(269.97deg, #E4E8F7 0%, #C6F7ED 99.98%);
      background-origin: border-box;
      background-clip: content-box, border-box;
      background: linear-gradient(269.97deg, #E4E8F7 0%, #C6F7ED 99.98%);
    }
  }
`
);

const SFormControl = styled(FormControl)({
  margin: 0,
  padding: 0,
});
