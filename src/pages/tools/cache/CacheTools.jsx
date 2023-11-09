import React, { useEffect, useRef, useState } from 'react';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { CommonApi, AdminToolsApi } from 'apis';

const CacheTools = () => {
  const [cacheTypes, setCacheTypes] = useState([]);
  const [selectedCacheType, setSelectedCacheType] = useState('');

  const evictCaches= async () => {
    if (selectedCacheType) {
      try {
        await AdminToolsApi.evictAll(selectedCacheType);
      } catch (error) {
        console.error('Error evict caches', error);
      }
    }
  };

  const handleSelectedCache = (e) => {
    setSelectedCacheType(e.target.value)
  };

  useEffect(async () => {
    const { data } = await CommonApi.getEnums();
    console.log(data)
    setCacheTypes(data.data.CacheType);
  }, [])

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>캐시 전체 만료 툴</h2>
      <div>
     <Select
          value={selectedCacheType.description}
          onChange={handleSelectedCache}
          style={{ marginBottom: '20px' }}
        >
          {cacheTypes.map((type) => (
            <MenuItem key={type.key} value={type.key}>
              {type.description}
            </MenuItem>
          ))}
        </Select>
        </div>
        <div>
      {selectedCacheType && (
        <Button
          variant="contained"
          color="secondary"
          onClick={evictCaches}
        >
            캐시 만료시키기
        </Button>
      )}
    </div>
    </div>
  );
};

export default CacheTools;