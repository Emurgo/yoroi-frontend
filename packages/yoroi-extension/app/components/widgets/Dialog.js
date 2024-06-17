/* eslint-disable no-nested-ternary */
// @flow
import type { Node, Element, ComponentType } from 'react';
import React, { forwardRef, useEffect, useState } from 'react';
import classnames from 'classnames';
import { map } from 'lodash';
import { IconButton, Modal, Typography, alpha } from '@mui/material';
import { Box, styled } from '@mui/system';
import { LoadingButton } from '@mui/lab';
import { withLayout } from '../../styles/context/layout';
import { observer } from 'mobx-react';
import { ReactComponent as CrossIcon } from '../../assets/images/revamp/icons/cross.inline.svg';

export type ActionType = {|
  +label: string,
  +onClick: void => PossiblyAsync<void>,
  +primary?: boolean,
  +danger?: boolean,
  +isSubmitting?: boolean,
  +disabled?: boolean,
  +className?: ?string,
  +id?: ?string,
  +size?: ?string,
|};

export type StyleFlag = {|
  +contentNoTopPadding?: boolean,
|};

export type Props = {|
  +title?: string | Node,
  +children?: Node,
  +actions?: Array<ActionType>,
  +closeButton?: Element<any>,
  +withCloseButton?: boolean,
  +backButton?: Node,
  +className?: string,
  +scrollableContentClass?: string,
  +styleOverride?: { ... },
  +styleContentOverride?: { ... },
  +onClose?: ?(void) => PossiblyAsync<void>,
  +closeOnOverlayClick?: boolean,
  +isRevampLayout?: boolean,
  id?: string,
  +styleFlags?: StyleFlag,
  +forceBottomDivider?: boolean,
  +contentHeader?: Node,
|};

type InjectedProps = {| isRevampLayout: boolean |};

function Dialog(props: Props & InjectedProps): Node {
  const {
    title,
    children,
    actions,
    closeOnOverlayClick,
    onClose,
    className,
    closeButton,
    withCloseButton,
    backButton,
    scrollableContentClass,
    isRevampLayout,
    id,
    styleFlags,
    forceBottomDivider,
    contentHeader,
  } = props;

  const [contentHasScroll, setContentHasScroll] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const el = document.querySelector(
        scrollableContentClass ? `.${scrollableContentClass}` : '.ModalContent'
      );

      if (!el) return;

      if (el.clientHeight < el.scrollHeight) {
        setContentHasScroll(true);
        // el.style.marginRight = '-24px';
      } else {
        setContentHasScroll(false);
        // el.style.marginRight = '0';
      }
    }, 30);

    return () => {
      clearTimeout(timeout);
    };
  }, [children]);

  const hasActions = actions && actions.length > 0;

  const hasCloseButton = withCloseButton || closeButton;

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
        bgcolor: isRevampLayout
          ? alpha('#121F4D', 0.7) // primary.900 70%
          : 'var(--yoroi-comp-dialog-overlay-background-color)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      // $FlowIgnore
      id={id + '-dialogWindow-modalWindow'}
    >
      <ModalContainer
        display="flex"
        flexDirection="column"
        className={className}
        style={props.styleOverride}
        boxShadow="0px 13px 20px -1px #00000026"
        contentHasScroll={contentHasScroll}
      >
        {title != null && title !== '' ? (
          // $FlowIgnore
          <Typography
            as="h1"
            variant="body1"
            className="dialog__title"
            id={String(id) + '-dialogTitle-text'}
          >
            {title}
          </Typography>
        ) : null}
        {children != null ? (
          <ModalContent
            pt={styleFlags?.contentNoTopPadding ? '0px !important' : undefined}
            pb={contentHasScroll || !hasActions ? '24px' : '0px !important'}
            className="ModalContent"
            style={props.styleContentOverride}
          >
            {contentHeader && <Box>{contentHeader}</Box>}
            <Box
              sx={{
                maxHeight: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
                flexGrow: 1,
                // <TODO:STYLES> Check if needed
                // maxWidth: 'calc(100% + 20px)',
                // marginRight: '-20px',
              }}
            >
              {children}
            </Box>
          </ModalContent>
        ) : null}
        {hasActions && (
          <ModalFooter hasDivider={forceBottomDivider || contentHasScroll}>
            {map(actions, (action, i: number) => {
              const buttonClasses = classnames([
                // Keep classnames for testing
                action.className != null ? action.className : null,
                action.primary === true ? 'primary' : 'secondary',
              ]);
              const buttonLabel = action.label.toLowerCase().replace(/ /gi, '');
              return (
                <LoadingButton
                  // $FlowIgnore
                  id={action.id ?? id + '-' + buttonLabel + '-button'}
                  key={i}
                  {...getBtnVariant(action.danger, action.primary, isRevampLayout)}
                  className={buttonClasses}
                  loading={action.isSubmitting}
                  onClick={action.onClick}
                  disabled={action.disabled === true || action.isSubmitting === true}
                  size={action.size}
                >
                  {action.label}
                </LoadingButton>
              );
            })}
          </ModalFooter>
        )}
        {!hasSubmitting && hasCloseButton ? (
          <CloseButton
            onClose={onClose}
            closeButton={closeButton ? React.cloneElement(closeButton, { onClose }) : null}
            idLocatorPath={id}
          />
        ) : null}
        {!hasSubmitting && backButton}
      </ModalContainer>
    </Modal>
  );
}

