// @flow
import { Component } from 'react';
import type { Node } from 'react';
import type { SidebarCategoryRevamp } from '../../stores/stateless/sidebarCategories';
import { observer } from 'mobx-react';
import { IntlContext } from 'react-intl';
import { Box, Button, styled } from '@mui/material';
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
  static contextType:any = IntlContext;
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
    const intl = this.context;
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
        <ScrollableCategoriesWrapper className={styles.categories}>
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
        </ScrollableCategoriesWrapper>
        <Button
          className={styles.faq}
          href="https://emurgohelpdesk.zendesk.com/hc/en-us/categories/4412619927695-Yoroi"
          target="_blank"
          rel="noreferrer"
          sx={{
            color: 'ds.bg_color_contrast_high',
            bgcolor: 'ds.el_primary_max',
            '&:hover': {
              bgcolor: 'ds.primary_800',
              color: 'ds.bg_color_contrast_min',
              textDecoration: 'none',
            },
          }}
        >
          {intl.formatMessage(globalMessages.sidebarFaq)}
        </Button>
      </Wrapper>
    );
  }
}

const Wrapper = styled(Box)(({ theme }) => ({
  background: theme.palette.ds.bg_gradient_3,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '72px',
  height: '100vh',
}));

const ScrollableCategoriesWrapper = styled(Box)({
  flex: 1,
  width: '100%',
  overflowY: 'auto',
  overflowX: 'hidden',
  marginBottom: '24px',

  /* Hide scrollbar for WebKit (Chrome, Safari) */
  '&::-webkit-scrollbar': {
    display: 'none',
  },

  /* Hide scrollbar for Firefox */
  scrollbarWidth: 'none',

  /* Hide scrollbar for Edge/IE */
  msOverflowStyle: 'none',
});
