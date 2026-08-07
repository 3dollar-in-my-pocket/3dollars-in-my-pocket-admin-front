/** MedalAcquisitionResponse — 획득 조건이 없으면 description이 비어 옵니다. */
export interface MedalAcquisition {
  description?: string;
}

/** MedalResponse */
export interface Medal {
  medalId: number;
  name: string;
  iconUrl: string;
  disableIconUrl: string;
  introduction: string;
  acquisition: MedalAcquisition;
  createdAt?: string;
  updatedAt?: string;
}

// Helper function to check if acquisition exists
export const hasAcquisition = (medal: Medal): boolean => {
  return !!medal.acquisition?.description;
};

// Helper function to get acquisition description
export const getAcquisitionDescription = (medal: Medal): string | null => {
  return medal.acquisition?.description || null;
};
