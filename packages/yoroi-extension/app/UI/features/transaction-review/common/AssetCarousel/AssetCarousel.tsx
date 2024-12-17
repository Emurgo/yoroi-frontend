import { Box } from '@mui/material';
import React, { useState } from 'react';
import Carousel from 'react-simply-carousel';
import { Icon } from '../../../../components';

export const AssetCarousel = ({ data }) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  console.log('data', data);

  return (
    <Box height="40px">
      <Carousel
        activeSlideIndex={activeSlideIndex}
        onRequestChange={setActiveSlideIndex}
        itemsToShow={4}
        itemsToScroll={4}
        forwardBtnProps={{
          //here you can also pass className, or any other button element attributes
          style: {
            alignSelf: 'center',
            border: 'none',
            cursor: 'pointer',

            position: 'absolute',
            top: '16px',
            right: '0',
          },
          children: <Icon.RightArrow />,
        }}
        backwardBtnProps={{
          //here you can also pass className, or any other button element attributes
          style: {
            alignSelf: 'center',
            border: 'none',
            cursor: 'pointer',

            position: 'absolute',
            top: '16px',
            right: '40px',
          },
          children: <Icon.LeftArrow />,
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
                marginRight: '8px',
                padding: '0px',
                position: 'relative',
              }}
            >
              <Box zIndex={1}>
                <img width="48px" height="48px" src={token.info.image} />
              </Box>
              <Box zIndex={20} sx={{ position: 'absolute', width: '100%', height: '100%' }} />
            </Box>
          ))}
      </Carousel>
    </Box>
  );
};
