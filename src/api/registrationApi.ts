import {apiGetPaginated, apiPut} from "./apiHelpers";
import {BossRegistration} from "@/types/registration";

interface ListRegistrationsParams {
  cursor?: string | null;
  size?: number;
}

export default {
  listRegistrations: async ({cursor, size}: ListRegistrationsParams) => {
    return apiGetPaginated<BossRegistration>(`/v3/boss-registrations`, {cursor, size});
  },
  approveRegistration: async ({id}: { id: string }) => {
    return apiPut<void>(`/v3/boss-registration/${id}/apply`, undefined);
  },
  denyRegistration: async ({id, rejectReason}: { id: string; rejectReason: string }) => {
    return apiPut<void>(`/v3/boss-registration/${id}/reject`, {rejectReason});
  },
};
