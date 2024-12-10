import React, { useState } from 'react';
import Carousel from 'react-simply-carousel';

export const AssetCarousel = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <div>
      <Carousel
        containerProps={{
          style: {
            width: '100%',
            justifyContent: 'space-between',
            userSelect: 'none',
          },
        }}
        preventScrollOnSwipe
        swipeTreshold={60}
        activeSlideIndex={activeSlide}
        activeSlideProps={{
          style: {
            background: 'blue',
          },
        }}
        onRequestChange={setActiveSlide}
        forwardBtnProps={{
          children: '>',
          style: {
            width: 60,
            height: 60,
            minWidth: 60,
            alignSelf: 'center',
          },
        }}
        backwardBtnProps={{
          children: '<',
          style: {
            width: 60,
            height: 60,
            minWidth: 60,
            alignSelf: 'center',
          },
        }}
        dotsNav={{
          show: true,
          itemBtnProps: {
            style: {
              height: 16,
              width: 16,
              borderRadius: '50%',
              border: 0,
            },
          },
          activeItemBtnProps: {
            style: {
              height: 16,
              width: 16,
              borderRadius: '50%',
              border: 0,
              background: 'black',
            },
          },
        }}
        itemsToShow={2}
        speed={400}
        centerMode
      >
        {Array.from({ length: 10 }).map((item, index) => (
          <div
            style={{
              background: 'yellow',
              width: 300,
              height: 300,
              border: '30px solid white',
              textAlign: 'center',
              lineHeight: '240px',
              boxSizing: 'border-box',
            }}
            key={index}
          >
            {index}
          </div>
        ))}
      </Carousel>
    </div>
  );
};
