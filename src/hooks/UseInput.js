import { useState, useCallback } from 'react';

export const UseInput = (initialValue = '') => {
  const [value, setValue] = useState(initialValue);
  const onChange = useCallback((e) => {
    setValue(e.target.value);
  });
  return [value, onChange, setValue];
};
