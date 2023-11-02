// @flow
import React from 'react';
import { map } from 'lodash';
import classnames from 'classnames';
import type { Node, ComponentType } from 'react';
import { Modal, Typography } from '@mui/material';
import { Box, styled } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import { withLayout } from '../../styles/context/layout';
import { observer } from 'mobx-react';
import type { Props } from './Dialog';

function DialogFn(props: Props): Node {
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
      disableAutoFocus
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
  borderRadius: '8px',
  paddingTop: '25px',
  paddingBottom: '24px',
  maxWidth: 'unset',
  minWidth: 'unset',
  backgroundColor: theme.palette.common.white,
  color: theme.palette.grayscale[900],
  maxHeight: '80vh',
  '& .dialog__title': {
    flex: 1,
    marginBottom: '25px',
    fontWeight: 500,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0,
    lineHeight: '22px',
  },
}));

const ModalContent = styled(Box)(() => ({
  overflowX: 'hidden',
  overflowY: 'overlay',
  maxHeight: '60vh',
  paddingLeft: '24px',
  paddingRight: '24px',
}));

const ModalFooter = styled(Box)({
  display: 'flex',
  paddingLeft: '24px',
  paddingRight: '24px',
  marginTop: '24px',
  '& button': {
    width: ' 50%',
    '&:only-child': {
      margin: 'auto',
      width: '100%',
    },
    '& + button': {
      marginLeft: '24px',
    },
  },
});

function getBtnVariant(
  danger?: boolean,
  primary?: boolean,
  isRevampLayout?: boolean
): {|
  variant: 'contained' | 'outlined' | 'danger' | 'primary' | 'secondary',
  color?: 'primary' | 'secondary' | 'error',
|} {
  if (danger && isRevampLayout) return { variant: 'destructive' };

  if (isRevampLayout && primary) {
    return { variant: 'primary' };
  }

  if (isRevampLayout && !primary) {
    return { variant: 'secondary' };
  }

  if (danger === true) return { variant: 'primary' };
  if (primary === true) return { variant: 'primary' };
  return { variant: 'secondary' };
}

export default (withLayout(observer(DialogFn)): ComponentType<Props>);
