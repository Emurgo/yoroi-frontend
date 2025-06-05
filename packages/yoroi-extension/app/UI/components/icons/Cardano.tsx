import React from 'react';

export const AdaToken = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0 8C0 3.58172 3.58172 0 8 0H24C28.4183 0 32 3.58172 32 8V24C32 28.4183 28.4183 32 24 32H8C3.58172 32 0 28.4183 0 24V8Z"
        fill={props.fill || "currentColor"}
      />
      <defs>
        <pattern id="pattern0_1692_4747" patternContentUnits="objectBoundingBox" width="1" height="1">
          <use transform="scale(0.00833333)" />
        </pattern>
        <image id="image0_1692_4747" width="120" height="120" preserveAspectRatio="none" />
      </defs>
    </svg>
  );
};
