import axiosInstance from "./apiBase";

export default {
    listAds: async ({application, page, size, position, platform}) => {
        try {
            const response = await axiosInstance(
                {
                    method: "GET",
                    url: `/v1/application/${application}/advertisements`,
                    params: {
                        page,
                        size,
                        ...(position && {position}),
                        ...(platform && {platform}),
                    },
                }
            );
            return response.data;
        } catch (error) {
            return error.response;
        }
    },
}
