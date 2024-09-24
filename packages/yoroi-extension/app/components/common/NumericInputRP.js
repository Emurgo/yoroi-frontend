/* eslint-disable no-unused-vars */
/* eslint-disable react/require-default-props */
/* eslint-disable react/default-props-match-prop-types */
/* flow-disable */

// @flow
import { escapeRegExp } from 'lodash/string';
import React, { Component } from 'react';
import BigNumber, { BigNumber as BigNumberType } from 'bignumber.js';
import type { ElementRef, Node, Ref } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import TextField from './TextField';
import { Box } from '@mui/system';
import { Typography } from '@mui/material';

type NumericInputValue = null | number | string | BigNumber;

export const removeCharAtPosition = (str: string, pos: number): string =>
  str.substring(0, pos) + str.substring(pos + 1, str.length);

export type NumericInputProps = {|
  onChange?: Function,
  onBlur?: Function,
  autoFocus?: any,
  error?: string,
  amountFieldRevamp?: boolean,
  allowSigns?: boolean,
  allowOnlyIntegers?: boolean,
  bigNumberFormat?: BigNumber,
  decimalPlaces?: number,
  roundingMode?: BigNumber,
  value: NumericInputValue,
  decimalSeparator: any,
  groupSeparator: any,
|};

type State = {|
  inputCaretPosition: number,
  fallbackInputValue: ?string,
|};

/**
 * @deprecated NumericInput component is copy from react-polymorph library
 * https://github.com/input-output-hk/react-polymorph/blob/develop/source/components/NumericInput.js
 * but customized with MUI TextField, it needs to rework logic and flow types
 */

class NumericInputRP extends Component<NumericInputProps, State> {
  inputElement: {| current: null | ElementRef<'input'> |};
  _hasInputBeenChanged: boolean = false;

  static displayName: any = 'NumericInput';

  static defaultProps: Object = {
    allowSigns: true,
    allowOnlyIntegers: false,
    readOnly: false,
    roundingMode: BigNumber.ROUND_FLOOR,
    value: null,
  };

  constructor(props: NumericInputProps) {
    super(props);
    this.inputElement = React.createRef();
    // eslint-disable-next-line react/state-in-constructor
    this.state = {
      inputCaretPosition: 0,
      fallbackInputValue: null,
    };
  }

  componentDidMount(): void {
    const { inputElement } = this;
    const { autoFocus } = this.props;
    if (autoFocus) {
      this.focus();
      if (inputElement && inputElement.current) {
        this.setState({
          inputCaretPosition: inputElement.current.selectionStart,
        });
      }
    }
  }

  componentDidUpdate(prevProps: NumericInputProps, prevState: State) {
    const { value } = this.props;
    const { inputCaretPosition } = this.state;
    const hasValueBeenChanged = value !== prevProps.value;
    const hasCaretBeenChanged = inputCaretPosition !== prevState.inputCaretPosition;
    if (this._hasInputBeenChanged || hasValueBeenChanged || hasCaretBeenChanged) {
      this.setInputCaretPosition(inputCaretPosition);
    }
    this._hasInputBeenChanged = false;
  }

  onChange: (any, any) => void = event => {
    const newValue = event.target.value;

    const { value, onChange } = this.props;

    const result = this.processValueChange(event.nativeEvent);
    if (result) {
      this._hasInputBeenChanged = true;
      const hasValueChanged = value !== result.value;
      if (hasValueChanged && onChange) {
        onChange(result.value, event);
      }
      this.setState({
        inputCaretPosition: result.caretPosition,
        fallbackInputValue: result.fallbackInputValue,
      });
    }
  };

