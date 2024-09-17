// @flow
import { Box } from '@mui/material';
import { observer } from 'mobx-react';
import type { Node, ComponentType } from 'react';
import type { LayoutComponentMap } from '../../styles/context/layout';
import { Component } from 'react';
import { withLayout } from '../../styles/context/layout';
import styles from './NavBarTitle.scss';

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
    const navbarTitleRevamp = (
      <Box id="navBarTitle" className={styles.titleRevamp} sx={{ color: 'ds.el_gray_medium' }}>
        {title}
      </Box>
    );

    return renderLayoutComponent({
      CLASSIC: navbarTitleClassic,
      REVAMP: navbarTitleRevamp,
    });
  }
}
export default (withLayout(NavBarTitle): ComponentType<Props>);
