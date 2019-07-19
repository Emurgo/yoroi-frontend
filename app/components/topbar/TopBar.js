// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import TopBarCategory from './TopBarCategory';
import styles from './TopBar.scss';
import type { Category } from '../../config/topbarConfig';

type Props = {|
  children?: ?Node,
  title: ?Node,
  categories?: Array<Category>,
  isActiveCategory?: Function,
  onCategoryClicked?: Function,
|};

@observer
export default class TopBar extends Component<Props> {
  static defaultProps = {
    children: undefined,
    categories: undefined,
    isActiveCategory: undefined,
    onCategoryClicked: undefined,
  };

  render() {
    const {
      title,
      categories,
      isActiveCategory,
      onCategoryClicked,
    } = this.props;

    return (
      <header className={styles.topBar}>
        <div className={styles.topBarTitle}>{title}</div>
        {this.props.children}
        {categories ? categories.map(category => {
          return (
            <TopBarCategory
              key={category.name}
              className={category.className}
              icon={category.icon}
              iconStyle={category.iconStyle}
              inlineTextMD={category.inlineText}
              active={isActiveCategory !== undefined && isActiveCategory(category)}
              onClick={() => {
                if (onCategoryClicked) {
                  onCategoryClicked(category.route);
                }
              }}
            />
          );
        }) : null}
      </header>
    );
  }
}
