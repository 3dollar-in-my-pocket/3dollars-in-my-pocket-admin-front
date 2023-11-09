import React, { useEffect, useRef, useState } from 'react';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { CommonApi, AdminToolsApi } from 'apis';

const CacheTools = () => {
  const [cacheTypes, setCacheTypes] = useState([]);
  const [selectedCacheType, setSelectedCacheType] = useState('');

  const evictCaches= async () => {
    if (!selectedCacheType) {
      alert('선택된 캐시 타입이 없습니다')
    }

    if (!window.confirm('정말로 캐시를 제거하겠습니까?')) {
      return
    }

      try {
        await AdminToolsApi.evictAll(selectedCacheType);
        alert('캐시가 제거되었습니다')
      } catch (error) {
        if (!error.response) {
          alert('서버 연결중 에러가 발생하였습니다\n잠시후 다시 시도해주세요');
        } else {
          alert(error.response.data.message);
        }
      }
  };

  const handleSelectedCache = (e) => {
    try {
    setSelectedCacheType(e.target.value)
    } catch(error) {
      if (!error.response) {
        alert('서버 연결중 에러가 발생하였습니다\n잠시후 다시 시도해주세요');
      } else {
        alert(error.response.data.message);
      }
    }
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