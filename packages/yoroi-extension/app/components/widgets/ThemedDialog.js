// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import type { Props } from './Dialog';
import { withLayout } from '../../styles/context/layout';
import type { InjectedLayoutProps } from '../../styles/context/layout';
import DialogClassic from './Dialog';
import DialogRevamp from './DialogRevamp';

class ThemedDialog extends Component<Props & InjectedLayoutProps> {
  render(): Node {
    const {
      isRevampLayout,
      children,
      title,
      actions,
      closeOnOverlayClick,
      onClose,
      className,
      closeButton,
      backButton,
    } = this.props;
    const Dialog = DialogClassic;

    const dialogProps = {
      title,
      actions,
      closeOnOverlayClick,
      closeButton,
      onClose,
      className,
      backButton,
    };
    return <Dialog {...dialogProps}>{children}</Dialog>;
  }
}

export default (withLayout(ThemedDialog): ComponentType<Props>);
