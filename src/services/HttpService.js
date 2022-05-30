export const HttpService = {
  withBearer: (token) => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  },
};