  /**
   * 1. Handle edge cases that don't need further processing
   * 2. Clean the given value
   * 3. Final processing
   */
  processValueChange(
    event: any
  ): ?{|
    value: NumericInputValue,
    caretPosition: number,
    fallbackInputValue?: ?string,
  |} {
    const { allowSigns, allowOnlyIntegers, decimalPlaces, value } = this.props;
    const { inputType, target } = event;
    // $FlowFixMe[prop-missing]
    const { decimalSeparator, groupSeparator } = this.getBigNumberFormat();
    const changedCaretPosition = target.selectionStart;
    const valueToProcess = target.value;
    const fallbackInputValue = this.state.fallbackInputValue;
    const isBackwardDelete = inputType === 'deleteContentBackward';
    const isForwardDelete = inputType === 'deleteContentForward';
    const isDeletion = isForwardDelete || isBackwardDelete;
    const isInsert = inputType === 'insertText';
    const deleteCaretCorrection = isBackwardDelete ? 0 : 1;
    const validInputSignsRegExp = new RegExp(
      `^([-])?([0-9${decimalSeparator}${groupSeparator}]+)?$`
    );
    const validInputNoSignsRegExp = new RegExp(`^([0-9${decimalSeparator}${groupSeparator}]+)?$`);
    const validInputOnlyIntegersRegExp = new RegExp(`^([0-9]+)?$`);
    // $FlowFixMe[sketchy-null-bool]
    let validInputRegex = allowSigns ? validInputSignsRegExp : validInputNoSignsRegExp;
    // $FlowFixMe[sketchy-null-bool]
    validInputRegex = allowOnlyIntegers ? validInputOnlyIntegersRegExp : validInputRegex;
    const valueHasLeadingZero = /^0[1-9]/.test(valueToProcess);

    /**
     * ========= HANDLE HARD EDGE-CASES =============
     */
    // Case: invalid characters entered -> refuse!
    if (!validInputRegex.test(valueToProcess)) {
      return {
        caretPosition: changedCaretPosition - 1,
        fallbackInputValue,
        value,
      };
    }

    // Case: Everything was deleted -> reset state
    if (valueToProcess === '') {
      return {
        value: null,
        caretPosition: 0,
        fallbackInputValue: null,
      };
    }

    // Case: value is the same as the fallback (which is always shown if defined)
    if (valueToProcess === this.state.fallbackInputValue) return null;

    // Case: Just minus sign was entered
    if (valueToProcess === '-') {
      return {
        value: null,
        caretPosition: 1,
        fallbackInputValue: '-',
      };
    }

    // Case: Just minus sign was entered
    if (valueToProcess === groupSeparator) {
      return {
        value: null,
        caretPosition: 0,
        fallbackInputValue: null,
      };
    }

    /**
     * ========= CLEAN THE INPUT =============
     */

    const currentNumber = value == null ? new BigNumber('0') : new BigNumber(value);
    const currentValue = fallbackInputValue ?? this.valueToFormattedString(currentNumber);

    const currentNumberOfDecimalSeparators = this.getNumberOfDecimalSeparators(currentValue);
    const hadDecimalSeparatorBefore = currentNumberOfDecimalSeparators > 0;

    // New Value
    let newValue = valueToProcess;
    let newCaretPosition = changedCaretPosition;
    const newNumberOfDecimalSeparators = this.getNumberOfDecimalSeparators(newValue);

    // Case: A second decimal separator was added somewhere
    if (hadDecimalSeparatorBefore && newNumberOfDecimalSeparators === 2) {
      const oldFirstIndex = currentValue.indexOf(decimalSeparator);
      const newFirstIndex = newValue.indexOf(decimalSeparator);
      const wasSeparatorAddedBeforeOldOne = newFirstIndex < oldFirstIndex;
      // Remove the second decimal point and set caret position
      newValue = removeCharAtPosition(
        newValue,
        wasSeparatorAddedBeforeOldOne ? newValue.lastIndexOf(decimalSeparator) : oldFirstIndex
      );
      newCaretPosition = newValue.indexOf(decimalSeparator) + 1;
    }

    // Case: Decimal separator was replaced with a number
    if (
      value != null &&
      hadDecimalSeparatorBefore &&
      newNumberOfDecimalSeparators === 0 &&
      isInsert
    ) {
      return {
        caretPosition: changedCaretPosition - 1,
        fallbackInputValue,
        value,
      };
    }

    /**
     * ========= PROCESS CLEANED INPUT =============
     */

    // Case: Just a decimal separator was entered
    if (newValue === decimalSeparator) {
      return {
        value: '0',
        caretPosition: 2,
        fallbackInputValue:
          decimalPlaces != null && decimalPlaces > 0 ? null : `0${decimalSeparator}`,
      };
    }

    // Case: Decimal separator was added at the beginning of number
    if (newValue.charAt(0) === decimalSeparator) {
      const newCaretPos = isInsert ? 2 : 1;
      return {
        value: this.bigNumberToFixed(new BigNumber(`0.${newValue.substr(1)}`)),
        caretPosition: newCaretPos,
        fallbackInputValue: null,
      };
    }

    const newNumber = newValue === '' ? null : this.formattedValueToBigNumber(newValue);

    // Case: Invalid change has been made -> ignore it
    if (newNumber == null) {
      const deleteAdjustment = isBackwardDelete ? 0 : 1; // special cases when deleting dot
      const insertAdjustment = -1; // don't move caret if numbers are "inserted"
      return {
        caretPosition: changedCaretPosition + (isDeletion ? deleteAdjustment : insertAdjustment),
        fallbackInputValue,
        value: this.bigNumberToFixed(currentNumber),
      };
    }

    const formattedNewNumber = this.valueToFormattedString(newNumber);

    // Case: Dot was added at the end of number
    if (!isDeletion && newValue.charAt(newValue.length - 1) === decimalSeparator) {
      // $FlowFixMe[prop-missing]
      return {
        value: this.bigNumberToFixed(newNumber),
        caretPosition: changedCaretPosition,
        fallbackInputValue:
          decimalPlaces != null && decimalPlaces > 0 ? null : formattedNewNumber + decimalSeparator,
        minimumFractionDigits: 0,
      };
    }

    // Case: Decimal separator was deleted while number of decimal places specified
    const hasDecimalPlaces = decimalPlaces != null;
    const wasDecimalSeparatorRemoved = hadDecimalSeparatorBefore && !newNumberOfDecimalSeparators;
    if (wasDecimalSeparatorRemoved && hasDecimalPlaces && !isInsert) {
      return {
        caretPosition: newCaretPosition + deleteCaretCorrection,
        fallbackInputValue: null,
        value: this.bigNumberToFixed(currentNumber),
      };
    }

    // Case: Valid change has been made
    const hasNumberChanged = !this.isSameValue(currentNumber, newNumber);
    const groupSeparatorsDiff =
      this.getNumberOfGroupSeparators(formattedNewNumber) -
      this.getNumberOfGroupSeparators(newValue);
    const hasNumberOfGroupSeparatorsChanged = groupSeparatorsDiff > 0;
    const onlyNumberOfGroupSeparatorsChanged =
      !hasNumberChanged && hasNumberOfGroupSeparatorsChanged;
    const leadingZeroCorrection = valueHasLeadingZero ? -1 : 0;
    const caretCorrection =
      (onlyNumberOfGroupSeparatorsChanged ? deleteCaretCorrection : groupSeparatorsDiff) +
      leadingZeroCorrection;
    return {
      caretPosition: Math.max(newCaretPosition + caretCorrection, 0),
      fallbackInputValue: null,
      value: this.bigNumberToFixed(newNumber),
    };
  }

