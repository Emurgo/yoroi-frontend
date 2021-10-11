// @flow
import type { Element, ElementRef, } from 'react';

// external libraries
import classnames from 'classnames';

// components
import { Options } from 'react-polymorph/lib/components/Options';
import { Input } from 'react-polymorph/lib/components/Input';

// skins
import { TokenOptionSkin } from './TokenOptionSkin';
import { InputSkin } from 'react-polymorph/lib/skins/simple/InputSkin';

type Props = {|
  className: string,
  error: string | Element<any>,
  getSelectedOption: Function,
  handleChange: Function,
  handleInputClick: Function,
  inputRef: ElementRef<'input'>,
  isOpen: boolean,
  isOpeningUpward: boolean,
  label: string | Element<any>,
  onBlur: Function,
  onChange: Function,
  onFocus: Function,
  options: Array<{|
    isDisabled: boolean,
    value: any
  |}>,
  optionRenderer: Function,
  optionsRef: ElementRef<any>,
  optionsMaxHeight: number,
  placeholder: string,
  rootRef: ElementRef<*>,
  selectionRenderer?: Function,
  theme: Object, // will take precedence over theme in context if passed
  themeId: string,
  toggleOpen: Function,
  toggleMouseLocation: Function,
  value: string,
|};

export const SelectTokenSkin: Props => React$Node = (props) => {
  const selectedOption = props.getSelectedOption();
  const inputValue = selectedOption ? selectedOption.label : '';
  const { theme, themeId } = props;

  return (
    <div
      ref={props.rootRef}
      className={classnames([
        props.className,
        theme[themeId].select,
        props.isOpen ? theme[themeId].isOpen : null,
        props.isOpeningUpward ? theme[themeId].openUpward : null
      ])}
    >
      <div className={theme[themeId].selectInput}>
        <Input
          skin={InputSkin}
          theme={theme}
          inputRef={props.inputRef}
          label={props.label}
          value={inputValue}
          onClick={props.handleInputClick}
          placeholder={props.placeholder}
          error={props.error}
          selectionRenderer={props.selectionRenderer}
          readOnly
          selectedOption={selectedOption}
        />
      </div>
      <Options
        skin={TokenOptionSkin}
        theme={theme}
        isOpen={props.isOpen}
        optionsRef={props.optionsRef}
        optionsMaxHeight={props.optionsMaxHeight}
        options={props.options}
        isOpeningUpward={props.isOpeningUpward}
        onChange={props.handleChange}
        optionRenderer={props.optionRenderer}
        selectedOption={selectedOption}
        noResults={!props.options.length}
        targetRef={props.inputRef}
        toggleMouseLocation={props.toggleMouseLocation}
        toggleOpen={props.toggleOpen}
        optionHeight={70 /* empirically this is the size of a token entry */}
      />
    </div>
  );
}
