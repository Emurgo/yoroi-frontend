// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { kebabCase } from 'lodash';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import SvgInline from 'react-svg-inline';
import TopBarCategory from './TopBarCategory';
import styles from './TopBar.scss';
import type { Category } from '../../config/topbarConfig';

import lockIcon from '../../assets/images/lock.inline.svg';

type Props = {
  children?: ?Node,
  title: ?Node,
  categories?: Array<Category>,
  activeTopbarCategory: string,
  onCategoryClicked?: Function,
  lockIconIsVisible: boolean,
  lockApp: Function,
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
      lockIconIsVisible,
      lockApp,
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
          const additionalClass = lockIconIsVisible && categoryClassName !== 'wallets' ? ' replaced' : '';
          return (
            <TopBarCategory
              key={category.name}
              className={categoryClassName + additionalClass}
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
        {lockIconIsVisible && (
          <button type="button" className="TopBarCategory_component lock" onClick={lockApp}>
            <SvgInline svg={lockIcon} cleanup={['title']} />
          </button>
        )}
      </header>
    );
  }
}
