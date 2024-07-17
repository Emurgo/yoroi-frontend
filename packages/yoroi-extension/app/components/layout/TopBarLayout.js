// @flow
import { Box } from '@mui/system';
import { observer } from 'mobx-react';
import type { Node, ComponentType } from 'react';
import { withLayout } from '../../styles/context/layout';
import { THEMES } from '../../styles/themes';
import styles from './TopBarLayout.scss';

type Props = {|
  +banner?: Node,
  +topbar?: Node,
  +navbar?: Node,
  +sidebar?: Node,
  +children?: ?Node,
  +notification?: ?Node,
  +languageSelectionBackground?: boolean,
  +showInContainer?: boolean,
  +showAsCard?: boolean,
  +asModern?: boolean,
  +withPadding?: boolean, // default: true
  +bgcolor?: string,
|};

type InjectedProps = {| isRevampLayout: boolean, currentTheme: string |};

type AllProps = {| ...Props, ...InjectedProps |};
/** Adds a top bar above the wrapped node */
function TopBarLayout({
  banner,
  topbar,
  navbar,
  sidebar,
  children,
  notification,
  languageSelectionBackground,
  showInContainer,
  showAsCard,
  currentTheme,
  isRevampLayout,
  asModern,
  withPadding,
  bgcolor,
}: AllProps) {
  const isModern = currentTheme === THEMES.YOROI_MODERN;
  const isRevamp = isRevampLayout && asModern !== true && !isModern;

  const getContentUnderBanner: void => Node = () => {
    const topbarComponent = <Box sx={{ zIndex: 2 }}>{topbar}</Box>;
    const navbarComponent = <Box sx={{ zIndex: 2 }}>{navbar}</Box>;
    const content = (
      <>
        {topbar != null ? topbarComponent : null}
        {navbar != null ? navbarComponent : null}
        {notification}
        <Box
          id="inner-content-wrapper"
          sx={{
            position: 'relative',
            height: '100%',
            '&::-webkit-scrollbar-button': {
              height: '7px',
              display: 'block',
            },
            boxShadow: !isRevamp && showAsCard === true && '0 2px 12px 0 rgba(0, 0, 0, 0.06)',
            borderRadius: !isRevamp && showAsCard === true && '8px',
            ...(showInContainer === true && {
              bgcolor: 'ds.bg_color_low',
              width: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              flex: '0 1 auto',
              height: '100%',
            }),
            overflow: isRevamp ? 'auto' : 'unset',
          }}
        >
          {isRevamp ? (
            <Box
              sx={{
                bgcolor: bgcolor || 'ds.bg_color_low',
                height: '100%',
                width: '100%',
                maxWidth: '1872px',
                mx: 'auto',
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  width: '100%',
                  margin: 'auto',
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    minHeight: '200px',
                    padding:
                      typeof withPadding === 'undefined' || withPadding === true ? '24px' : '0px',
                    pb: 0,
                    bgcolor: 'ds.bg_color_low',
                  }}
                >
                  {children}
                </Box>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                height: '100%',
                minHeight: '200px',
              }}
            >
              {children}
            </Box>
          )}
        </Box>
      </>
    );

    if (showInContainer === true) {
      const boxProperties = {
        height: '100%',
        minHeight: '200px',
        backgroundColor: isRevamp ? 'ds.bg_color_low' : 'var(--yoroi-palette-gray-50)',
        maxWidth: '1295px',
        paddingLeft: '40px',
        paddingRight: '40px',
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 110px)',
        overflow: isRevamp ? 'unset' : 'hidden',
        pb: isRevamp ? '0px' : '100px',
      };

      return isRevamp ? (
        <Box
          sx={{
            maxWidth: '100%',
            width: '100%',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 25px)',
          }}
        >
          {content}
        </Box>
      ) : (
        <Box sx={boxProperties}>{content}</Box>
      );
    }
    return content;
  };

  const sidebarComponent = <Box sx={{ flex: '1 0 auto' }}>{sidebar}</Box>;

  return (
    <Box
      sx={{
        backgroundColor: 'ds.bg_color_low',
        boxShadow: isModern ? '0 0 70px 0 rgba(0, 0, 0, 0.75)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        width: '100%',
      }}
      // TODO: remove after removing scss webpack loader
      className={languageSelectionBackground === true ? styles.languageSelectionBackground : ''}
    >
      <Box
        sx={{
          fontWeight: 400,
          display: 'flex',
          flexWrap: 'nowrap',
          minHeight: '100%',
        }}
      >
        {sidebar != null ? sidebarComponent : null}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            backgroundColor: isRevamp ? 'ds.bg_color_low' : 'var(--yoroi-palette-gray-50)',
          }}
        >
          {banner}
          {getContentUnderBanner()}
        </Box>
      </Box>
    </Box>
  );
}

export default (withLayout(observer(TopBarLayout)): ComponentType<Props>);

TopBarLayout.defaultProps = {
  banner: undefined,
  topbar: undefined,
  navbar: undefined,
  sidebar: undefined,
  children: undefined,
  notification: undefined,
  languageSelectionBackground: false,
  showInContainer: false,
  showAsCard: false,
  asModern: false,
  withPadding: true,
  bgcolor: undefined,
};
