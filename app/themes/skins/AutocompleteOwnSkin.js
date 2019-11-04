// @flow
import React from 'react';
import type { ElementRef, Element } from 'react';

// external libraries
import { slice } from 'lodash';
import classnames from 'classnames';

// components
import { FormField } from 'react-polymorph/lib/components/FormField';
import { Options } from 'react-polymorph/lib/components/Options';

// skins
import { FormFieldOwnSkin } from './FormFieldOwnSkin';
import { OptionsSkin } from 'react-polymorph/lib/skins/simple/OptionsSkin';

type GetSelectionPropsT = (...args: any) => Object;
// This type should be kept open (not "exact") because it is a react-polymorph skin
// and should be able to pass any extra properties from react-polymorph down.
type Props = {
  className: string,
  error: string,
  filteredOptions: Array<any>,
  getSelectionProps: GetSelectionPropsT,
  handleAutocompleteClick: MouseEvent => void,
  handleChange: Function,
  handleInputChange: Event => void,
  inputRef: ElementRef<any>,
  inputValue: string,
  isOpeningUpward: boolean,
  isOpen: boolean,
  label: string | Element<any>,
  maxSelections: number,
  maxVisibleOptions: number,
  onKeyDown: KeyboardEvent => void,
  options: Array<any>,
  optionsRef: ElementRef<any>,
  optionsMaxHeight: number,
  placeholder: string,
  removeOption: number => void,
  renderSelections: GetSelectionPropsT => React$Element<any>,
  renderOptions: Function,
  rootRef: ElementRef<any>,
  selectedOptions: Array<any>,
  suggestionsRef: ElementRef<any>,
  theme: Object,
  themeId: string,
  toggleMouseLocation: Function,
  toggleOpen: Function,
  done: Boolean
};

export const AutocompleteOwnSkin = (props: Props) => {
  const theme = props.theme[props.themeId];

  const filteredAndLimitedOptions = slice(
    props.filteredOptions,
    0,
    props.maxVisibleOptions
  );

  // show placeholder only if no maximum selections declared or maximum not reached
  const canMoreOptionsBeSelected =
    props.selectedOptions.length < props.maxSelections;

  const placeholder =
    !props.maxSelections || canMoreOptionsBeSelected ? props.placeholder : '';

  const renderSelectedOptions = () => {
    // check if the user passed a renderSelections function
    if (props.selectedOptions && props.renderSelections) {
      // call custom renderSelections function
      return props.renderSelections(props.getSelectionProps);
    }
    if (props.selectedOptions && !props.renderSelections) {
      // render default skin
      return props.selectedOptions.map((selectedOption, index) => (
        <span className={theme.selectedWordBox} key={`${selectedOption}-${index.toString()}`}>
          <span className={theme.selectedWordValue}>
            {selectedOption}
            <span
              role="presentation"
              aria-hidden
              className={theme.selectedWordRemoveButton}
              onClick={props.removeOption.bind(null, index)}
            >
              &times;
            </span>
          </span>
        </span>
      ));
    }
    return null;
  };

  // A label, input, and selected words are the content
  const renderContent = () => (
    <FormField
      error={props.error}
      inputRef={props.inputRef}
      label={props.label}
      skin={FormFieldOwnSkin}
      done={props.done}
      render={() => (
        <div
          className={classnames([
            theme.autocompleteContent,
            props.isOpen ? theme.opened : null,
            (props.selectedOptions.length ||
            (props.inputValue != null && props.inputValue.length > 0))
              ? 'hasSelectedWords'
              : null,
            props.error ? theme.errored : null
          ])}
          ref={props.suggestionsRef}
        >
          <div className={theme.selectedWords}>
            {renderSelectedOptions()}
            <input
              ref={props.inputRef}
              placeholder={placeholder}
              value={props.inputValue}
              onChange={props.handleInputChange}
              onKeyDown={props.onKeyDown}
              required="required"
            />
          </div>
        </div>
      )}
    />
  );

  return (
    <div
      aria-hidden
      className={classnames([props.className, theme.autocompleteWrapper])}
      onClick={props.handleAutocompleteClick}
      ref={props.rootRef}
      role="presentation"
    >

      {renderContent()}

      <Options
        isOpen={props.isOpen}
        isOpeningUpward={props.isOpeningUpward}
        noResults={!props.filteredOptions.length}
        onChange={props.handleChange}
        options={filteredAndLimitedOptions}
        optionsRef={props.optionsRef}
        optionsMaxHeight={props.optionsMaxHeight}
        render={props.renderOptions}
        resetOnClose
        selectedOptions={props.selectedOptions}
        skin={OptionsSkin}
        targetRef={props.suggestionsRef}
        toggleMouseLocation={props.toggleMouseLocation}
        toggleOpen={props.toggleOpen}
      />
    </div>
  );
};
