// @flow
import React, { Component } from 'react';
import { map } from 'lodash';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import type { Node, Element } from 'react';
import { Modal } from 'react-polymorph/lib/components/Modal';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { ModalSkin } from 'react-polymorph/lib/skins/simple/ModalSkin';
import styles from './Dialog.scss';

type ActionType = {|
  +label: string,
  +onClick: void => PossiblyAsync<void>,
  +primary?: boolean,
  +isSubmitting?: boolean,
  +disabled?: boolean,
  +className?: ?string,
  +themeOverrides?: {...},
|};

type Props = {|
  +title?: string | Node,
  +children?: Node,
  +actions?: Array<ActionType>,
  +closeButton?: Element<any>,
  +backButton?: Node,
  +className?: string,
  +styleOveride?: {...},
  +onClose?: ?(void => PossiblyAsync<void>),
  +closeOnOverlayClick?: boolean,
|};

@observer
export default class Dialog extends Component<Props> {
  static defaultProps: {|
    actions: void,
    backButton: void,
    children: void,
    className: void,
    closeButton: void,
    closeOnOverlayClick: void,
    onClose: void,
    styleOveride: void,
    title: void,
  |} = {
    title: undefined,
    children: undefined,
    actions: undefined,
    closeButton: undefined,
    backButton: undefined,
    className: undefined,
    styleOveride: undefined,
    onClose: undefined,
    closeOnOverlayClick: undefined,
  };

  render(): Node {
    const {
      title,
      children,
      actions,
      closeOnOverlayClick,
      onClose,
      className,
      closeButton,
      backButton,
    } = this.props;

    const hasSubmitting = actions != null && actions.filter(
      action => action.isSubmitting === true
    ).length > 0;

    return (
      <Modal
        isOpen
        triggerCloseOnOverlayClick={closeOnOverlayClick}
        onClose={onClose}
        skin={ModalSkin}
      >

        <div
          className={classnames([styles.component, className])}
          style={this.props.styleOveride}
        >
          {(title != null && title !== '')
            ? (
              <div className={styles.title}>
                <h1>{title}</h1>
              </div>)
            : null
          }

          {children != null
            ? (
              <div className={styles.content}>
                {children}
              </div>)
            : null
          }

          {actions && actions.length > 0 && (
            <div className={styles.actions}>
              {map(actions, (action, i: number) => {
                const buttonClasses = classnames([
                  action.className != null ? action.className : null,
                  action.primary === true ? 'primary' : 'secondary',
                  action.isSubmitting === true && action.primary === true
                    ? styles.isSubmittingPrimary
                    : null,
                  action.isSubmitting === true && action.primary !== true
                    ? styles.isSubmittingSecondary
                    : null,
                ]);
                return (
                  <Button
                    themeOverrides={action.themeOverrides}
                    key={i}
                    className={buttonClasses}
                    label={action.label}
                    onClick={action.onClick}
                    disabled={action.disabled === true || action.isSubmitting === true}
                    skin={ButtonSkin}
                  />
                );
              })}
            </div>)
          }

          {!hasSubmitting && closeButton ? React.cloneElement(closeButton, { onClose }) : null}
          {!hasSubmitting && backButton}

        </div>
      </Modal>
    );
  }
}
