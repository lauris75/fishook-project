export const formatDecimal = (value) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '';
  }
  
  return numValue.toFixed(3).replace(/\.?0+$/, '');
};