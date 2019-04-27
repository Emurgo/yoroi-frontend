// @flow
import React from 'react';
import type { Ref, Element } from 'react';

// external libraries
import classnames from 'classnames';

// components
import { FormField } from 'react-polymorph/lib/components/FormField';

// skins
import { FormFieldOwnSkin } from './FormFieldOwnSkin';

// internal utility functions
import { pickDOMProps } from 'react-polymorph/lib/utils/props';

import styles from './InputOwnSkin.scss';

type Props = {
  className?: ?string,
  disabled?: boolean,
  error?: string,
  label?: string | Element<any>,
  inputRef: Ref<'input'>,
  onBlur?: Function,
  onChange?: Function,
  onFocus?: Function,
  onKeyPress?: Function,
  placeholder?: string,
  readOnly?: boolean,
  theme: Object,
  themeId: string,
  value: string,
  done?: boolean,
  type: string,
};

type State = {
  focused: boolean,
};

export const InputOwnSkin = class extends React.Component<Props, State> {
  static defaultProps = {
    className: '',
    disabled: undefined,
    error: undefined,
    label: undefined,
    onBlur: undefined,
    onChange: undefined,
    onFocus: undefined,
    onKeyPress: undefined,
    placeholder: undefined,
    readOnly: undefined,
    done: undefined,
  };

  state = {
    focused: false,
  }

  handleFocus = () => this.setState({ focused: true })

  handleBlur = () => this.setState({ focused: false })

  render() {
    return (
      <FormField
        className={this.props.className}
        disabled={this.props.disabled}
        label={this.props.label}
        error={this.props.error}
        inputRef={this.props.inputRef}
        skin={FormFieldOwnSkin}
        theme={this.props.theme}
        done={this.props.done}
        type={this.props.type}
        focused={this.state.focused}
        render={({ inputType }) => (
          <input
            ref={this.props.inputRef}
            {...pickDOMProps(this.props)}
            type={inputType}
            className={classnames([
              this.props.theme[this.props.themeId].input,
              this.props.disabled ? this.props.theme[this.props.themeId].disabled : null,
              this.props.error ? this.props.theme[this.props.themeId].errored : null,
              (this.props.error || this.props.type === 'password' || this.props.done) ? styles.icon : null,
              ((this.props.error || this.props.type === 'password') && this.props.done) ? styles.doubleIcon : null
            ])}
            readOnly={this.props.readOnly}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
          />
        )}
      />
    );
  }
};
