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
  skinOverride?: Object,
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
    skinOverride: undefined,
  };


  /** Hack to override modal skin
    * This enables to override skin which is places above main content in DOM */
  setSkin = (props) => {
    const { skinOverride } = this.props;

    // Default overrides
    if (styles.skinOverride && props.theme.modal.modal.indexOf(styles.skinOverride) === -1) {
      props.theme.modal.modal = `${props.theme.modal.modal} ${styles.skinOverride}`;
    }
    // Dialog extended component override
    if (skinOverride && props.theme.modal.modal.indexOf(skinOverride) === -1) {
      props.theme.modal.modal = `${props.theme.modal.modal} ${skinOverride}`;
    }

    return ModalSkin(props);
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

    return (
      <Modal
        isOpen
        triggerCloseOnOverlayClick={closeOnOverlayClick}
        onClose={onClose}
        skin={this.setSkin}
      >

        <div className={classnames([styles.component, className])}>
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
