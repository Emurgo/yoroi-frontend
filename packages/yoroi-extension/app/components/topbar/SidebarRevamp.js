// @flow
import { Component } from 'react';
import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { SidebarCategoryRevamp } from '../../stores/stateless/sidebarCategories';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import { Box, Link, styled } from '@mui/material';
import { ReactComponent as YoroiLogo } from '../../assets/images/sidebar/revamp/yoroi-logo.inline.svg';
import SideBarCategoryRevamp from './SideBarCategoryRevamp';
import styles from './SidebarRevamp.scss';
import globalMessages from '../../i18n/global-messages';

type Props = {|
  +children?: ?Node,
  +categories?: Array<SidebarCategoryRevamp>,
  +isActiveCategory?: SidebarCategoryRevamp => boolean,
  +onCategoryClicked?: SidebarCategoryRevamp => void,
  +onLogoClick?: void => void,
|};

@observer
export default class SidebarRevamp extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  static defaultProps: {|
    categories: void,
    children: void,
    isActiveCategory: void,
    onCategoryClicked: void,
    onLogoClick: void,
  |} = {
    children: undefined,
    categories: undefined,
    isActiveCategory: undefined,
    onCategoryClicked: undefined,
    onLogoClick: undefined,
  };

  render(): Node {
    const { intl } = this.context;
    const { categories, isActiveCategory, onCategoryClicked, onLogoClick } = this.props;

    return (
      <Wrapper className={styles.wrapper}>
        {this.props.children}
        <div className={styles.header}>
          {onLogoClick ? (
            <button type="button" onClick={onLogoClick}>
              <YoroiLogo />
            </button>
          ) : (
            <YoroiLogo />
          )}
        </div>
        <div className={styles.categories}>
          {categories
            ? categories.map(category => {
                return (
                  <SideBarCategoryRevamp
                    key={category.className}
                    icon={category.icon}
                    route={category.route}
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
        <Link
          className={styles.faq}
          href="https://emurgohelpdesk.zendesk.com/hc/en-us/categories/4412619927695-Yoroi"
          target="_blank"
          rel="noreferrer"
          sx={{
            color: 'grayscale.50',
            bgcolor: 'primary.700',
            '&:hover': { bgcolor: 'primary.800' },
          }}
        >
          {intl.formatMessage(globalMessages.sidebarFaq)}
        </Link>
      </Wrapper>
    );
  }
}

const Wrapper = styled(Box)(({ theme }) => ({
  background: theme.palette.ds.bg_gradient_3,
}));
