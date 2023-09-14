// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import styles from './NavBarTitle.scss';
import { withLayout } from '../../styles/context/layout';
import type { LayoutComponentMap } from '../../styles/context/layout';

type Props = {|
  +title: string,
|};

type InjectedProps = {|
  +renderLayoutComponent: LayoutComponentMap => Node,
|};
@observer
class NavBarTitle extends Component<Props & InjectedProps> {
  render(): Node {
    const { renderLayoutComponent, title } = this.props;

    const navbarTitleClassic = <div className={styles.title}>{title}</div>;
    const navbarTitleRevamp = <div className={styles.titleRevamp} id="navBarTitle">{title}</div>;

    return renderLayoutComponent({
      CLASSIC: navbarTitleClassic,
      REVAMP: navbarTitleRevamp,
    });
  }
}
export default (withLayout(NavBarTitle): ComponentType<Props>);
