// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import SideBarCategory from './SideBarCategory';
import styles from './Sidebar.scss';
import type { SidebarCategory } from '../../stores/stateless/sidebarCategories';
import classnames from 'classnames';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import { ReactComponent as yoroiLogo } from '../../assets/images/sidebar/yoroi-logo.inline.svg';
import { ReactComponent as yoroiLogoExpanded } from '../../assets/images/sidebar/yoroi-logo-expanded.inline.svg';
import { ReactComponent as toggleIcon } from '../../assets/images/sidebar/open-sidebar.inline.svg';
import globalMessages from '../../i18n/global-messages';

type Props = {|
  +children?: ?Node,
  +categories?: Array<SidebarCategory>,
  +isActiveCategory?: SidebarCategory => boolean,
  +onCategoryClicked?: SidebarCategory => void,
  +onToggleSidebar: void => Promise<void>,
  +isSidebarExpanded: boolean,
|};

@observer
export default class Sidebar extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

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
    const { intl } = this.context;
    const {
      categories,
      isActiveCategory,
      onCategoryClicked,
      isSidebarExpanded,
      onToggleSidebar,
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
          {categories
            ? categories.map(category => {
                return (
                  <SideBarCategory
                    key={category.className}
                    icon={category.icon}
                    active={isActiveCategory !== undefined && isActiveCategory(category)}
                    label={category.label}
                    showLabel={isSidebarExpanded}
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

        <div className={classnames(isSidebarExpanded ? styles.footer : null)}>
          <a
            className={styles.faq}
            href="https://emurgohelpdesk.zendesk.com/hc/en-us/categories/4412619927695-Yoroi"
            target="_blank"
            rel="noreferrer"
          >
            {intl.formatMessage(globalMessages.sidebarFaq)}
          </a>
          <button
            type="button"
            onClick={onToggleSidebar}
            className={classnames([
              styles.toggleButton,
              isSidebarExpanded ? styles.toggleActive : null,
            ])}
          >
            <span className={classnames(isSidebarExpanded ? styles.iconRotate : null)}>
              <ToggleIcon />
            </span>
          </button>
        </div>
      </div>
    );
  }
}
