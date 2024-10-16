// @flow
import { Box } from '@mui/system';
import { observer } from 'mobx-react';
import type { Node, ComponentType } from 'react';
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
  +withPadding?: boolean, // default: true
  +bgcolor?: string,
  +isErrorPage?: boolean,
|};

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
  withPadding,
  bgcolor,
  isErrorPage,
}: Props) {
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
            boxShadow: false,
            borderRadius: false,
            ...(showInContainer === true && {
              bgcolor: 'ds.bg_color_max',
              width: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              flex: '0 1 auto',
              height: '100%',
            }),
            overflow: 'auto',
          }}
        >
          <Box
            sx={{
              bgcolor: bgcolor || 'ds.bg_color_max',
              height: !isErrorPage ? '100%' : 'auto',
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
                  padding: typeof withPadding === 'undefined' || withPadding === true ? '24px' : '0px',
                  pb: 0,
                  bgcolor: 'ds.bg_color_max',
                }}
              >
                {children}
              </Box>
            </Box>
          </Box>
        </Box>
      </>
    );

    if (showInContainer === true) {
      return (
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
      );
    }
    return content;
  };

  const sidebarComponent = <Box sx={{ flex: '1 0 auto' }}>{sidebar}</Box>;

  return (
    <Box
      sx={{
        backgroundColor: 'ds.bg_color_max',
        boxShadow: 'none',
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
            backgroundColor: 'ds.bg_color_max',
          }}
        >
          {banner}
          {getContentUnderBanner()}
        </Box>
      </Box>
    </Box>
  );
}

export default (observer(TopBarLayout): ComponentType<Props>);

TopBarLayout.defaultProps = {
  banner: undefined,
  topbar: undefined,
  navbar: undefined,
  sidebar: undefined,
  children: undefined,
  notification: undefined,
  languageSelectionBackground: false,
  showInContainer: false,
  withPadding: true,
  bgcolor: undefined,
};
