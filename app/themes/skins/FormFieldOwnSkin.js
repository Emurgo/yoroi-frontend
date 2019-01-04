// @flow
import React, { Component } from 'react';
import type { Element } from 'react';
import classnames from 'classnames';
import { themr } from 'react-css-themr';
import { FORM_FIELD } from 'react-polymorph/lib/skins/simple/identifiers';
import SvgInline from 'react-svg-inline';
import ErrorSvg from '../../assets/images/input/exclamationmark.inline.svg';
import PasswordSvg from '../../assets/images/input/password.watch.inline.svg';
import PasswordHiddenSvg from '../../assets/images/input/password.hiden.inline.svg';
import SuccessSvg from '../../assets/images/widget/tick-green.inline.svg';

type Props = {
  className: string,
  disabled: boolean,
  error: string | Element<any>,
  label: string | Element<any>,
  component: Object,
  children: Element<any>,
  theme: Object,
  input: Function,
  done?: boolean,
  type: string
};

type State = {
  isPasswordShown: boolean,
};

class FormFieldOwnSkin extends Component<Props, State> {
  static defaultProps = {
    done: undefined
  }

  state = {
    isPasswordShown: false
  }

  showPassword = () => this.setState(prevState => ({ isPasswordShown: !prevState.isPasswordShown }))

  render() {
    const { isPasswordShown } = this.state;

    return (
      <div
        className={classnames([
          this.props.className,
          this.props.theme.root,
          this.props.disabled ? this.props.theme.disabled : null,
          this.props.error ? this.props.theme.errored : null,
        ])}
      >
        {this.props.error && <div className={this.props.theme.error}>{this.props.error}</div>}
        {this.props.label && (
          // eslint-disable-next-line
          <label
            className={this.props.theme.label}
            onClick={this.props.component.focus ? this.props.component.focus : null}
          >
            {this.props.label}
          </label>
        )}
        <div className={this.props.theme.inputWrapper}>
          {this.props.input(isPasswordShown ? 'text' : this.props.type)}

          <div>
            {this.props.done && <SvgInline svg={SuccessSvg} cleanup={['title']} />}
            {this.props.type === 'password' && !this.props.error ? (
              <button type="button" onClick={this.showPassword}>
                {isPasswordShown ? <SvgInline svg={PasswordSvg} cleanup={['title']} /> : <SvgInline svg={PasswordHiddenSvg} cleanup={['title']} />}
              </button>
            ) : null}
            {this.props.error && <SvgInline svg={ErrorSvg} cleanup={['title']} />}
          </div>

          {this.props.children}
        </div>
      </div>
    );
  }
}

export default themr(FORM_FIELD)(FormFieldOwnSkin);
