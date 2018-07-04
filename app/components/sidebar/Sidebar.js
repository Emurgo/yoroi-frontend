// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { kebabCase } from 'lodash';
import classNames from 'classnames';
import styles from './Sidebar.scss';
import SidebarCategory from './SidebarCategory';
// import BugReportDialog from '../../components/profile/bug-report/BugReportDialog';
import supportIcon from '../../assets/images/sidebar/bug-report-ic.inline.svg';

type Props = {
  categories: Array<{
    name: string,
    route: string,
    icon: string,
  }>,
  activeSidebarCategory: string,
  onCategoryClicked: Function,
  openDialogAction: Function,
  isDialogOpen: Function,
};

@observer
export default class Sidebar extends Component<Props> {

  static defaultProps = {
    isShowingSubMenus: false,
  };

  render() {
    const {
      categories, activeSidebarCategory,
      onCategoryClicked, openDialogAction, isDialogOpen,
    } = this.props;

    const sidebarStyles = classNames([
      styles.component,
      styles.minimized,
    ]);

    return (
      <div className={sidebarStyles}>
        <div className={styles.minimized}>
          {categories.map((category, index) => {
            const categoryClassName = kebabCase(category.name);
            return (
              <SidebarCategory
                key={index}
                className={categoryClassName}
                icon={category.icon}
                active={activeSidebarCategory === category.route}
                onClick={() => onCategoryClicked(category.route)}
              />
            );
          })}

          <SidebarCategory
            className="supportRequest"
            icon={supportIcon}
            active={false/* FIXME: isDialogOpen(BugReportDialog)*/}
            onClick={this.handleSupportRequestClick}
          />
        </div>
      </div>
    );
  }

  handleSupportRequestClick = () => {
    /* FIXME: This will be added once bug report is done
    this.props.openDialogAction({
      dialog: BugReportDialog
    }); */
  }
}