  setInputCaretPosition: number => void = position => {
    const { inputElement } = this;
    if (!inputElement.current) return;
    const input = inputElement.current;
    input.selectionStart = position;
    input.selectionEnd = position;
  };

  focus: void => void = () => {
    const { inputElement } = this;
    if (!inputElement.current) return;
    inputElement.current.focus();
  };

  onBlur: any => void = event => {
    this.setState({
      fallbackInputValue: null,
    });
    this.props.onBlur?.(event);
  };

  getBigNumberFormat(): BigNumber {
    // $FlowFixMe[incompatible-call]
    // $FlowFixMe[incompatible-return]
    return this.props.bigNumberFormat ?? BigNumber.config().FORMAT;
  }

  valueToFormattedString(number: NumericInputValue): any {
    const { bigNumberFormat, decimalPlaces, roundingMode, allowOnlyIntegers } = this.props;
    const debugSetting = BigNumber.DEBUG;
    // $FlowFixMe[prop-missing]
    // $FlowFixMe[incompatible-use]
    if (BigNumber.isBigNumber(number) && number.isNaN()) return '';
    try {
      BigNumber.DEBUG = true;
      return allowOnlyIntegers !== null && allowOnlyIntegers === true
        ? // $FlowFixMe[incompatible-call]
          new BigNumber(number).toString()
        : // $FlowFixMe[incompatible-call]
          // $FlowFixMe[cannot-spread-interface]
          new BigNumber(number).toFormat(decimalPlaces, roundingMode, {
            // $FlowFixMe[incompatible-call]
            ...BigNumber.config().FORMAT, // defaults
            ...bigNumberFormat, // custom overrides;
          });
    } catch (e) {
      return '';
    } finally {
      BigNumber.DEBUG = debugSetting;
    }
  }
  // $FlowFixMe[prop-missing]
  bigNumberToFixed(number: BigNumber.Instance): string {
    const { decimalPlaces, roundingMode } = this.props;
    return number.toFixed(decimalPlaces, roundingMode);
  }

