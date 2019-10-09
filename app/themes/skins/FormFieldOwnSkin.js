// @flow
import React from 'react';
import type { Element } from 'react';
import { omit } from 'lodash';
import classnames from 'classnames';
import SvgInline from 'react-svg-inline';
import ErrorSvg from '../../assets/images/input/exclamationmark.inline.svg';
import PasswordSvg from '../../assets/images/input/password.watch.inline.svg';
import PasswordHiddenSvg from '../../assets/images/input/password.hiden.inline.svg';
import SuccessSvg from '../../assets/images/widget/tick-green.inline.svg';
import DeleteMemoSvg from '../../assets/images/cross.inline.svg';
import styles from './FormFieldOwnSkin.scss';

// This type should be kept open (not "exact") because it is a react-polymorph skin
// and should be able to pass any extra properties from react-polymorph down.
type Props = {
  className: string,
  disabled: boolean,
  error: string | Element<any>,
  focusChild: MouseEvent=>void,
  label: string | Element<any>,
  onChange: Event=>void,
  render: Object=>React$Element<any>,
  setError: Function,
  theme: Object,
  themeId: string,
  done?: boolean,
  type: string,
  focused: boolean,
  onDelete: Function,
};

type State = {
  isPasswordShown: boolean,
};

export const FormFieldOwnSkin = class extends React.Component<Props, State> {
  static defaultProps = {
    done: undefined
  }

  state = {
    isPasswordShown: false
  }

  showPassword = () => this.setState(
    prevState => ({ isPasswordShown: !prevState.isPasswordShown })
  )

  render() {
    const { isPasswordShown } = this.state;
    const renderProps = { ...this.props, inputType: isPasswordShown ? 'text' : this.props.type };

    return (
      <div
        className={classnames([
          this.props.className,
          this.props.theme[this.props.themeId].root,
          this.props.disabled ? this.props.theme[this.props.themeId].disabled : null,
          this.props.error ? this.props.theme[this.props.themeId].errored : null
        ])}
      >
        {this.props.error && (
          <div className={this.props.theme[this.props.themeId].error}>{this.props.error}</div>
        )}
        <fieldset
          className={classnames([
            this.props.theme[this.props.themeId].inputWrapper,
            styles.inputWrapper,
            this.props.focused ? styles.focused : '',
            this.props.error ? styles.error : '',
          ])}
        >

          <div className={styles.iconsWrapper}>
            {this.props.done === true && <SvgInline svg={SuccessSvg} />}
            {this.props.type === 'password' && !this.props.error ? (
              <button tabIndex="-1" type="button" onClick={this.showPassword}>
                {isPasswordShown
                  ? <SvgInline svg={PasswordSvg} />
                  : <SvgInline svg={PasswordHiddenSvg} />}
              </button>
            ) : null}
            {this.props.type === 'memo' && !this.props.error ? (
              <button tabIndex="-1" type="button" onClick={this.props.onDelete}>
                <SvgInline svg={DeleteMemoSvg} />
              </button>
            ) : null}
            {this.props.error && <SvgInline svg={ErrorSvg} />}
          </div>
          {this.props.render(omit(renderProps, ['themeId']))}
          {this.props.label && (
            // eslint-disable-next-line
            <legend
              // eslint-disable-next-line
              role="presentation"
              aria-hidden
              className={classnames([
                styles.legend,
                this.props.error ? styles.error : '',
              ])}
              onClick={this.props.focusChild}
            >
              {this.props.label}
            </legend>
          )}
        </fieldset>
      </div>
    );
  }
};
