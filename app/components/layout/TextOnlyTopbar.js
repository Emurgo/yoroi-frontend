// @flow
import React, { Component } from 'react';
import classNames from 'classnames';
import { kebabCase } from 'lodash';
import TopBarCategory from './TopBarCategory';
import styles from './TextOnlyTopbar.scss';
import type { Category } from '../../config/sidebarConfig';

type Props = {
  title: string,
  categories?: Array<Category>,
  activeSidebarCategory: string,
  onCategoryClicked?: Function,
};

export default class TextOnlyTopBar extends Component<Props> {
  static defaultProps = {
    categories: undefined,
    onCategoryClicked: undefined
  };

  render() {
    const { title, categories, activeSidebarCategory, onCategoryClicked } = this.props;
    const topBarStyles = classNames([
      styles.topBar
    ]);

    return (
      <header className={topBarStyles}>
        <div className={styles.topBarTitle}>
          <div className={styles.topbarTitleContainer}>
            <div className={styles.topbarTitleText}>{title}</div>
          </div>
        </div>
        {categories && categories.map(category => {
          const categoryClassName = kebabCase(category.name);
          return (
            <TopBarCategory
              key={category.name}
              className={categoryClassName}
              icon={category.icon}
              active={activeSidebarCategory === category.route}
              onClick={() => {
                if (onCategoryClicked) {
                  onCategoryClicked(category.route);
                }
              }}
            />
          );
        })}
      </header>
    );
  }
}
