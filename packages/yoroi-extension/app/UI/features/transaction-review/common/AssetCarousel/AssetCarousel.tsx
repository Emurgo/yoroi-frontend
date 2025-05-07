import { Box, styled, useTheme } from '@mui/material';
import React, { useState } from 'react';
import Carousel from 'react-simply-carousel';
import defaultTokenDarkImage from '../../../../../assets/images/revamp/asset-default-dark.inline.svg';
import defaultTokenImage from '../../../../../assets/images/revamp/asset-default.inline.svg';
import { Icon } from '../../../../components';

const IconWrapper: any = styled(Box)(({ theme }: { theme: any }) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));

export const AssetCarousel = ({ data }) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const { name, palette }: any = useTheme();

  const defaultImage = name === 'dark-theme' ? defaultTokenDarkImage : defaultTokenImage;

  return (
    <Box height="40px">
      <Carousel
        containerProps={{
          style: {
            display: 'flex',
            justifyContent: 'flex-start',
            width: '100%',
          }
        }}
        activeSlideIndex={activeSlideIndex}
        onRequestChange={setActiveSlideIndex}
        itemsToShow={4}
        itemsToScroll={4}
        forwardBtnProps={{
          style: {
            alignSelf: 'center',
            border: 'none',
            cursor: 'pointer',
            position: 'absolute',
            top: '16px',
            right: '16px',
            borderRadius: '8px',
            transition: 'background-color 0.3s ease',
          },
          onMouseEnter: e => (e.currentTarget.style.backgroundColor = palette.ds.el_gray_min),
          onMouseLeave: e => (e.currentTarget.style.backgroundColor = 'transparent'),
          children: (
            <IconWrapper>
              <Icon.RightArrow />
            </IconWrapper>
          ),
        }}
        backwardBtnProps={{
          style: {
            alignSelf: 'center',
            border: 'none',
            cursor: 'pointer',
            position: 'absolute',
            top: '16px',
            right: '50px',
            transition: 'background-color 0.3s ease',
            borderRadius: '8px',
          },
          onMouseEnter: e => (e.currentTarget.style.backgroundColor = palette.ds.el_gray_min),
          onMouseLeave: e => (e.currentTarget.style.backgroundColor = 'transparent'),
          children: (
            <IconWrapper>
              <Icon.LeftArrow />
            </IconWrapper>
          ),
        }}
        speed={400}
        easing="linear"
      >
        {data &&
          data.map(token => (
            <Box
              style={{
                width: 50,
                height: 50,
                backgroundColor: 'transparent',
                padding: '0px',
                position: 'relative',
              }}
            >
              <Box zIndex={1}>
                <img
                  width="48px"
                  height="48px"
                  style={{borderRadius: '8px'}}
                  src={token.info.image}
                  onError={(e: any) => {
                    e.target.src = defaultImage;
                  }}
                />
              </Box>
              <Box zIndex={20} sx={{ position: 'absolute', width: '100%', height: '100%'}} />
            </Box>
          ))}
      </Carousel>
    </Box>
  );
};
