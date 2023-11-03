/* eslint-disable no-nested-ternary */
// @flow
import React from 'react';
import { map } from 'lodash';
import classnames from 'classnames';
import type { Node, Element, ComponentType } from 'react';
import { Modal, Typography } from '@mui/material';
import { Box, styled } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import { withLayout } from '../../styles/context/layout';
import { observer } from 'mobx-react';

export type ActionType = {|
  +label: string,
  +onClick: void => PossiblyAsync<void>,
  +primary?: boolean,
  +danger?: boolean,
  +isSubmitting?: boolean,
  +disabled?: boolean,
  +className?: ?string,
|};

export type Props = {|
  +title?: string | Node,
  +children?: Node,
  +actions?: Array<ActionType>,
  +closeButton?: Element<any>,
  +backButton?: Node,
  +className?: string,
  +styleOverride?: { ... },
  +onClose?: ?(void) => PossiblyAsync<void>,
  +closeOnOverlayClick?: boolean,
  +isRevampLayout?: boolean,
|};

type InjectedProps = {| isRevampLayout: boolean |};

function DialogFn(props: Props & InjectedProps): Node {
  const {
    title,
    children,
    actions,
    closeOnOverlayClick,
    onClose,
    className,
    closeButton,
    backButton,
    isRevampLayout,
  } = props;

  const hasSubmitting =
    actions != null && actions.filter(action => action.isSubmitting === true).length > 0;

  return (
    <Modal
      open
      onClose={
        closeOnOverlayClick === true
          ? onClose
          : (event, reason) => {
              if (reason !== 'backdropClick') {
                onClose?.(event);
              }
            }
      }
      sx={{
        background: 'var(--yoroi-comp-dialog-overlay-background-color)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ModalContainer
        display="flex"
        flexDirection="column"
        className={className}
        style={props.styleOverride}
        boxShadow="0px 13px 20px -1px #00000026"
      >
        {title != null && title !== '' ? (
          <Typography as="h1" variant="body1" className="dialog__title">
            {title}
          </Typography>
        ) : null}
        {children != null ? <ModalContent>{children}</ModalContent> : null}
        {actions && actions.length > 0 && (
          <ModalFooter>
            {map(actions, (action, i: number) => {
              const buttonClasses = classnames([
                // Keep classnames for testing
                action.className != null ? action.className : null,
                action.primary === true ? 'primary' : 'secondary',
              ]);
              return (
                <LoadingButton
                  id={action.primary === true ? 'primaryButton' : 'secondaryButton'}
                  key={i}
                  {...getBtnVariant(action.danger, action.primary, isRevampLayout)}
                  className={buttonClasses}
                  loading={action.isSubmitting}
                  onClick={action.onClick}
                  disabled={action.disabled === true || action.isSubmitting === true}
                >
                  {action.label}
                </LoadingButton>
              );
            })}
          </ModalFooter>
        )}
        {!hasSubmitting && closeButton ? React.cloneElement(closeButton, { onClose }) : null}
        {!hasSubmitting && backButton}
      </ModalContainer>
    </Modal>
  );
}

DialogFn.defaultProps = {
  title: undefined,
  children: undefined,
  actions: undefined,
  closeButton: undefined,
  backButton: undefined,
  className: undefined,
  styleOverride: undefined,
  onClose: undefined,
  closeOnOverlayClick: false,
};

const ModalContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  minWidth: 'var(--yoroi-comp-dialog-min-width-md)',
  borderRadius: theme.name === 'classic' ? 0 : 8,
  paddingTop: theme.name === 'classic' ? '25px' : '24px',
  paddingBottom: theme.name === 'classic' ? '30px' : '24px',
  maxWidth: theme.name === 'classic' ? '785px' : '560px',
  backgroundColor: 'var(--yoroi-comp-dialog-background)',
  color: 'var(--yoroi-comp-dialog-text)',
  maxHeight: '95vh',

  '& .dialog__title': {
    flex: 1,
    marginBottom: theme.name === 'classic' ? '22px' : '0px',
    padding: theme.name === 'classic' ? '0' : '0px 24px 24px',
    fontWeight: 500,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
}));
const ModalContent = styled(Box)(({ theme }) => ({
  overflowX: 'hidden',
  overflowY: 'overlay',
  maxHeight: '60vh',
  paddingLeft: theme.name === 'classic' ? '30px' : '24px',
  paddingRight: theme.name === 'classic' ? '30px' : '24px',
}));
const ModalFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  paddingLeft: theme.name === 'classic' ? '30px' : '24px',
  paddingRight: theme.name === 'classic' ? '30px' : '24px',
  marginTop: theme.name === 'classic' ? '20px' : '34px',
  '& button': {
    width: '50%',
    '&:only-child': {
      margin: 'auto',
      width: '100%',
    },
    '& + button': {
      marginLeft: '20px',
    },
  },
}));

function getBtnVariant(
  danger?: boolean,
  primary?: boolean,
  isRevampLayout?: boolean
): {|
  variant: 'contained' | 'outlined' | 'danger' | 'primary' | 'secondary',
  color?: 'primary' | 'secondary' | 'error',
|} {
  if (danger && isRevampLayout) return { variant: 'contained', color: 'error' };

  if (isRevampLayout && primary) {
    return { variant: 'primary' };
  }

  if (isRevampLayout && !primary) {
    return { variant: 'secondary' };
  }

  if (danger === true) return { variant: 'danger' };
  if (primary === true) return { variant: 'primary' };
  return { variant: 'secondary' };
}

export default (withLayout(observer(DialogFn)): ComponentType<Props>);
