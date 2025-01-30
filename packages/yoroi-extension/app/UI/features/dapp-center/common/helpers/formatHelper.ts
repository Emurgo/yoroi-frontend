// this util helps to build UI as the design, not for calculating
export const formatNumber = (numb: number, fractionDigits: number = 2) => {
  return numb
    .toLocaleString('de-DE', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })
    .replace(/\./g, '');
};
