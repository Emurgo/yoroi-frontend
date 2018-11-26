// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { kebabCase } from 'lodash';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import TopBarCategory from './TopBarCategory';
import styles from './TopBar.scss';
import type { Category } from '../../config/topbarConfig';

type Props = {
  children?: ?Node,
  title: ?Node,
  categories?: Array<Category>,
  activeTopbarCategory: string,
  onCategoryClicked?: Function,
};

@observer
export default class TopBar extends Component<Props> {
  static defaultProps = {
    children: undefined,
    categories: undefined,
    onCategoryClicked: undefined
  };

  render() {
    const {
      title,
      categories, activeTopbarCategory, onCategoryClicked,
    } = this.props;

    const topBarStyles = classNames([
      styles.topBar
    ]);

    return (
      <header className={topBarStyles}>
        <div className={styles.topBarTitle}>{title}</div>
        {this.props.children}
        {categories && categories.map(category => {
          const categoryClassName = kebabCase(category.name);
          return (
            <TopBarCategory
              key={category.name}
              className={categoryClassName}
              icon={category.icon}
              active={activeTopbarCategory === category.route}
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
