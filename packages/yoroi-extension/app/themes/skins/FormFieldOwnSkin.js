// @flow
import React from 'react';
import type { Element, Node } from 'react';
import { omit } from 'lodash';
import classnames from 'classnames';
import ErrorSvg from '../../assets/images/input/exclamationmark.inline.svg';
import PasswordShownIcon from '../../assets/images/input/visibility.opened.inline.svg';
import PasswordHiddenIcon from '../../assets/images/input/visibility.closed.inline.svg';
import SuccessSvg from '../../assets/images/widget/tick-green.inline.svg';
import DeleteMemoSvg from '../../assets/images/cross.inline.svg';
import styles from './FormFieldOwnSkin.scss';

// This type should be kept open (not "exact") because it is a react-polymorph skin
// and should be able to pass any extra properties from react-polymorph down.
type Props = {
  +className: string,
  +disabled: boolean,
  +error: string | Element<any>,
  +focusChild: MouseEvent=>void,
  +label: string | Element<any>,
  +onChange: Event=>void,
  +render: Object=>React$Element<any>,
  +setError: Function,
  +theme: Object,
  +themeId: string,
  +done?: boolean,
  +type: string,
  +focused: boolean,
  +onDelete: void => void,
  ...
};

type State = {| isPasswordShown: boolean, |};

export const FormFieldOwnSkin = class extends React.Component<Props, State> {
  static defaultProps: {|done: void|} = {
    done: undefined
  }

  state: State = {
    isPasswordShown: false
  }

  showPassword: (() => void) = () => this.setState(
    prevState => ({ isPasswordShown: !prevState.isPasswordShown })
  )

  render(): Node {
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
            {this.props.done === true && <SuccessSvg />}
            {(this.props.error != null && this.props.error !== '') && <ErrorSvg />}
            {(this.props.type === 'password') ? (
              <button tabIndex="-1" type="button" onClick={this.showPassword}>
                {isPasswordShown
                  ? <PasswordShownIcon />
                  : <PasswordHiddenIcon />}
              </button>
            ) : null}
            {this.props.type === 'memo' && !this.props.error ? (
              <button tabIndex="-1" type="button" onClick={this.props.onDelete} className="deleteContent">
                <DeleteMemoSvg />
              </button>
            ) : null}
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