  formattedValueToBigNumber(value: string): BigNumber {
    // $FlowFixMe[prop-missing]
    const { decimalSeparator, groupSeparator } = this.getBigNumberFormat();
    return new BigNumber(
      value
        .replace(escapedGlobalRegExp(groupSeparator), '')
        .replace(escapedGlobalRegExp(decimalSeparator), '.')
    );
  }

  getNumberOfGroupSeparators(value: string): number {
    // $FlowFixMe[prop-missing]
    const { groupSeparator } = this.getBigNumberFormat();
    return (value.match(escapedGlobalRegExp(groupSeparator)) || []).length;
  }

  getNumberOfDecimalSeparators(value: string): number {
    // $FlowFixMe[prop-missing]
    const { decimalSeparator } = this.getBigNumberFormat();
    return (value.match(escapedGlobalRegExp(decimalSeparator)) || []).length;
  }

  isSameValue(first: ?BigNumber, second: ?BigNumber): boolean {
    // $FlowFixMe[incompatible-call]
    // $FlowFixMe[incompatible-use]
    return BigNumber.isBigNumber(first) ? first.isEqualTo(second) : first === second;
  }

  render(): Node {
    // destructuring props ensures only the "...rest" get passed down
    const {
      allowOnlyIntegers,
      allowSigns,
      decimalSeparator,
      groupSeparator,
      roundingMode,
      bigNumberFormat,
      decimalPlaces,
      onChange,
      value,
      error,
      amountFieldRevamp,
      ...rest
    } = this.props;

    const inputValue =
      this.state.fallbackInputValue != null
        ? this.state.fallbackInputValue
        : this.valueToFormattedString(value);

    return (
      <TextField
        inputRef={this.inputElement}
        onChange={this.onChange}
        onBlur={this.onBlur}
        value={inputValue}
        error={Boolean(amountFieldRevamp) ? '' : error}
        revamp={amountFieldRevamp}
        {...rest}
      />
    );
  }
}

export default NumericInputRP;

function escapedGlobalRegExp(regex) {
  return new RegExp(escapeRegExp(regex), 'g');
}

/*  Components based on NumericInput */

// This type should be kept open (not "exact") because it is a react-polymorph skin
// and should be able to pass any extra properties from react-polymorph down.
type AmountInputProps = {
  +currency?: string,
  +fees?: BigNumber | string,
  +total?: BigNumber | string,
  +error?: string,
  // inherited from RP
  +inputRef?: Ref<'input'>,
  +value: any,
  +type?: string,
  +amountFieldRevamp?: boolean,
  ...
};

const messages = defineMessages({
  feesLabel: {
    id: 'wallet.amountInput.feesLabel',
    defaultMessage: '!!!+ {amount} of fees',
  },
});

class AmountInput extends Component<AmountInputProps> {
  static defaultProps: {| error: void |} = {
    error: undefined,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { error, fees, total, currency } = this.props;
    const { intl } = this.context;

    return (
      <Box sx={{ position: 'relative' }}>
        <NumericInputRP {...this.props} />
        {/* Do not show fee in case of some error is showing */}
        {error == null || error === '' ? (
          <Typography component="div"
            sx={{
              position: 'absolute',
              bottom: '86px',
              right: '10px',
              fontWeight: 400,
              fontSize: '0.75rem',
              color: 'grayscale.900',
            }}
          >
            {intl.formatMessage(messages.feesLabel, { amount: fees })}
          </Typography>
        ) : null}

        <Typography component="div"
          variant="body3"
          sx={{
            position: 'absolute',
            bottom: '45px',
            right: error != null && error !== '' ? '45px' : '10px',
            color: 'grayscale.900',
            textTransform: 'uppercase',
          }}
        >
          {(error === null || error === '') && total ? `= ${total.toString()} ` : null}
          {currency}
        </Typography>
      </Box>
    );
  }
}

class AmountInputRevamp extends Component<AmountInputProps> {
  static defaultProps: {| error: void |} = {
    error: undefined,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { error, fees, total, currency } = this.props;
    const { intl } = this.context;

    return (
      <Box
        sx={{
          width: '100%',
          '& > div': {
            padding: '0px',
            margin: '0px',
            height: '32px',
          },
          '& input': {
            border: 'none',
            outline: 'none',
            width: '100%',
            fontSize: '24px',
            lineHeight: '32px',
            marginTop: '-16px',
          },
          '& input::placeholder': { color: 'grayscale.600' },
        }}
      >
        <NumericInputRP {...this.props} />
      </Box>
    );
  }
}

export { AmountInput, AmountInputRevamp };
