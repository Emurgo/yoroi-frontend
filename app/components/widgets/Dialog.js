import React, { Component } from 'react';
import _ from 'lodash';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import type { Node } from 'react';
import { Modal } from 'react-polymorph/lib/components/Modal';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { ModalSkin } from 'react-polymorph/lib/skins/simple/ModalSkin';
import styles from './Dialog.scss';

type Props = {
  title?: string,
  children?: Node,
  actions?: Node,
  closeButton?: Node,
  backButton?: Node,
  className?: string,
  onClose?: Function,
  closeOnOverlayClick?: boolean,
  modalOverlay?: Object,
  isClassicThemeActive: boolean
};

@observer
export default class Dialog extends Component<Props> {
  static defaultProps = {
    title: undefined,
    children: undefined,
    actions: undefined,
    closeButton: undefined,
    backButton: undefined,
    className: undefined,
    onClose: undefined,
    closeOnOverlayClick: undefined,
    modalOverlay: undefined,
  };

  setSkin = (props) => {
    const { modalOverlay } = this.props;
    // hack to override modal styles
    const newProps = _.set(
      { ...props },
      `theme.${props.themeId}.modal`,
      `${props.theme[props.themeId].modal} ${modalOverlay}`
    );
    return ModalSkin(modalOverlay ? newProps : props);
  }

  render() {
    const {
      title,
      children,
      actions,
      closeOnOverlayClick,
      onClose,
      className,
      closeButton,
      backButton,
      isClassicThemeActive
    } = this.props;
    const titleClasses = isClassicThemeActive ? styles.titleClassic : styles.title;
    const secondaryButton = isClassicThemeActive ? 'flat' : 'outlined';

    return (
      <Modal
        isOpen
        triggerCloseOnOverlayClick={closeOnOverlayClick}
        onClose={onClose}
        skin={this.setSkin}
      >

        <div className={classnames([styles.dialogWrapper, className])}>
          {title && (
            <div className={titleClasses}>
              <h1>{title}</h1>
            </div>)
          }

          {children && (
            <div className={styles.content}>
              {children}
            </div>)
          }

          {actions && (
            <div className={styles.actions}>
              {_.map(actions, (action, key) => {
                const buttonClasses = classnames([
                  action.className ? action.className : null,
                  action.primary ? 'primary' : secondaryButton,
                ]);
                return (
                  <Button
                    key={key}
                    className={buttonClasses}
                    label={action.label}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    skin={ButtonSkin}
                  />
                );
              })}
            </div>)
          }

          {closeButton ? React.cloneElement(closeButton, { onClose }) : null}
          {backButton}

        </div>
      </Modal>
    );
  }
}
