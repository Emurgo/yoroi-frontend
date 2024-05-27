import React from 'react';

const Arrow = props => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M4.30077 8.89366C3.92359 9.32471 4.22971 9.99932 4.80249 9.99932H11.1975C11.7702 9.99932 12.0764 9.32471 11.6992 8.89365L8.50169 5.23938C8.23608 4.93583 7.76386 4.93583 7.49826 5.23938L4.30077 8.89366Z"
        fill={props.fill}
      />
    </svg>
  );
};

export default Arrow;
