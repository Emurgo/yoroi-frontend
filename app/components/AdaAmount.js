import React from 'react';
import PropTypes from 'prop-types';
import NumberFormat from 'react-number-format';

const AdaAmount = ({ amount, showSuffix = true }) => {
  const suffix = showSuffix ? ' ADA' : '';
  return (
    <NumberFormat
      thousandSeparator
      value={Number(amount) / 1000000}
      fixedDecimalScale
      decimalScale="6"
      displayType="text"
      suffix={suffix}
    />
  );
};

export default AdaAmount;
