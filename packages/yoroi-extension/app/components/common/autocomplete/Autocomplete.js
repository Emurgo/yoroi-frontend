/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-array-index-key */
// @flow
import { useMemo, useRef, useState } from 'react';
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
  +onFocus: any => void,
  +value: string,
  +autoFocus?: boolean,
  +type: string,
  +name: string,
  +isVerified: boolean,
  +inputRef: any,
  +prevFieldRef: any,
  +nextFieldRef: any,
|};

function useCachedOptions(options) {
  const cachedOptions = {};

  const getCachedOptions = inputValue => {
    if (!inputValue) return [];

    if (!cachedOptions[inputValue]) {
      cachedOptions[inputValue] = options.filter(w =>
        w.toLowerCase().startsWith(inputValue?.toLowerCase() ?? '')
      );
    }

    return cachedOptions[inputValue];
  };

  return { getCachedOptions };
}

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
  onFocus,
  value,
  autoFocus,
  type,
  name,
  placeholder,
  isVerified,
  inputRef,
  prevFieldRef,
  nextFieldRef,
}: Props): Node {
  const [inputValue, setInputValue] = useState<?string>(value || '');
  const isInputPresent = (inputValue?.length ?? 0) > 0;
  const { getCachedOptions } = useCachedOptions(options);
  const filteredList = isInputPresent ? getCachedOptions(inputValue) : [];
  const hasError = isInputPresent && filteredList.length === 0;

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
      const trimmedValue = inputValue?.trim() ?? '';
      switch (type) {
        case useCombobox.stateChangeTypes.InputChange:
          if (trimmedValue.length === 0) {
            closeMenu();
            onChange(trimmedValue);
          }
          setInputValue(trimmedValue);
          break;
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
        case useCombobox.stateChangeTypes.InputBlur:
          if (selectedItem || Boolean(trimmedValue)) {
            onChange(selectedItem || trimmedValue);
            setInputValue(selectedItem || trimmedValue);
            closeMenu();
          }
          break;
        default:
          break;
      }
    },
  });

  const handleKeyDownEvent = e => {
    const { target, key, code, shiftKey } = e;
    const noInputValue = inputValue?.length === 0;

    // Prevent tab if word not correct
    if (code === 'Tab' && (hasError || noInputValue) && !shiftKey) {
      e.preventDefault();
    }

    // prevent space to occur if no input value
    if (code === 'Space' && noInputValue) {
      e.preventDefault();
    }

    // when enter or space (tab works by default), go to the next field
    if ((code === 'Enter' || code === 'Space') && isOpen && !hasError) {
      // Select word if correct when pressing enter or space
      target.blur();

      if (nextFieldRef) nextFieldRef.focus();
    }

    // Focus on the previous field if backspace and no value
    if ((code === 'Backspace' || code === 'ArrowLeft') && noInputValue && prevFieldRef) {
      e.preventDefault();
      prevFieldRef.focus();
      prevFieldRef.setSelectionRange(0, prevFieldRef.value?.length);
    }
  };

  return (
    <SFormControl error={Boolean(error)} onKeyDownCapture={handleKeyDownEvent}>
      <InputWrapper
        isVerified={isVerified}
        onClick={() => !isOpen}
        error={hasError}
        isOpen={isOpen}
      >
        <Box {...getComboboxProps()}>
          <Input
            inputRef={inputRef}
            placeholder={placeholder}
            disableUnderline
            fullWidth
            autoFocus={autoFocus}
            error={Boolean(error)}
            id={id ?? 'autocomplete-combobox'}
            value={value}
            onBlur={onChange}
            onFocus={onFocus}
            {...getInputProps({ type, name, autoFocus })}
          />
        </Box>
      </InputWrapper>

      <ULList
        component="ul"
        {...getMenuProps()}
        sx={{
          boxShadow: isOpen ? '0px 3px 10px rgba(24, 26, 30, 0.08)' : 'unset',
          maxHeight: 44 * maxVisibleOptions + 'px',
          color: 'black',
          borderRadius: '8px',
          width: '120px',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {isOpen && (
          <>
            {filteredList.length === 0 ? (
              <Box sx={{ padding: '16px', bgcolor: 'var(--yoroi-palette-common-white)' }}>
                {noResultsMessage}
              </Box>
            ) : (
              filteredList.map((item, index) => {
                const regularPart = Boolean(inputValue) ? item.replace(inputValue || '', '') : item;
                return (
                  <Box
                    key={`${item}${index}`}
                    sx={{
                      padding: '16px',
                      backgroundColor:
                        highlightedIndex === index
                          ? 'var(--yoroi-palette-gray-50)'
                          : 'var(--yoroi-palette-common-white)',
                      cursor: 'pointer',
                    }}
                    {...getItemProps({ item, index })}
                  >
                    <span style={{ fontWeight: 'bold' }}>{inputValue?.toLowerCase()}</span>
                    <span>{regularPart}</span>
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
  ({ theme, error, isVerified, isOpen }) => `
  width: 100%;
  background-color: ${theme.palette.common['white']};
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
    color: ${theme.palette.primary[600]};
    font-size: 1rem;
    padding: 8px;
    letter-spacing: 0;
    text-align: center;
    border: 2px solid ${error ? '#FF1351' : theme.palette.primary[300]};
    border-radius: 8px;
    height: 40px;
    box-sizing: border-box;

    &:focus {
      border-color: ${error ? '#FF1351' : theme.palette.primary[600]};
    }

    ${
      !error
        ? `&:not([value=""]):not(:focus) {
        border-color: transparent;
        border: 0;
        background: ${
          isVerified
            ? 'linear-gradient(180deg, #93F5E1 0%, #C6F7ED 100%)'
            : 'linear-gradient(269.97deg, #E4E8F7 0%, #C6F7ED 100%)'
        };
      }`
        : ''
    }
  }
`
);

const SFormControl = styled(FormControl)({
  margin: 0,
  padding: 0,
});
