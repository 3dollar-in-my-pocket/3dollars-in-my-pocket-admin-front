export const RegistrationResponse = (data) => {
  return {
    registrationId: data.registrationId,
    boss: {
      socialType: data.boss.socialType,
      name: data.boss.name,
      businessNumber: data.boss.businessNumber,
    },
    store: {
      name: data.store.name,
      categories: data.store.categories,
      contactsNumber: data.store.contactsNumber,
      certificationPhotoUrl: data.store.certificationPhotoUrl,
    },
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};
