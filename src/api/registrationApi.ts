import {apiGet, apiPut} from "./apiHelpers";

export default {
  listRegistrations: async ({size}: any) => {
    return apiGet<any>(`/v3/boss-registrations`, {size});
  },
  approveRegistration: async ({id}: any) => {
    return apiPut<any>(`/v3/boss-registration/${id}/apply`, undefined);
  },
  denyRegistration: async ({id, rejectReason}: any) => {
    return apiPut<any>(`/v3/boss-registration/${id}/reject`, {rejectReason});
  },
};
