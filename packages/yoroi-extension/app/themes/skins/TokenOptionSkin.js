// @flow
import React from 'react';
import type { Element, ElementRef } from 'react';

// external libraries
import classnames from 'classnames';
import { isFunction, isObject } from 'lodash';

// components
import { Bubble } from 'react-polymorph/lib/components/Bubble';
import { ScrollBar } from 'react-polymorph/lib/components/ScrollBar';

// skins
import { BubbleSkin } from 'react-polymorph/lib/skins/simple/BubbleSkin';

import TokenOptionHeader from '../../components/widgets/tokenOption/TokenOptionHeader';

/* eslint-disable no-else-return */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/require-default-props */

type Props = {|
  getOptionProps: Function,
  getHighlightedOptionIndex: Function,
  handleClickOnOption: Function,
  isHighlightedOption: Function,
  isOpen: boolean,
  isOpeningUpward: boolean,
  isSelectedOption: Function,
  noOptionsArrow?: boolean,
  noResults: boolean,
  noResultsMessage: string | Element<any>,
  noSelectedOptionCheckmark?: boolean,
  optionHeight: number,
  optionRenderer: Function,
  options: Array<any>,
  optionsRef: ElementRef<*>,
  optionsMaxHeight: number,
  render: Function,
  selectedOption: any,
  setHighlightedOptionIndex: Function,
  setMouseIsOverOptions?: (boolean) => void,
  targetRef: ElementRef<*>,
  theme: Object,
  themeId: string,
|};

export const TokenOptionSkin: Props => React$Node = (props: Props) => {
  const {
    getOptionProps,
    getHighlightedOptionIndex,
    handleClickOnOption,
    isHighlightedOption,
    isOpen,
    isOpeningUpward,
    isSelectedOption,
    noOptionsArrow,
    noResults,
    noResultsMessage,
    noSelectedOptionCheckmark,
    optionHeight,
    optionsMaxHeight,
    optionRenderer,
    options,
    optionsRef,
    render,
    setHighlightedOptionIndex,
    setMouseIsOverOptions,
    targetRef,
    theme,
    themeId,
  } = props;

  const highlightedOptionIndex = getHighlightedOptionIndex();
  const isFirstOptionHighlighted = highlightedOptionIndex === 0;
  const sortedOptions = isOpeningUpward ? options.slice().reverse() : options;

  const renderOptions = () => {
    // check for user's custom render function
    // if Options is being rendered via Autocomplete,
    // the value of props.render is renderOptions passed down from AutocompleteSkin
    if (!noResults && render) {
      // call user's custom render function
      return render(getOptionProps);
    } else if (!noResults && !render) {
      // render default simple skin
      return (
        <>
          <li
            className={classnames([
              theme[themeId].option,
            ])}
          >
            <TokenOptionHeader />
          </li>
          {sortedOptions.map((option, index) => {
            // set reference of event handlers in memory to prevent excess re-renders
            const boundSetHighlightedOptionIndex = setHighlightedOptionIndex.bind(null, index);
            const boundHandleClickOnOption = handleClickOnOption.bind(null, option);

            return (
              <li
                role="presentation"
                aria-hidden
                key={index}
                className={classnames([
                  option.className ? option.className : null,
                  theme[themeId].option,
                  isHighlightedOption(index) ? theme[themeId].highlightedOption : null,
                  isSelectedOption(index) ? theme[themeId].selectedOption : null,
                  option.isDisabled ? theme[themeId].disabledOption : null,
                  noSelectedOptionCheckmark === true
                    ? theme[themeId].hasNoSelectedOptionCheckmark
                    : null,
                ])}
                onClick={boundHandleClickOnOption}
                onMouseEnter={boundSetHighlightedOptionIndex}
              >
                {renderOption(option)}
              </li>
            );
          })}
        </>
      );
    }
    // render no results message
    return <li className={theme[themeId].option}>{noResultsMessage}</li>;
  };

  const renderOption = option => {
    // check if user has passed render prop "optionRenderer"
    if (optionRenderer && isFunction(optionRenderer)) {
      // call user's custom rendering logic
      return optionRenderer(option);
    } else if (isObject(option)) {
      return <span className={theme[themeId].label}>{option.label}</span>;
    }
    return option;
  };

  const getScrollBarHeight = (): number => {
    const headerSize = 52; // empirically the size of the header
    if (!options.length) return optionHeight + headerSize;
    if (optionsMaxHeight < (options.length * optionHeight) + headerSize) {
      return optionsMaxHeight;
    }
    return (options.length * optionHeight) + headerSize;
  };

  // Enforce max height of options dropdown if necessary
  const optionsStyle = optionsMaxHeight == null ? null : {
    maxHeight: `${optionsMaxHeight}px`
  };

  return (
    <Bubble
      className={classnames([
        theme[themeId].options,
        isOpen ? theme[themeId].isOpen : null,
        isOpeningUpward ? theme[themeId].openUpward : null,
        isFirstOptionHighlighted && !noResults
          ? theme[themeId].firstOptionHighlighted
          : null
      ])}
      isTransparent={false}
      skin={BubbleSkin}
      isOpeningUpward={isOpeningUpward}
      isHidden={!isOpen}
      isFloating
      noArrow={noOptionsArrow}
      targetRef={targetRef}
    >
      <ul
        style={optionsStyle}
        ref={optionsRef}
        className={theme[themeId].ul}
        onMouseEnter={() => setMouseIsOverOptions && setMouseIsOverOptions(true)}
        onMouseLeave={() => setMouseIsOverOptions && setMouseIsOverOptions(false)}
      >
        <ScrollBar style={{ height: `${getScrollBarHeight()}px` }}>
          {renderOptions()}
        </ScrollBar>
      </ul>
    </Bubble>
  );
};