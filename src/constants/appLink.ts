const {REACT_APP_APP_URI} = import.meta.env;

export const getStoreAppLink = (storeId: number | string) =>
  `${REACT_APP_APP_URI}/store?storeId=${encodeURIComponent(storeId)}`;
