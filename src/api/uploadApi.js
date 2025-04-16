import axiosInstance from "./apiBase";

export default {
    uploadImage: async (selectedImageType, file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axiosInstance.post(
                `/v2/file/${selectedImageType}/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            return error.response;
        }
    }
};
