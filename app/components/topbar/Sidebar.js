// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import SideBarCategory from './SideBarCategory';
import styles from './Sidebar.scss';
import type { Category } from '../../config/topbarConfig';
import classnames from 'classnames';

import yoroiLogo from '../../assets/images/sidebar/yoroi_logo.inline.svg';
import yoroiLogoExpanded from '../../assets/images/sidebar/yoroi_logo_expanded.inline.svg';
import toggleIcon from '../../assets/images/sidebar/open_sidebar.inline.svg';

type Props = {|
  +children?: ?Node,
  +categories?: Array<Category>,
  +isActiveCategory?: Category => boolean,
  +onCategoryClicked?: string => void,
  +onToggleSidebar: void => Promise<void>,
  +isSidebarExpanded: boolean
|};

@observer
export default class Sidebar extends Component<Props> {
  static defaultProps: {|
    categories: void,
    children: void,
    isActiveCategory: void,
    onCategoryClicked: void,
  |} = {
    children: undefined,
    categories: undefined,
    isActiveCategory: undefined,
    onCategoryClicked: undefined,
  };

  render(): Node {
    const {
      categories,
      isActiveCategory,
      onCategoryClicked,
      isSidebarExpanded,
      onToggleSidebar
    } = this.props;

    const ToggleIcon = toggleIcon;
    const YoroiLogo = yoroiLogo;
    const YoroiLogoExpanded = yoroiLogoExpanded;

    return (
      <div className={styles.wrapper}>
        {this.props.children}
        <div className={styles.header}>
          {isSidebarExpanded ? <YoroiLogoExpanded /> : <YoroiLogo />}
        </div>
        <div className={styles.categories}>
          {categories ? categories.map(category => {
            return (
              <SideBarCategory
                key={category.name}
                icon={category.icon}
                active={isActiveCategory !== undefined && isActiveCategory(category)}
                label={category.label}
                showLabel={isSidebarExpanded}
                onClick={() => {
                  if (onCategoryClicked) {
                    onCategoryClicked(category.route);
                  }
                }}
              />
            );
          }) : null}
        </div>
        <button
          type="button"
          onClick={onToggleSidebar}
          className={classnames([
            styles.toggleButton,
            isSidebarExpanded ? styles.toggleActive : null
          ])}
        >
          <span
            className={classnames(
              isSidebarExpanded ? styles.iconRotate : null
            )}
          >
            <ToggleIcon />
          </span>
        </button>
      </div>
    );
  }
}
