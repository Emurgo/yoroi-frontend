import React, { Component } from 'react';
import _ from 'lodash';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import type { Node } from 'react';
import { THEMES } from '../../themes';
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
  classicTheme: boolean
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
      classicTheme
    } = this.props;
    const secondaryButton = classicTheme ? 'flat' : 'outlined';

    /* Dialog is spacial case as it's not a child of React #root.
     * For Theme change management, setting current theme is nessesary like below
     * classicTheme ? THEMES.YOROI_CLASSIC : THEMES.YOROI_MODERN
     * This should be updated on addition/deletion of theme */
    const componentStyle = classnames([
      classicTheme ? THEMES.YOROI_CLASSIC : THEMES.YOROI_MODERN,
      styles.component,
      className,
    ]);

    return (
      <Modal
        isOpen
        triggerCloseOnOverlayClick={closeOnOverlayClick}
        onClose={onClose}
        skin={this.setSkin}
      >

        <div className={componentStyle}>
          {title && (
            <div className={styles.title}>
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
