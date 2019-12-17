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
import walletsIcon from '../../assets/images/sidebar/my_wallets.inline.svg';
import transferIcon from '../../assets/images/sidebar/transfer_wallets.inline.svg';
import settingsIcon from '../../assets/images/sidebar/settings.inline.svg';
import toggleIcon from '../../assets/images/sidebar/open_sidebar.inline.svg';


type Props = {|
  +children?: ?Node,
  +categories?: Array<Category>,
  +isActiveCategory?: Function,
  +onCategoryClicked?: Function,
|};

type State = {
  isExpanded: boolean,
};

@observer
export default class Sidebar extends Component<Props, State> {
  static defaultProps = {
    children: undefined,
    categories: undefined,
    isActiveCategory: undefined,
    onCategoryClicked: undefined,
  };

  state = {
    isExpanded: false
  };

  toggleDetails() {
    this.setState(prevState => ({ isExpanded: !prevState.isExpanded }));
  }

  render() {
    const {
      categories,
      isActiveCategory,
      onCategoryClicked,
    } = this.props;

    const { isExpanded } = this.state;

    const ToggleIcon = toggleIcon;
    const YoroiLogo = yoroiLogo;
    const YoroiLogoExpanded = yoroiLogoExpanded;

    // TODO: Replace with this.props.categories
    const dummyCategories = [
      {
        name: 'My wallets',
        icon: walletsIcon,
        route: '/wallets'
      },
      {
        name: 'Transfer wallets',
        icon: transferIcon,
        route: '/transfer'
      },
      {
        name: 'Settings',
        icon: settingsIcon,
        route: '/settings'
      },
    ];

    return (
      <div className={styles.wrapper}>
        {this.props.children}
        <div className={styles.header}>
          {isExpanded ? <YoroiLogoExpanded /> : <YoroiLogo />}
        </div>
        <div className={styles.categories}>
          {dummyCategories ? dummyCategories.map(category => {
            return (
              <SideBarCategory
                key={category.name}
                icon={category.icon}
                active={isActiveCategory !== undefined && isActiveCategory(category)}
                label={category.name}
                showLabel={isExpanded}
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
          onClick={this.toggleDetails.bind(this)}
          className={classnames([
            styles.toggleButton,
            isExpanded ? styles.toggleActive : null
          ])}
        >
          <span
            className={classnames(
              isExpanded ? styles.iconRotate : null
            )}
          >
            <ToggleIcon />
          </span>
        </button>
      </div>
    );
  }
}
