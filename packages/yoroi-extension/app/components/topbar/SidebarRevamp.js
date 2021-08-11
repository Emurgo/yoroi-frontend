// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import SideBarCategoryRevamp from './SideBarCategoryRevamp';
import styles from './SidebarRevamp.scss';
import type { SidebarCategory } from '../../stores/stateless/sidebarCategories';

import yoroiLogo from '../../assets/images/sidebar/yoroi_logo.inline.svg';

type Props = {|
  +children?: ?Node,
  +categories?: Array<SidebarCategory>,
  +isActiveCategory?: SidebarCategory => boolean,
  +onCategoryClicked?: SidebarCategory => void,
|};

@observer
export default class SidebarRevamp extends Component<Props> {
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
    const { categories, isActiveCategory, onCategoryClicked } = this.props;

    const YoroiLogo = yoroiLogo;

    return (
      <div className={styles.wrapper}>
        {this.props.children}
        <div className={styles.header}>
          <YoroiLogo />
        </div>
        <div className={styles.categories}>
          {categories
            ? categories.map(category => {
                return (
                  <SideBarCategoryRevamp
                    key={category.className}
                    icon={category.icon}
                    active={isActiveCategory !== undefined && isActiveCategory(category)}
                    label={category.label}
                    onClick={() => {
                      if (onCategoryClicked) {
                        onCategoryClicked(category);
                      }
                    }}
                  />
                );
              })
            : null}
        </div>
      </div>
    );
  }
}