Dialog.defaultProps = {
  title: undefined,
  children: undefined,
  actions: undefined,
  closeButton: undefined,
  backButton: undefined,
  className: undefined,
  scrollableContentClass: undefined,
  contentHeader: null,
  styleOverride: undefined,
  onClose: undefined,
  closeOnOverlayClick: false,
  id: 'dialog',
};

export const CloseButton = ({
  onClose,
  closeButton,
  sx,
  idLocatorPath = 'modalWindow',
}: {|
  onClose: ?(void) => PossiblyAsync<void>,
  closeButton: React$Node,
  sx?: any,
  idLocatorPath?: string,
|}): React$Node => (
  <Box
    sx={{
      position: 'absolute',
      display: 'inline-flex',
      right: '16px',
      top: '16px',
      cursor: 'pointer',
      ...(sx ?? {}),
    }}
    onClick={onClose}
    id={idLocatorPath + '-closeModal-button'}
  >
    {closeButton || (
      <IconButton>
        <CrossIcon />
      </IconButton>
    )}
  </Box>
);

// eslint-disable-next-line no-unused-vars
const StyledBox = forwardRef(({ contentHasScroll, empty, hasDivider, ...props }, ref) => <Box {...props} ref={ref} />);

export const ModalContainer: any => Node = styled(StyledBox)(
  ({ theme, contentHasScroll, empty = false }) => {
    const normalMinWidth =
      theme.name === 'classic' || theme.name === 'modern'
        ? 'var(--yoroi-comp-dialog-min-width-md)'
        : '648px';
    const revampBorder = contentHasScroll ? '1px solid' : '';
    return {
      position: 'relative',
      minWidth: empty ? '0px' : normalMinWidth,
      borderRadius: theme.name === 'classic' ? 0 : 8,
      paddingTop: theme.name === 'classic' ? '25px' : '0px',
      paddingBottom: theme.name === 'classic' || theme.name === 'modern' ? '30px' : '0px',
      maxWidth: theme.name === 'classic' ? '785px' : '824px',
      backgroundColor: empty ? undefined : 'var(--yoroi-comp-dialog-background)',
      color: 'var(--yoroi-comp-dialog-text)',
      maxHeight: '95vh',

      '& .dialog__title': {
        marginBottom: theme.name === 'classic' ? '22px' : '0px',
        padding: theme.name === 'classic' ? '0' : '24px',
        fontWeight: 500,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0,
        display: 'block',
        borderBottom:
          theme.name === 'classic' || theme.name === 'modern' ? '' : revampBorder,
        borderBottomColor:
          theme.name === 'classic' || theme.name === 'modern'
            ? theme.palette.gray['200']
            : theme.palette.grayscale['200'],
      },
    };
  }
);

const ModalContent = styled(Box)(({ theme }) => ({
  overflowX: 'hidden',
  overflowY: 'overlay',
  maxHeight: '70vh',
  paddingLeft: theme.name === 'classic' ? '30px' : '24px',
  paddingRight: theme.name === 'classic' ? '30px' : '24px',
  paddingTop: theme.name === 'classic' ? '0px' : '24px',
  paddingBottom: theme.name === 'classic' || theme.name === 'modern' ? '0px' : '24px',
  flexGrow: 1,
  display: 'flex',
  flexFlow: 'column',
}));

const ModalFooter = styled(StyledBox)(({ theme, hasDivider }) => ({
  display: 'flex',
  gap: '24px',
  paddingLeft: theme.name === 'classic' ? '30px' : '24px',
  paddingRight: theme.name === 'classic' ? '30px' : '24px',
  paddingTop: theme.name === 'classic' || theme.name === 'modern' ? '0' : '24px',
  paddingBottom: theme.name === 'classic' || theme.name === 'modern' ? '0' : '24px',
  marginTop: theme.name === 'classic' ? '20px' : '0px',
  borderTop:
    theme.name === 'classic' || theme.name === 'modern' ? '' : hasDivider ? '1px solid' : '',
  borderTopColor:
    theme.name === 'classic' || theme.name === 'modern'
      ? theme.palette.gray['200']
      : theme.palette.grayscale['200'],
  '& button': {
    width: '50%',
    '&:only-child': { width: '100%' },
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

export default (withLayout(observer(Dialog)): ComponentType<Props>);
