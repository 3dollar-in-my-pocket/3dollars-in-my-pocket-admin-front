// Medal acquisition information
export interface MedalAcquisition {
  description?: string;
}

// Medal
export interface Medal {
  medalId: number;
  name: string;
  iconUrl: string;
  disableIconUrl: string;
  introduction: string;
  acquisition: MedalAcquisition | {};
}

// Helper function to check if acquisition exists
export const hasAcquisition = (medal: Medal): boolean => {
  return medal.acquisition && 'description' in medal.acquisition && !!medal.acquisition.description;
};

// Helper function to get acquisition description
export const getAcquisitionDescription = (medal: Medal): string | null => {
  if (hasAcquisition(medal)) {
    return (medal.acquisition as MedalAcquisition).description || null;
  }
  return null;
};
