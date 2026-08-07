import {apiPostFormData} from "./apiHelpers";

export default {
  /**
   * 이미지 업로드
   * @returns data에 업로드된 이미지 URL이 담깁니다.
   */
  uploadImage: async (selectedImageType: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiPostFormData<string>(`/v2/file/${selectedImageType}`, formData);
  }
};
