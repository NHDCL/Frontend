import { ASSETS_URL } from "../constants";
import { apiSlice } from "./apiSlice";
export const assetApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategory: builder.query({
      query: () => ({
        url: ASSETS_URL + "/categories",
        method: "GET",
      }),
    }),
    getAsset: builder.query({
      query: () => ({
        url: ASSETS_URL + "/assets",
        method: "GET",
      }),
    }),
    getAssetByAcademy: builder.query({
      query: (academyId) => ({
        url: `${ASSETS_URL}/assets/academy/${academyId}`,
        method: "GET",
      }),
    }),
    postAsset: builder.mutation({
      query: (newAsset) => ({
        url: ASSETS_URL + "/assets", // API endpoint for posting assets
        method: "POST",
        body: newAsset, // Send the new asset data as the request body
      }),
    }),
    postUploadImages: builder.mutation({
      query: (formData) => {
        return {
          url: `${ASSETS_URL}/assets/${formData.get("assetID")}/upload-images`, // Get assetID from formData
          method: "POST",
          body: formData,
        };
      },
    }),
    uploadExcel: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: ASSETS_URL + "/assets/upload/excel",
          method: "POST",
          body: formData,
        };
      },
    }),
  }),
});

export const {
  useGetCategoryQuery,
  useGetAssetQuery,
  useGetAssetByAcademyQuery,
  usePostAssetMutation,
  usePostUploadImagesMutation,
  useUploadExcelMutation,
} = assetApiSlice;
