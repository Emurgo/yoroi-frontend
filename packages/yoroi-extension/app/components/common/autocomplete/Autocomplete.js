// @flow
import type { Node } from 'react';
import { useState } from 'react';
import { useCombobox } from 'downshift';
import { Input, Box, FormControl } from '@mui/material';
import { styled } from '@mui/system';

type Props = {|
  +options: Array<string>,
  +error?: boolean,
  +maxVisibleOptions?: number,
  +noResultsMessage?: string,
  +id: string,
  +placeholder: string,
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
  error = null,
  maxVisibleOptions = 5,
  noResultsMessage,
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
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
    closeMenu,
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
    onStateChange: ({ inputValue: stateInputValue, type: stateType, selectedItem }) => {
      const stateTrimmedValue = stateInputValue?.trim() ?? '';
      const trimmedValue = inputValue?.trim() ?? '';

      // edge case where the user doesn't select an option
      // neither uses the keyboard to enter, space or tab
      if (stateType === useCombobox.stateChangeTypes.InputBlur) {
        const index = highlightedIndex !== -1 ? highlightedIndex : 0;
        const firstOption = filteredList[index] ?? '';
        const noFullValue = !selectedItem && !Boolean(stateTrimmedValue);
        const hasSuggestionsFromValue = Boolean(trimmedValue) && Boolean(firstOption);
        if (noFullValue && hasSuggestionsFromValue) {
          onChange(firstOption);
          setInputValue(firstOption);
          closeMenu();
          return;
        }
      }

      // all other cases
      switch (stateType) {
        case useCombobox.stateChangeTypes.InputChange:
          if (stateTrimmedValue.length === 0) {
            closeMenu();
            onChange(stateTrimmedValue);
          }
          setInputValue(stateTrimmedValue);
          break;
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
        case useCombobox.stateChangeTypes.InputBlur:
          if (selectedItem || Boolean(stateTrimmedValue)) {
            onChange(selectedItem || stateTrimmedValue);
            setInputValue(selectedItem || stateTrimmedValue);
            closeMenu();
          }
          break;
        default:
          break;
      }
    },
  });

  const handleKeyDownEvent = e => {
    const { target, code, shiftKey } = e;
    const noInputValue = inputValue?.length === 0;

    // Prevent tab if word not correct
    if (code === 'Tab' && hasError && !shiftKey) {
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
          color: 'ds.gray_900',
          borderRadius: '8px',
          width: '120px',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {isOpen && (
          <>
            {filteredList.length === 0 ? (
              <Box sx={{ padding: '16px', bgcolor: 'ds.bg_color_max' }}>{noResultsMessage}</Box>
            ) : (
              <Box sx={{ paddingY: '8px' }}>
                {filteredList.map((item, index) => {
                  const regularPart = inputValue != null ? item.replace(inputValue.toLowerCase(), '') : item;
                  return (
                    <Box
                      key={`${item}${index}`}
                      sx={{
                        padding: '16px',
                        backgroundColor: highlightedIndex === index ? 'ds.gray_50' : 'ds.bg_color_max',
                        cursor: 'pointer',
                      }}
                      {...getItemProps({ item, index })}
                    >
                      <span style={{ fontWeight: 'bold' }}>{inputValue?.toLowerCase()}</span>
                      <span>{regularPart}</span>
                    </Box>
                  );
                })}
              </Box>
            )}
          </>
        )}
      </ULList>
    </SFormControl>
  );
}

export default Autocomplete;

Autocomplete.defaultProps = {
  error: false,
  autoFocus: false,
  maxVisibleOptions: 5,
  noResultsMessage: '',
};

const ULList = styled(Box)(({ theme }) => ({
  width: '100%',
  background: theme.palette.ds.bg_color_max,
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
}));

const InputWrapper = styled(Box)(
  ({ theme, error, isVerified }) => `
  width: 100%;
  background-color: transparent;
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
    border: 2px solid ${error ? theme.palette.ds.sys_magenta_500 : theme.palette.ds.primary_300};
    border-radius: 8px;
    height: 40px;
    box-sizing: border-box;

    &:focus {
      border-color: ${error ? theme.palette.ds.sys_magenta_500 : theme.palette.ds.el_primary_medium};
    }

    ${
      !error
        ? `&:not([value=""]):not(:focus) {
        border-color: transparent;
        border: 0;
        background: ${isVerified ? theme.palette.ds.el_secondary : theme.palette.ds.primary_100};
        color: ${isVerified ? theme.palette.ds.black_static : theme.palette.ds.primary_600};
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
