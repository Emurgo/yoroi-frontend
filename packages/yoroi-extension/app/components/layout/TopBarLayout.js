// @flow
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import styles from './TopBarLayout.scss';
import { withLayout } from '../../styles/context/layout';
import { Box } from '@mui/system';

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
|};

type InjectedProps = {| isRevampLayout: boolean |};
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
  isRevampLayout,
}: Props & InjectedProps) {
  const getContentUnderBanner: void => Node = () => {
    const topbarComponent = <Box sx={{ zIndex: 2 }}>{topbar}</Box>;
    const navbarComponent = <Box sx={{ zIndex: 2 }}>{navbar}</Box>;

    const content = (
      <>
        {topbar != null ? topbarComponent : null}
        {navbar != null ? navbarComponent : null}
        {notification}
        <Box
          sx={{
            position: 'relative',
            overflow: 'auto',
            '&::-webkit-scrollbar-button': {
              height: '7px',
              display: 'block',
            },
            boxShadow: showAsCard === true && '0 2px 12px 0 rgba(0, 0, 0, 0.06)',
            borderRadius: showAsCard === true && '8px',
            ...(showInContainer === true && {
              marginTop: '4px',
              background: 'var(--yoroi-palette-common-white)',
              width: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              flex: '0 1 auto',
              height: '100%',
            }),
          }}
        >
          {isRevampLayout ? (
            <Box sx={{ background: 'var(--yoroi-palette-gray-50)', height: '100%' }}>
              <Box
                sx={{
                  maxWidth: 'calc(1366px - 90px)',
                  height: '100%',
                  width: '100%',
                  margin: 'auto',
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    minHeight: '200px',
                    padding: '40px',
                    backgroundColor: 'var(--yoroi-palette-gray-50)',
                    overflow: 'overlay',
                  }}
                >
                  {children}
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ height: '100%', minHeight: '200px' }}>{children}</Box>
          )}
        </Box>
      </>
    );
    if (showInContainer === true) {
      return isRevampLayout ? (
        <Box
          sx={{
            maxWidth: '100%',
            width: '100%',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 100px)',
          }}
        >
          {content}
        </Box>
      ) : (
        <Box
          sx={{
            height: '100%',
            minHeight: '200px',
            ...(showInContainer === true && {
              maxWidth: '1295px',
              paddingLeft: '40px',
              paddingRight: '40px',
              width: '100%',
              marginLeft: 'auto',
              marginRight: 'auto',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 110px)',
            }),
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
        backgroundColor: 'var(--yoroi-palette-common-white)',
        boxShadow: '0 0 70px 0 rgba(0, 0, 0, 0.75)',
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
            display: 'grid',
            gridTemplateRows: 'auto 1fr',
            position: 'relative',
            background: showInContainer === true && 'var(--yoroi-palette-gray-50)',
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
};
